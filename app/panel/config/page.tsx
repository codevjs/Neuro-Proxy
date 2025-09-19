import ConfigEditor from './_components/config-editor';
import {getTraefikFiles, getFileContent} from './_action/action';

import {checkAbility} from '@/libs/casl-ability.lib';

// Use different paths for development vs production
const isDev = process.env.NODE_ENV === 'development';
const DEFAULT_FILE = isDev ? './traefik/config.yml' : '/app/traefik/config.yml';

async function getInitialData(): Promise<{
    files: any[];
    currentFile?: string;
    currentContent?: string;
}> {
    try {
        // Check permission on server side
        await checkAbility('read', 'Config');

        // Get all traefik files
        const filesResult = await getTraefikFiles();

        if (!filesResult.success || !filesResult.files) {
            throw new Error(filesResult.error || 'Failed to load files');
        }

        // Try to load default file content
        let currentFile: string | undefined;
        let currentContent: string | undefined;

        // Check if default config file exists
        const defaultFileExists = filesResult.files.some((f) => f.path === DEFAULT_FILE && !f.isDirectory);

        if (defaultFileExists) {
            const contentResult = await getFileContent(DEFAULT_FILE);

            if (contentResult.success && contentResult.content !== undefined) {
                currentFile = DEFAULT_FILE;
                currentContent = contentResult.content;
            }
        }

        return {
            files: filesResult.files,
            currentFile,
            currentContent,
        };
    } catch (error) {
        console.error('Error loading initial data:', error);
        throw error;
    }
}

export default async function ConfigEditorPage() {
    try {
        const {files, currentFile, currentContent} = await getInitialData();

        return (
            <ConfigEditor
                initialContent={currentContent}
                initialFile={currentFile}
                initialFiles={files}
            />
        );
    } catch (error) {
        return (
            <div className='flex h-full w-full items-center justify-center'>
                <div className='text-center'>
                    <h2 className='text-xl font-semibold text-red-500'>Failed to Load Config Editor</h2>
                    <p className='mt-2 text-sm text-gray-500'>{error instanceof Error ? error.message : 'Unknown error occurred'}</p>
                </div>
            </div>
        );
    }
}
