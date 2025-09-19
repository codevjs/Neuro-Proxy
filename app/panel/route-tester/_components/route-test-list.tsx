'use client';

import {Button} from '@heroui/button';
import {Card, CardBody} from '@heroui/card';
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from '@heroui/table';
import {Chip} from '@heroui/chip';
import {useState, useCallback, useEffect} from 'react';
import {toast} from 'sonner';
import {Route, Globe, RefreshCw, TestTube, ArrowRight} from 'lucide-react';
import {useRouter} from '@bprogress/next';

import {getAllRoutesAction} from '../../scaling/_action/action';

import {Can} from '@/contexts/casl.context';

interface RouteInfo {
    name: string;
    rule: string;
    service: string;
    container: string;
    port: string;
    replicas: number;
    canScale: boolean;
}

export default function RouteTestList() {
    const [routes, setRoutes] = useState<RouteInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const loadRoutes = useCallback(async () => {
        try {
            setLoading(true);
            const result = await getAllRoutesAction();

            if (result.success) {
                // Filter out kalla_proxy routes from testing
                const filteredRoutes = (result.data || []).filter(
                    (route) => !route.name.includes('kalla_proxy') && !route.service.includes('kalla_proxy')
                );

                setRoutes(filteredRoutes);
            } else {
                toast.error(result.error || 'Failed to load routes');
            }
        } catch (error) {
            toast.error('Failed to load routes');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRoutes();
    }, [loadRoutes]);

    const getRuleDisplay = (rule: string): string => {
        if (rule.includes('PathPrefix')) {
            const match = rule.match(/PathPrefix\(`([^`]+)`\)/);

            return match ? match[1] : rule;
        }

        return rule;
    };

    const getTestUrl = (rule: string): string => {
        const path = getRuleDisplay(rule);

        return path;
    };

    const handleTestRoute = (routeName: string): void => {
        router.push(`/panel/route-tester/${encodeURIComponent(routeName)}`);
    };

    const renderCell = useCallback(
        (route: RouteInfo, columnKey: React.Key): React.ReactElement | null => {
            switch (columnKey) {
                case 'route':
                    return (
                        <div className='flex flex-col'>
                            <div className='flex items-center gap-2'>
                                <Route className='h-4 w-4 text-primary' />
                                <span className='font-semibold'>{route.name}</span>
                            </div>
                            <div className='mt-1 flex items-center gap-1'>
                                <Globe className='h-3 w-3 text-default-400' />
                                <span className='text-xs text-default-500'>{getRuleDisplay(route.rule)}</span>
                            </div>
                        </div>
                    );
                case 'service':
                    return (
                        <div className='flex flex-col'>
                            <span className='text-sm font-medium'>{route.service}</span>
                            <span className='text-xs text-default-500'>
                                {route.container}:{route.port}
                            </span>
                        </div>
                    );
                case 'url':
                    return (
                        <div className='flex items-center gap-2'>
                            <code className='rounded bg-default-100 px-2 py-1 text-xs'>{getTestUrl(route.rule)}</code>
                        </div>
                    );
                case 'status':
                    return (
                        <div className='flex items-center gap-2'>
                            <Chip
                                color='success'
                                size='sm'
                                variant='flat'
                            >
                                Active
                            </Chip>
                            {route.replicas > 0 && (
                                <span className='text-xs text-default-500'>
                                    +{route.replicas} replica{route.replicas > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    );
                case 'actions':
                    return (
                        <div className='flex items-center gap-2'>
                            <Can
                                I='read'
                                a='Router'
                            >
                                <Button
                                    color='primary'
                                    endContent={<ArrowRight className='h-3 w-3' />}
                                    size='sm'
                                    startContent={<TestTube className='h-4 w-4' />}
                                    variant='flat'
                                    onPress={() => handleTestRoute(route.name)}
                                >
                                    Test Route
                                </Button>
                            </Can>
                        </div>
                    );
                default:
                    return null;
            }
        },
        [router]
    );

    return (
        <div className='flex flex-col gap-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    <Chip
                        color='primary'
                        size='sm'
                    >
                        {routes.length} Routes
                    </Chip>
                </div>

                <Button
                    isLoading={loading}
                    startContent={<RefreshCw className='h-4 w-4' />}
                    variant='flat'
                    onPress={loadRoutes}
                >
                    Refresh
                </Button>
            </div>

            {/* Routes Table */}
            <Card>
                <CardBody className='p-0'>
                    <Table aria-label='Routes testing table'>
                        <TableHeader>
                            <TableColumn key='route'>Route</TableColumn>
                            <TableColumn key='service'>Service</TableColumn>
                            <TableColumn key='url'>Test URL</TableColumn>
                            <TableColumn key='status'>Status</TableColumn>
                            <TableColumn key='actions'>Actions</TableColumn>
                        </TableHeader>
                        <TableBody
                            emptyContent='No routes found.'
                            items={routes}
                            loadingContent='Loading routes...'
                            loadingState={loading ? 'loading' : 'idle'}
                        >
                            {(route) => <TableRow key={route.name}>{(columnKey) => <TableCell>{renderCell(route, columnKey)}</TableCell>}</TableRow>}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>
        </div>
    );
}
