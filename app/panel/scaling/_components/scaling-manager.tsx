'use client';

import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/table';
import { Chip } from '@heroui/chip';
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Minus, RefreshCw, Route, Globe } from 'lucide-react';

import { scaleUpAction, scaleDownAction, getAllRoutesAction } from '../_action/action';

import { Can } from '@/contexts/casl.context';

interface RouteInfo {
    name: string;
    rule: string;
    service: string;
    container: string;
    port: string;
    replicas: number;
    canScale: boolean;
}

export default function ScalingManager() {
    const [routes, setRoutes] = useState<RouteInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const loadRoutes = useCallback(async () => {
        try {
            setLoading(true);
            const result = await getAllRoutesAction();

            if (result.success) {
                // Filter out neuro_proxy routes from scaling
                const filteredRoutes = (result.data || []).filter(
                    (route) => !route.name.includes('neuro_proxy') && !route.service.includes('neuro_proxy')
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

    const handleScaleUp = async (route: RouteInfo) => {
        try {
            setActionLoading(`scale-up-${route.service}`);
            const result = await scaleUpAction(route.service, route.container, route.port);

            if (result.success) {
                toast.success(result.message);
                await loadRoutes();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Failed to scale up service');
        } finally {
            setActionLoading(null);
        }
    };

    const handleScaleDown = async (route: RouteInfo) => {
        try {
            setActionLoading(`scale-down-${route.service}`);
            const result = await scaleDownAction(route.service);

            if (result.success) {
                toast.success(result.message);
                await loadRoutes();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Failed to scale down service');
        } finally {
            setActionLoading(null);
        }
    };

    const getRuleDisplay = (rule: string) => {
        if (rule.includes('PathPrefix')) {
            const match = rule.match(/PathPrefix\(`([^`]+)`\)/);

            return match ? match[1] : rule;
        }

        return rule;
    };

    const renderCell = useCallback(
        (route: RouteInfo, columnKey: React.Key) => {
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
                case 'replicas':
                    return (
                        <div className='flex items-center gap-2'>
                            <Chip
                                color={route.replicas > 0 ? 'success' : 'default'}
                                size='sm'
                            >
                                {route.replicas + 1} instances
                            </Chip>
                            {route.replicas > 0 && (
                                <span className='text-xs text-default-500'>
                                    (+{route.replicas} replica{route.replicas > 1 ? 's' : ''})
                                </span>
                            )}
                        </div>
                    );
                case 'actions':
                    if (!route.canScale) {
                        return (
                            <Chip
                                color='default'
                                size='sm'
                                variant='flat'
                            >
                                Not scalable
                            </Chip>
                        );
                    }

                    return (
                        <div className='flex items-center gap-2'>
                            <Can
                                I='delete'
                                a='Container'
                            >
                                <Button
                                    isIconOnly
                                    color='warning'
                                    isDisabled={route.replicas === 0}
                                    isLoading={actionLoading === `scale-down-${route.service}`}
                                    size='sm'
                                    variant='flat'
                                    onPress={() => handleScaleDown(route)}
                                >
                                    <Minus className='h-4 w-4' />
                                </Button>
                            </Can>

                            <span className='min-w-4 text-center text-sm font-medium'>{route.replicas}</span>

                            <Can
                                I='create'
                                a='Container'
                            >
                                <Button
                                    isIconOnly
                                    color='success'
                                    isLoading={actionLoading === `scale-up-${route.service}`}
                                    size='sm'
                                    variant='flat'
                                    onPress={() => handleScaleUp(route)}
                                >
                                    <Plus className='h-4 w-4' />
                                </Button>
                            </Can>
                        </div>
                    );
                default:
                    return null;
            }
        },
        [actionLoading, handleScaleUp, handleScaleDown, getRuleDisplay]
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
                        {routes.filter((r) => r.canScale).length} Scalable Routes
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
                    <Table aria-label='Routes scaling table'>
                        <TableHeader>
                            <TableColumn key='route'>Route</TableColumn>
                            <TableColumn key='service'>Service</TableColumn>
                            <TableColumn key='replicas'>Instance</TableColumn>
                            <TableColumn key='actions'>Scaling</TableColumn>
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
