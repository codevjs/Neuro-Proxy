import axios from 'axios';
import {useState} from 'react';

export const useUpload = (url: string) => {
    const [progress, setProgress] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    const uploadForm = async (formData: FormData) => {
        try {
            setLoading(true);

            return await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const progress = (progressEvent.loaded / (progressEvent.total ?? 0)) * 100;

                    setProgress(Number(progress.toFixed()));
                },
                onDownloadProgress: (progressEvent) => {
                    const progress = (progressEvent.loaded / (progressEvent.total ?? 0)) * 100;

                    setProgress(Number(progress.toFixed()));
                },
            });
        } catch (e) {
            throw e;
        } finally {
            setLoading(false);
            setProgress(0);
        }
    };

    return {uploadForm, loading, progress};
};
