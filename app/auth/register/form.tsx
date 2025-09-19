'use client';

import { Card } from '@heroui/card';
import { Input } from '@heroui/input';
import { FC, useState } from 'react';
import { Button } from '@heroui/button';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from '@bprogress/next';

import { toastError, toastSuccess } from '@/helpers/toast.helper';
import { EyeSlashFilledIcon, EyeFilledIcon } from '@/components/icons';
import { firstRegisterAction } from '@/app/auth/_actions/auth.action';

interface Props {
    callbackUrl?: string;
}

const Form: FC<Props> = ({ callbackUrl }) => {
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const toggleVisibility = () => setIsVisible(!isVisible);
    const router = useRouter();

    const { control, formState, handleSubmit } = useForm({
        defaultValues: {
            name: '',
            email: '',
            password: '',
        } as {
            name: string;
            email: string;
            password: string;
        },
    });

    const onSubmit: SubmitHandler<{
        name: string;
        email: string;
        password: string;
    }> = async (data) => {
        try {
            const result = await firstRegisterAction(data);

            if (!result.success) throw new Error(result?.message);

            toastSuccess('Register successfully')(result.message);

            router.push('/auth/signin');
        } catch (error) {
            if (error instanceof Error) toastError('Failed to register')(error.message);
        }
    };

    return (
        <div className='mx-auto flex h-full w-full max-w-5xl items-center justify-center'>
            <Card className='flex h-fit w-full max-w-sm flex-col gap-4 rounded-large bg-content1 px-8 pb-10 pt-6 shadow-none'>
                <div className='flex flex-col justify-center items-center pb-1'>
                    <div className='flex justify-center'>
                        <img
                            alt='logo'
                            className='w-[100px]'
                            src='/logo.svg'
                        />
                    </div>
                    <div className='flex flex-col text-center'>
                        <p className='text-small'>Welcome, please create an account to continue.</p>
                    </div>
                </div>
                <div className='flex flex-col gap-4 p-0'>
                    <form
                        className='flex flex-col gap-4 p-0'
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <Controller
                            control={control}
                            name='name'
                            render={({ field, fieldState }) => (
                                <Input
                                    ref={field.ref}
                                    color='primary'
                                    errorMessage={fieldState.error?.message}
                                    isInvalid={fieldState.invalid}
                                    label='Name'
                                    placeholder='Enter your name'
                                    value={field.value}
                                    variant='underlined'
                                    onChange={field.onChange}
                                />
                            )}
                            rules={{ required: 'name is required' }}
                        />

                        <Controller
                            control={control}
                            name='email'
                            render={({ field, fieldState }) => (
                                <Input
                                    ref={field.ref}
                                    color='primary'
                                    errorMessage={fieldState.error?.message}
                                    isInvalid={fieldState.invalid}
                                    label='Email'
                                    placeholder='Enter your email'
                                    type='email'
                                    value={field.value}
                                    variant='underlined'
                                    onChange={field.onChange}
                                />
                            )}
                            rules={{
                                required: 'Email is required',
                                pattern: {
                                    value: /\S+@\S+\.\S+/,
                                    message: 'Invalid email',
                                },
                            }}
                        />

                        <Controller
                            control={control}
                            name='password'
                            render={({ field, fieldState }) => (
                                <Input
                                    ref={field.ref}
                                    className='max-w-xs'
                                    color='primary'
                                    endContent={
                                        <button
                                            className='focus:outline-none'
                                            type='button'
                                            onClick={toggleVisibility}
                                        >
                                            {isVisible ? (
                                                <EyeSlashFilledIcon className='pointer-events-none text-2xl text-default-400' />
                                            ) : (
                                                <EyeFilledIcon className='pointer-events-none text-2xl text-default-400' />
                                            )}
                                        </button>
                                    }
                                    errorMessage={fieldState.error?.message}
                                    isInvalid={fieldState.invalid}
                                    label='Password'
                                    placeholder='Enter your password'
                                    type={isVisible ? 'text' : 'password'}
                                    value={field.value}
                                    variant='underlined'
                                    onChange={field.onChange}
                                />
                            )}
                            rules={{ required: 'Password is required' }}
                        />

                        <p className='text-xs text-warning'>please recheck your name, email & password.</p>

                        <Button
                            color='primary'
                            isLoading={formState.isSubmitting}
                            radius='full'
                            type='submit'
                        >
                            Create Account
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
};

export default Form;
