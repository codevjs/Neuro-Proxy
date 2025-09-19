import {FC} from 'react';

interface Props {
    children: React.ReactNode;
    placement?: 'left' | 'right' | 'center';
}

const Divider: FC<Props> = ({children, placement}) => {
    return placement === 'left' ? (
        <div className='flex items-center gap-4 py-2'>
            {children}
            <hr
                className='h-divider w-full flex-1 border-none bg-divider'
                role='separator'
            />
        </div>
    ) : placement === 'right' ? (
        <div className='flex items-center gap-4 py-2'>
            <hr
                className='h-divider w-full flex-1 border-none bg-divider'
                role='separator'
            />
            {children}
        </div>
    ) : (
        <div className='flex items-center gap-4 py-2'>
            <hr
                className='h-divider w-full flex-1 border-none bg-divider'
                role='separator'
            />
            {children}
            <hr
                className='h-divider w-full flex-1 border-none bg-divider'
                role='separator'
            />
        </div>
    );
};

export default Divider;
