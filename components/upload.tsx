'use client';

import {ImageUp} from 'lucide-react';
import {forwardRef, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import {Progress} from '@heroui/progress';
import {Input, InputProps} from '@heroui/input';
import {Button} from '@heroui/button';

import {useUpload} from '@/hooks/use-upload.hook';
import {toastError} from '@/helpers/toast.helper';

export const ImageUpload = forwardRef<HTMLInputElement, InputProps & {preview?: boolean; link?: string}>(
    ({label, description, placeholder, isRequired, isInvalid, errorMessage, value, preview, link, onChange}, ref) => {
        const {loading, progress, uploadForm} = useUpload('/api/upload');
        const [file, setFile] = useState<File>();

        const {getRootProps, getInputProps, open} = useDropzone({
            noClick: true,
            noDrag: true,
            multiple: false,
            maxSize: 2 * 1024 * 1024,
            accept: {'image/png': ['.png', '.jpg', '.jpeg']},
            onDropRejected(err) {
                const error = err[0];

                toastError('Failed to upload image')(error.errors.map((e) => e.message).join(', '));
            },
            onError(err) {
                toastError('Failed to upload image')(err.message);
            },
            async onDrop(acceptedFiles) {
                try {
                    if (acceptedFiles.length === 0) return;

                    setFile(acceptedFiles[0]);

                    const formData = new FormData();

                    formData.append('files', acceptedFiles[0]);

                    const result = await uploadForm(formData);

                    onChange?.(result.data.url);
                } catch (error) {
                    if (error instanceof Error) toastError('Failed to upload image')(error.message);
                }
            },
        });

        return (
            <div className='flex w-full flex-col gap-2'>
                {preview && value ? (
                    <img
                        className='w-full rounded-xl object-cover'
                        src={link}
                    />
                ) : null}
                <div {...getRootProps({className: `dropzone`})}>
                    <input {...getInputProps()} />
                    <Input
                        ref={ref}
                        className='cursor-pointer'
                        classNames={{input: 'cursor-default'}}
                        description={description}
                        endContent={
                            <Button
                                color='success'
                                isIconOnly={true}
                                radius='full'
                                size='sm'
                                variant='flat'
                                onClick={open}
                            >
                                <ImageUp
                                    size={20}
                                    strokeWidth={0.8}
                                />
                            </Button>
                        }
                        errorMessage={errorMessage}
                        fullWidth={true}
                        isInvalid={isInvalid}
                        isReadOnly={true}
                        isRequired={isRequired}
                        label={label ?? 'Drag and drop your image here'}
                        placeholder={placeholder}
                        value={value}
                    />
                </div>
                {file && loading ? (
                    <Progress
                        aria-label='Loading...'
                        size='sm'
                        value={progress}
                    />
                ) : null}
            </div>
        );
    }
);
