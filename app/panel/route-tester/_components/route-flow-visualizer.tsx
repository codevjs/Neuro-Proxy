'use client';

import {Button} from '@heroui/button';
import {Card, CardBody, CardHeader} from '@heroui/card';
import {Input} from '@heroui/input';
import {Chip} from '@heroui/chip';
import {useState, useCallback, useEffect} from 'react';
import {toast} from 'sonner';
import {ArrowRight, Globe, Shield, Server, Play, Loader2, CheckCircle, XCircle, Clock, ArrowLeft, Plus, Trash2, Settings} from 'lucide-react';
import {motion, AnimatePresence} from 'framer-motion';
import {useRouter} from '@bprogress/next';
import {Code} from '@heroui/code';

import {getRouteDetailsAction, testRouteAction} from '../_action/action';

interface RouteDetails {
    name: string;
    rule: string;
    service: string;
    middlewares: string[];
    entryPoints: string[];
    priority?: number;
    serviceUrl?: string;
    middlewareChain: MiddlewareInfo[];
}

interface MiddlewareInfo {
    name: string;
    type: 'basicAuth' | 'ipwhitelist' | 'stripprefix' | 'headers' | 'plugin' | 'unknown';
    config: Record<string, unknown>;
}

interface TestResult {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    responseTime: number;
    url: string;
    redirected: boolean;
    ok: boolean;
    body?: string;
}

interface Props {
    routeName: string;
}

