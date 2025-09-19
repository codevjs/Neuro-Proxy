import {toast} from 'sonner';

export const toastError = (title: string) => (message: string) => {
    toast.error(title, {
        description: message,
        classNames: {
            icon: 'mr-4',
            title: 'text-base',
            error: 'border-none',
        },
    });
};

export const toastSuccess = (title: string) => (message: string) => {
    toast.success(title, {
        description: message,
        classNames: {
            icon: 'mr-4',
            title: 'text-base',
            success: 'border-none',
        },
    });
};
