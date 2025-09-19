'use client';

import {Button} from '@heroui/button';
import {Checkbox} from '@heroui/checkbox';
import {Prisma} from '@prisma/client';
import {FC, useCallback, useEffect, useState} from 'react';

import {updateRolePermissionAction} from './_action/action';

import {GroupedPermission} from '@/types';
import {toastError, toastSuccess} from '@/helpers/toast.helper';

interface Props {
    id: string;
    permissions: GroupedPermission[];
    currentPermissions: {subject: string; action: string[]}[];
}

const Table: FC<Props> = ({id, permissions, currentPermissions}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [selected, setSelected] = useState<Map<string, Map<string, string>>>(new Map());

    const onSubmit = useCallback(async () => {
        try {
            setLoading(true);

            // Convert selected to an array of objects
            const selectedPermissions = Array.from(selected).map(([group, actions]) => ({
                subject: group,
                action: Array.from(actions).map(([action]) => action),
            }));

            const result = await updateRolePermissionAction(id, selectedPermissions);

            if (!result.success) throw new Error(result.message);

            toastSuccess('Permission saved')(result.message);
        } catch (error) {
            if (error instanceof Error) toastError('Failed to save permission')(error.message);
        } finally {
            setLoading(false);
        }
    }, [id, selected]);

    // Convert currentPermissions to Map
    useEffect(() => {
        const currentPermissionsMap = new Map();

        currentPermissions.forEach((permission) => {
            currentPermissionsMap.set(permission.subject, new Map(permission.action.map((action) => [action, action])));
        });

        setSelected(new Map(currentPermissionsMap));
    }, [currentPermissions]);

    return (
        <div className='flex w-full flex-col gap-4 pb-6'>
            <div className='flex items-center justify-between'>
                <h1>
                    {
                        // Convert selected to an array of objects
                        Array.from(selected).reduce((acc, [group, actions]) => {
                            return acc + Array.from(actions).length;
                        }, 0)
                    }{' '}
                    permission selected
                </h1>
                <Button
                    color='primary'
                    isLoading={loading}
                    radius='full'
                    onClick={onSubmit}
                >
                    Save
                </Button>
            </div>

            {permissions.map((data) => (
                <div
                    key={data.group}
                    className='flex w-full flex-col gap-4'
                >
                    <h1 className='text-sm font-bold'>{data.group}</h1>
                    <div className='grid w-full grid-cols-3 gap-6'>
                        {data.permissions.map((permission) => (
                            <div
                                key={permission.id}
                                className='flex w-full flex-col gap-4 rounded-xl bg-default-100 p-4'
                            >
                                <div className='flex flex-col gap-1'>
                                    <h1 className='text-sm font-medium'>{permission.name}</h1>
                                    <p className='text-sm text-default-400'>{permission.description}</p>
                                </div>
                                {(permission.actions as Prisma.JsonValue[])?.map((action) => (
                                    <Checkbox
                                        key={action as string}
                                        className='capitalize'
                                        classNames={{
                                            label: 'text-sm',
                                        }}
                                        defaultChecked={selected.get(permission.subject)?.has(action as string)}
                                        isSelected={selected.get(permission.subject)?.has(action as string)}
                                        onValueChange={() => {
                                            if (selected.get(permission.subject)?.has(action as string)) {
                                                selected.get(permission.subject)?.delete(action as string);
                                            } else {
                                                if (!selected.has(permission.subject)) {
                                                    selected.set(permission.subject, new Map());
                                                }

                                                selected.get(permission.subject)?.set(action as string, action as string);
                                            }

                                            setSelected(new Map(selected));
                                        }}
                                    >
                                        {action as string}
                                    </Checkbox>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Table;
