import {FC, memo} from 'react';
import {CircularProgress} from '@heroui/progress';

interface Props {
    height?: string;
}

const Loading: FC<Props> = () => {
    return (
        <CircularProgress
            color='primary'
            size='lg'
        />
    );
};

export default memo(Loading);
