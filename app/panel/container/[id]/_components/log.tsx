import {FC} from 'react';

import Console from './console';

interface Props {
    logs: string;
}

const Log: FC<Props> = async ({logs}) => {
    function removeFirstChars(str: string) {
        const reg = /^......../;
        let res = '';
        const lines = str.split(/\n/);

        lines.forEach((line) => {
            line = line.replace(reg, '');
            res += line + '\n';
        });

        return res;
    }

    return <Console logs={removeFirstChars(logs)} />;
};

export default Log;