export default function RouteFlowVisualizer({routeName}: Props) {
    const [routeDetails, setRouteDetails] = useState<RouteDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<TestResult | null>(null);
    const [testError, setTestError] = useState<string | null>(null);
    const [testUrl, setTestUrl] = useState('');
    const [animationStep, setAnimationStep] = useState(0);
    const [customHeaders, setCustomHeaders] = useState<Record<string, string>>({});
    const [showHeaders, setShowHeaders] = useState(false);
    const [headerKey, setHeaderKey] = useState('');
    const [headerValue, setHeaderValue] = useState('');
    const router = useRouter();

    const loadRouteDetails = useCallback(async () => {
        try {
            setLoading(true);
            const result = await getRouteDetailsAction(routeName);

            if (result.success && result.data) {
                setRouteDetails(result.data);
                // Set default test URL using current host
                const path = getRuleDisplay(result.data.rule);
                const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
                const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';

                setTestUrl(`${protocol}//${host}${path}`);
            } else {
                toast.error(result.error || 'Failed to load route details');
            }
        } catch (error) {
            toast.error('Failed to load route details');
        } finally {
            setLoading(false);
        }
    }, [routeName]);

    useEffect(() => {
        loadRouteDetails();
    }, [loadRouteDetails]);

    const getRuleDisplay = (rule: string): string => {
        if (rule.includes('PathPrefix')) {
            const match = rule.match(/PathPrefix\(`([^`]+)`\)/);

            return match ? match[1] : rule;
        }

        return rule;
    };

    const getMiddlewareIcon = (type: string): React.ReactElement => {
        switch (type) {
            case 'basicAuth':
                return <Shield className='h-4 w-4 text-content1' />;
            case 'ipwhitelist':
                return <Globe className='h-4 w-4 text-content1' />;
            case 'stripprefix':
                return <ArrowRight className='h-4 w-4 text-content1' />;
            case 'headers':
                return <Settings className='h-4 w-4 text-content1' />;
            case 'plugin':
                return <Shield className='h-4 w-4 text-content1' />;
            default:
                return <Settings className='h-4 w-4 text-content1' />;
        }
    };

    const getMiddlewareColor = (type: string): 'warning' | 'secondary' | 'primary' | 'success' | 'default' => {
        switch (type) {
            case 'basicAuth':
                return 'warning';
            case 'ipwhitelist':
                return 'secondary';
            case 'stripprefix':
                return 'primary';
            case 'headers':
                return 'success';
            case 'plugin':
                return 'success';
            default:
                return 'default';
        }
    };

    const handleTest = async () => {
        if (!testUrl || !routeDetails) return;

        setTesting(true);
        setTestResult(null);
        setTestError(null);
        setAnimationStep(0);

        // Start animation sequence
        const totalSteps = 1 + routeDetails.middlewareChain.length; // Client -> Middlewares -> Service

        for (let step = 0; step <= totalSteps; step++) {
            setAnimationStep(step);
            await new Promise((resolve) => setTimeout(resolve, 800));
        }

        try {
            const result = await testRouteAction(routeName, testUrl, customHeaders);

            if (result.success) {
                setTestResult(result.data);
                toast.success(`Request completed in ${result.data.responseTime}ms`);
            } else {
                setTestError(result.error || 'Test failed');
                toast.error(result.error || 'Test failed');
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Test failed';

            setTestError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setTesting(false);
            // Keep animation visible for result
        }
    };

    const addCustomHeader = (): void => {
        if (headerKey.trim() && headerValue.trim()) {
            setCustomHeaders((prev) => ({
                ...prev,
                [headerKey.trim()]: headerValue.trim(),
            }));
            setHeaderKey('');
            setHeaderValue('');
        }
    };

    const removeCustomHeader = (key: string): void => {
        setCustomHeaders((prev) => {
            const newHeaders = {...prev};

            delete newHeaders[key];

            return newHeaders;
        });
    };

    if (loading) {
        return (
            <div className='flex items-center justify-center py-12'>
                <Loader2 className='h-8 w-8 animate-spin' />
            </div>
        );
    }

    if (!routeDetails) {
        return (
            <Card>
                <CardBody className='py-12 text-center'>
                    <XCircle className='mx-auto mb-4 h-12 w-12 text-danger' />
                    <h3 className='mb-2 text-lg font-semibold'>Route Not Found</h3>
                    <p className='text-default-500'>The route "{routeName}" could not be found in the Traefik configuration.</p>
                </CardBody>
            </Card>
        );
    }

    const totalSteps = 1 + routeDetails.middlewareChain.length;

    return (
        <div className='flex flex-col gap-6'>
            {/* Back Button */}
            <Button
                className='self-start'
                startContent={<ArrowLeft className='h-4 w-4' />}
                variant='flat'
                onPress={() => router.push('/panel/route-tester')}
            >
                Back to Routes
            </Button>

            {/* Route Information */}
            <Card>
                <CardHeader>
                    <h3 className='text-lg font-semibold'>Route Information</h3>
                </CardHeader>
                <CardBody className='space-y-4'>
                    <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                        <div>
                            <p className='text-sm text-default-500'>Route Name</p>
                            <p className='font-medium'>{routeDetails.name}</p>
                        </div>
                        <div>
                            <p className='text-sm text-default-500'>Rule</p>
                            <p className='font-medium'>{getRuleDisplay(routeDetails.rule)}</p>
                        </div>
                        <div>
                            <p className='text-sm text-default-500'>Service</p>
                            <p className='font-medium'>{routeDetails.service}</p>
                        </div>
                        <div>
                            <p className='text-sm text-default-500'>Priority</p>
                            <p className='font-medium'>{routeDetails.priority || 'Default'}</p>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Test Controls */}
            <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                    <h3 className='text-lg font-semibold'>Test Route</h3>
                    <Button
                        size='sm'
                        startContent={<Settings className='h-3 w-3' />}
                        variant='flat'
                        onPress={() => setShowHeaders(!showHeaders)}
                    >
                        {showHeaders ? 'Hide' : 'Show'} Headers
                    </Button>
                </CardHeader>
                <CardBody className='space-y-4'>
                    <div className='flex items-center gap-4'>
                        <Input
                            className='flex-1'
                            label='Test URL'
                            placeholder='http://localhost/path'
                            radius='full'
                            value={testUrl}
                            onValueChange={setTestUrl}
                        />
                        <Button
                            color='primary'
                            isDisabled={!testUrl.trim()}
                            isLoading={testing}
                            radius='full'
                            startContent={testing ? undefined : <Play className='h-4 w-4' />}
                            onPress={handleTest}
                        >
                            {testing ? 'Testing...' : 'Test Route'}
                        </Button>
                    </div>

                    {/* Custom Headers Section */}
                    {showHeaders && (
                        <div className='space-y-4 border-t pt-4'>
                            <div className='flex items-center gap-2'>
                                <h4 className='text-sm font-medium'>Custom Headers</h4>
                                <Chip
                                    color='secondary'
                                    size='sm'
                                    variant='flat'
                                >
                                    {Object.keys(customHeaders).length} headers
                                </Chip>
                            </div>

                            {/* Add Header Form */}
                            <div className='flex gap-2'>
                                <Input
                                    className='flex-1'
                                    placeholder='Header Name'
                                    size='sm'
                                    value={headerKey}
                                    onValueChange={setHeaderKey}
                                />
                                <Input
                                    className='flex-1'
                                    placeholder='Header Value'
                                    size='sm'
                                    value={headerValue}
                                    onValueChange={setHeaderValue}
                                />
                                <Button
                                    color='primary'
                                    isDisabled={!headerKey.trim() || !headerValue.trim()}
                                    size='sm'
                                    startContent={<Plus className='h-3 w-3' />}
                                    variant='flat'
                                    onPress={addCustomHeader}
                                >
                                    Add
                                </Button>
                            </div>

                            {/* Headers List */}
                            {Object.keys(customHeaders).length > 0 && (
                                <div className='space-y-2'>
                                    {Object.entries(customHeaders).map(([key, value]) => (
                                        <div
                                            key={key}
                                            className='flex items-center gap-2 rounded-md bg-default-50 p-2'
                                        >
                                            <Code
                                                className='flex-1'
                                                size='sm'
                                            >
                                                {key}: {value}
                                            </Code>
                                            <Button
                                                isIconOnly
                                                color='danger'
                                                size='sm'
                                                variant='flat'
                                                onPress={() => removeCustomHeader(key)}
                                            >
                                                <Trash2 className='h-3 w-3' />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Flow Visualization */}
            <Card>
                <CardHeader>
                    <h3 className='text-lg font-semibold'>Request Flow</h3>
                </CardHeader>
                <CardBody className='p-6'>
                    <div className='flex items-center justify-center'>
                        <div className='flex min-w-full items-center gap-8 overflow-x-auto pb-4'>
                            {/* Client */}
                            <motion.div
                                animate={{
                                    scale: animationStep >= 0 && testing ? 1.1 : 1,
                                    opacity: animationStep >= 0 && testing ? 1 : 0.6,
                                }}
                                style={{
                                    display: 'flex',
                                    minWidth: '5rem',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}
                            >
                                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary-100'>
                                    <Globe className='h-6 w-6 text-content1' />
                                </div>
                                <span className='text-sm font-medium text-content1'>Client</span>
                            </motion.div>

                            {/* Arrow to first middleware or service */}
                            <motion.div
                                animate={{
                                    opacity: animationStep >= 1 && testing ? 1 : 0.3,
                                }}
                                transition={{duration: 0.5}}
                            >
                                <ArrowRight className='h-6 w-6 text-default-400' />
                            </motion.div>

                            {/* Middlewares */}
                            {routeDetails.middlewareChain.map((middleware, index) => (
                                <div
                                    key={middleware.name}
                                    className='flex items-center gap-8'
                                >
                                    <motion.div
                                        animate={{
                                            scale: animationStep >= index + 1 && testing ? 1.1 : 1,
                                            opacity: animationStep >= index + 1 && testing ? 1 : 0.6,
                                        }}
                                        style={{
                                            display: 'flex',
                                            minWidth: '5rem',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                        }}
                                        transition={{duration: 0.5}}
                                    >
                                        <div
                                            className={`flex h-12 w-12 items-center justify-center rounded-full ${
                                                getMiddlewareColor(middleware.type) === 'warning'
                                                    ? 'bg-warning-100'
                                                    : getMiddlewareColor(middleware.type) === 'secondary'
                                                      ? 'bg-secondary-100'
                                                      : getMiddlewareColor(middleware.type) === 'primary'
                                                        ? 'bg-primary-100'
                                                        : getMiddlewareColor(middleware.type) === 'success'
                                                          ? 'bg-success-100'
                                                          : 'bg-default-100'
                                            }`}
                                        >
                                            {getMiddlewareIcon(middleware.type)}
                                        </div>
                                        <span className='text-center text-sm font-medium'>{middleware.name}</span>
                                        <Chip
                                            color={getMiddlewareColor(middleware.type) as any}
                                            size='sm'
                                            variant='flat'
                                        >
                                            {middleware.type}
                                        </Chip>
                                    </motion.div>

                                    <motion.div
                                        animate={{
                                            opacity: animationStep >= index + 2 && testing ? 1 : 0.3,
                                        }}
                                        transition={{duration: 0.5}}
                                    >
                                        <ArrowRight className='h-6 w-6 text-default-400' />
                                    </motion.div>
                                </div>
                            ))}

                            {/* Service */}
                            <motion.div
                                animate={{
                                    scale: animationStep > totalSteps && testing ? 1.1 : 1,
                                    opacity: animationStep > totalSteps && testing ? 1 : 0.6,
                                }}
                                style={{
                                    display: 'flex',
                                    minWidth: '5rem',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}
                                transition={{duration: 0.5}}
                            >
                                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-success-100'>
                                    <Server className='h-6 w-6 text-success' />
                                </div>
                                <span className='text-sm font-medium'>{routeDetails.service}</span>
                                {routeDetails.serviceUrl && (
                                    <span className='max-w-20 break-all text-center text-xs text-default-500'>
                                        {routeDetails.serviceUrl.replace('http://', '')}
                                    </span>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Test Results */}
            <AnimatePresence>
                {(testResult || testError) && (
                    <motion.div
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -20}}
                        initial={{opacity: 0, y: 20}}
                    >
                        <Card>
                            <CardHeader className='flex flex-row items-center gap-3'>
                                {testResult?.ok ? <CheckCircle className='h-6 w-6 text-success' /> : <XCircle className='h-6 w-6 text-danger' />}
                                <div>
                                    <h3 className='text-lg font-semibold'>{testResult ? 'Test Results' : 'Test Failed'}</h3>
                                    {testResult && (
                                        <div className='flex items-center gap-4 text-sm text-default-500'>
                                            <span>
                                                Status: {testResult.status} {testResult.statusText}
                                            </span>
                                            <span className='flex items-center gap-1'>
                                                <Clock className='h-3 w-3' />
                                                {testResult.responseTime}ms
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardBody className='space-y-4'>
                                {testError && (
                                    <div className='rounded-lg border border-danger-200 bg-danger-50 p-4'>
                                        <p className='text-danger-700'>{testError}</p>
                                    </div>
                                )}

                                {testResult && (
                                    <div className='space-y-4'>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div>
                                                <p className='mb-2 text-sm text-default-500'>Response Headers</p>
                                                <div className='max-h-40 overflow-y-auto rounded-lg bg-default-50 p-3'>
                                                    <pre className='text-xs'>{JSON.stringify(testResult.headers, null, 2)}</pre>
                                                </div>
                                            </div>
                                            <div>
                                                <p className='mb-2 text-sm text-default-500'>Response Body Preview</p>
                                                <div className='max-h-40 overflow-y-auto rounded-lg bg-default-50 p-3'>
                                                    <pre className='whitespace-pre-wrap break-words text-xs'>
                                                        {testResult.body || '[Empty response]'}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
