'use client';

import {Button} from '@heroui/button';
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from '@heroui/modal';
import React from 'react';
import {FC, useState} from 'react';

interface Props {
    trigger: React.ReactElement;
    title: string;
    message: string;
    okText?: string;
    cancelText?: string;
    type?: 'danger' | 'primary' | 'default' | 'secondary' | 'success' | 'warning';
    onOk?: () => Promise<void>;
}

const AlertDialog: FC<Props> = ({trigger, title, message, type, okText, cancelText, onOk}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    return (
        <>
            {React.cloneElement(trigger, {onClick: onOpen})}
            <Modal
                backdrop='blur'
                isDismissable={false}
                isOpen={isOpen}
                placement='center'
                size='xs'
                onOpenChange={onOpenChange}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className={`flex flex-col gap-1 pb-0 ${type === 'primary' ? 'text-primary' : 'text-danger'}`}>
                                {title}
                            </ModalHeader>
                            <ModalBody className=''>
                                <p>{message}</p>
                            </ModalBody>
                            <ModalFooter className='py-2'>
                                <Button
                                    color='danger'
                                    isDisabled={loading}
                                    variant='light'
                                    onPress={onClose}
                                >
                                    {cancelText ?? 'Close'}
                                </Button>
                                <Button
                                    color={type ?? 'danger'}
                                    isLoading={loading}
                                    onPress={async () => {
                                        setLoading(true);
                                        await onOk?.();
                                        setLoading(false);
                                        onClose();
                                    }}
                                >
                                    {okText ?? 'Action'}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};

export default AlertDialog;
