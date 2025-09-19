'use client';

import {FC, useState} from 'react';

interface Props {
    text: string;
    maxLength: number;
}

const ShowMoreText: FC<Props> = ({text, maxLength}) => {
    const [showMore, setShowMore] = useState<boolean>(false);

    return (
        <>
            {showMore ? text : text.slice(0, maxLength)}
            {text.length > maxLength && (
                <button
                    className='ml-2 font-medium'
                    onClick={() => setShowMore(!showMore)}
                >
                    {showMore ? 'Show less' : '...Show more'}
                </button>
            )}
        </>
    );
};

export default ShowMoreText;
