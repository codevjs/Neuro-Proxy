'use client';

import {Editor} from '@monaco-editor/react';
import {Button} from '@heroui/button';
import {Card, CardBody, CardHeader} from '@heroui/card';
import {Chip} from '@heroui/chip';
import {useCallback, useEffect, useState} from 'react';
import {toast} from 'sonner';
import {Save, RefreshCw, AlertTriangle, CheckCircle, FileText, FolderOpen} from 'lucide-react';

import {updateFile, validateConfigAction, getFileContent, createFile, deleteFile, getTraefikFiles, downloadFile} from '../_action/action';

import FileBrowser from './file-browser';

import {Can} from '@/contexts/casl.context';

interface FileInfo {
    name: string;
    path: string;
    isDirectory: boolean;
    size?: number;
    lastModified?: string;
    extension?: string;
}

interface EnhancedConfigEditorProps {
    initialFiles: FileInfo[];
    initialFile?: string;
    initialContent?: string;
}

const getLanguageFromExtension = (extension?: string): string => {
    switch (extension?.toLowerCase()) {
        case '.yml':
        case '.yaml':
            return 'yaml';
        case '.json':
            return 'json';
        case '.toml':
            return 'toml';
        case '.conf':
        case '.config':
            return 'ini';
        case '.js':
            return 'javascript';
        case '.ts':
            return 'typescript';
        case '.sh':
            return 'shell';
        default:
            return 'plaintext';
    }
};

export default function EnhancedConfigEditor({initialFiles, initialFile, initialContent = ''}: EnhancedConfigEditorProps) {
    const [files, setFiles] = useState<FileInfo[]>(initialFiles);
    const [currentFile, setCurrentFile] = useState<string | null>(initialFile || null);
    const [content, setContent] = useState<string>(initialContent);
    const [originalContent, setOriginalContent] = useState<string>(initialContent);
    const [saving, setSaving] = useState<boolean>(false);
    const [validating, setValidating] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    const [validationStatus, setValidationStatus] = useState<{
        valid: boolean;
        error?: string;
    } | null>(null);

    const currentFileInfo = files.find((f) => f.path === currentFile);
    const editorLanguage = getLanguageFromExtension(currentFileInfo?.extension);

    const refreshFiles = useCallback(async () => {
        try {
            setLoading(true);
            const result = await getTraefikFiles();

            if (result.success && result.files) {
                setFiles(result.files);
            } else {
                toast.error(result.error || 'Failed to refresh files');
            }
        } catch (error) {
            toast.error('Failed to refresh files');
        } finally {
            setLoading(false);
        }
    }, []);

    const validateConfig = useCallback(async (configContent: string, fileExtension?: string) => {
        try {
            setValidating(true);
            const result = await validateConfigAction(configContent, fileExtension);

            setValidationStatus(result);
        } catch (error) {
            setValidationStatus({
                valid: false,
                error: 'Failed to validate config',
            });
        } finally {
            setValidating(false);
        }
    }, []);

    const loadFileContent = useCallback(
        async (filePath: string) => {
            try {
                setLoading(true);
                const result = await getFileContent(filePath);

                if (result.success && result.content !== undefined) {
                    setContent(result.content);
                    setOriginalContent(result.content);
                    setCurrentFile(filePath);
                    setHasChanges(false);

                    // Validate the loaded content
                    const fileInfo = files.find((f) => f.path === filePath);

                    validateConfig(result.content, fileInfo?.extension);
                } else {
                    toast.error(result.error || 'Failed to load file');
                }
            } catch (error) {
                toast.error('Failed to load file content');
            } finally {
                setLoading(false);
            }
        },
        [files, validateConfig]
    );

    const saveCurrentFile = useCallback(async () => {
        if (!currentFile) {
            toast.error('No file selected');

            return;
        }

        try {
            setSaving(true);
            const result = await updateFile(currentFile, content);

            if (result.success) {
                setOriginalContent(content);
                setHasChanges(false);
                toast.success('File saved successfully');
                await refreshFiles(); // Refresh file list to update timestamps
            } else {
                throw new Error(result.error || 'Failed to save file');
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to save file');
        } finally {
            setSaving(false);
        }
    }, [currentFile, content, refreshFiles]);

    const handleCreateFile = useCallback(
        async (fileName: string, isDirectory: boolean) => {
            try {
                const result = await createFile(fileName, isDirectory);

                if (result.success) {
                    toast.success(`${isDirectory ? 'Directory' : 'File'} created successfully`);
                    await refreshFiles();

                    // If it's a file, load it for editing
                    if (!isDirectory) {
                        // Find the created file in the refreshed files list
                        const createdFile = files.find((f) => f.name === fileName && !f.isDirectory);

                        if (createdFile) {
                            await loadFileContent(createdFile.path);
                        }
                    }
                } else {
                    toast.error(result.error || `Failed to create ${isDirectory ? 'directory' : 'file'}`);
                }
            } catch (error) {
                toast.error(`Failed to create ${isDirectory ? 'directory' : 'file'}`);
            }
        },
        [refreshFiles, loadFileContent]
    );

    const handleDeleteFile = useCallback(
        async (filePath: string) => {
            if (
                window.confirm(`Are you sure you want to delete this ${files.find((f) => f.path === filePath)?.isDirectory ? 'directory' : 'file'}?`)
            ) {
                try {
                    const result = await deleteFile(filePath);

                    if (result.success) {
                        toast.success('Deleted successfully');

                        // If we deleted the current file, clear the editor
                        if (currentFile === filePath) {
                            setCurrentFile(null);
                            setContent('');
                            setOriginalContent('');
                            setHasChanges(false);
                            setValidationStatus(null);
                        }

                        await refreshFiles();
                    } else {
                        toast.error(result.error || 'Failed to delete');
                    }
                } catch (error) {
                    toast.error('Failed to delete');
                }
            }
        },
        [files, currentFile, refreshFiles]
    );

    const handleDownloadFile = useCallback(async (filePath: string) => {
        try {
            const result = await downloadFile(filePath);

            if (result.success && result.content && result.fileName) {
                // Create blob and download
                const blob = new Blob([result.content], {
                    type: 'text/plain;charset=utf-8',
                });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');

                link.href = url;
                link.download = result.fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                toast.success(`File "${result.fileName}" downloaded successfully`);
            } else {
                toast.error(result.error || 'Failed to download file');
            }
        } catch (error) {
            toast.error('Failed to download file');
        }
    }, []);

    const handleEditorChange = useCallback(
        (value: string | undefined) => {
            if (value !== undefined) {
                setContent(value);
                setHasChanges(value !== originalContent);

                // Debounce validation
                const timeoutId = setTimeout(() => {
                    validateConfig(value, currentFileInfo?.extension);
                }, 500);

                return () => clearTimeout(timeoutId);
            }
        },
        [originalContent, validateConfig, currentFileInfo?.extension]
    );

    const discardChanges = useCallback(() => {
        setContent(originalContent);
        setHasChanges(false);
        setValidationStatus(null);
    }, [originalContent]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (hasChanges && validationStatus?.valid && currentFile) {
                    saveCurrentFile();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [hasChanges, validationStatus, currentFile, saveCurrentFile]);

    return (
        <div className='flex h-full w-full gap-6'>
            {/* Editor Area */}
            <div className='flex flex-1 flex-col gap-y-6 py-1'>
                <div className='flex flex-col'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                            <div className='flex items-center gap-2'>
                                <h1 className='text-2xl font-semibold'>Config Editor</h1>
                                {currentFile && (
                                    <>
                                        <Chip
                                            size='sm'
                                            startContent={<FileText className='h-3 w-3' />}
                                            variant='flat'
                                        >
                                            {currentFileInfo?.name || 'Unknown'}
                                        </Chip>
                                        <Chip
                                            size='sm'
                                            variant='flat'
                                        >
                                            {editorLanguage.toUpperCase()}
                                        </Chip>
                                    </>
                                )}
                                {validating && <RefreshCw className='h-4 w-4 animate-spin text-blue-500' />}
                                {validationStatus && !validating && (
                                    <Chip
                                        color={validationStatus.valid ? 'success' : 'danger'}
                                        size='sm'
                                        startContent={
                                            validationStatus.valid ? <CheckCircle className='h-3 w-3' /> : <AlertTriangle className='h-3 w-3' />
                                        }
                                    >
                                        {validationStatus.valid ? 'Valid' : 'Invalid'}
                                    </Chip>
                                )}
                            </div>
                        </div>

                        <div className='flex gap-2'>
                            <Button
                                size='sm'
                                variant='flat'
                                onPress={() => window.location.reload()}
                            >
                                <RefreshCw className='h-4 w-4' />
                                Reload
                            </Button>

                            {hasChanges && (
                                <Button
                                    size='sm'
                                    variant='flat'
                                    onPress={discardChanges}
                                >
                                    Discard Changes
                                </Button>
                            )}

                            <Can
                                I='update'
                                a='Config'
                            >
                                <Button
                                    color='primary'
                                    isDisabled={!hasChanges || !validationStatus?.valid || !currentFile}
                                    isLoading={saving}
                                    size='sm'
                                    startContent={<Save className='h-4 w-4' />}
                                    onPress={saveCurrentFile}
                                >
                                    Save File
                                </Button>
                            </Can>
                        </div>
                    </div>
                    <p className='text-sm text-default-500'>
                        {currentFile ? `Editing: ${currentFile}` : 'Select a file from the sidebar to start editing'}.{' '}
                        <a
                            href='https://doc.traefik.io/traefik/reference/dynamic-configuration/file/'
                            rel='noreferrer noopener'
                            target='_blank'
                        >
                            <span className='text-blue-500'>[Docs]</span>
                        </a>
                    </p>
                </div>

                {validationStatus?.error && (
                    <Card className='border-danger'>
                        <CardHeader className='pb-2'>
                            <div className='flex items-center gap-2 text-danger'>
                                <AlertTriangle className='h-4 w-4' />
                                <span className='font-semibold'>Validation Error</span>
                            </div>
                        </CardHeader>
                        <CardBody className='pt-0'>
                            <code className='text-sm text-danger'>{validationStatus.error}</code>
                        </CardBody>
                    </Card>
                )}

                {currentFile ? (
                    <Card className='flex-1'>
                        <CardBody className='p-0'>
                            <div className='h-full w-full'>
                                <Editor
                                    height='100%'
                                    language={editorLanguage}
                                    loading={loading ? 'Loading file...' : undefined}
                                    options={{
                                        minimap: {enabled: true},
                                        fontSize: 14,
                                        lineNumbers: 'on',
                                        roundedSelection: false,
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        tabSize: 2,
                                        insertSpaces: true,
                                        detectIndentation: true,
                                        folding: true,
                                        foldingHighlight: true,
                                        bracketPairColorization: {enabled: true},
                                        wordWrap: 'on',
                                        scrollbar: {
                                            vertical: 'visible',
                                            horizontal: 'visible',
                                        },
                                        find: {
                                            autoFindInSelection: 'never',
                                        },
                                    }}
                                    theme='vs-dark'
                                    value={content}
                                    onChange={handleEditorChange}
                                />
                            </div>
                        </CardBody>
                    </Card>
                ) : (
                    <Card className='flex-1'>
                        <CardBody className='flex items-center justify-center'>
                            <div className='text-center'>
                                <FolderOpen className='mx-auto mb-4 h-16 w-16 text-default-400' />
                                <h3 className='mb-2 text-lg font-semibold'>No File Selected</h3>
                                <p className='mb-4 text-sm text-default-500'>Choose a file from the sidebar to start editing, or create a new one.</p>
                            </div>
                        </CardBody>
                    </Card>
                )}

                {currentFile && (
                    <div className='flex items-center justify-between text-sm text-gray-500'>
                        <div className='flex items-center gap-4'>
                            <span>Language: {editorLanguage}</span>
                            <span>Lines: {content.split('\n').length}</span>
                            <span>Size: {new Blob([content]).size} bytes</span>
                            {hasChanges && <span className='font-medium text-orange-500'>• Unsaved changes</span>}
                        </div>
                        <div>
                            <kbd className='rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800'>Ctrl+S</kbd> to save
                        </div>
                    </div>
                )}
            </div>

            {/* File Browser Sidebar */}
            <div className='w-80 flex-shrink-0 py-1'>
                <FileBrowser
                    currentFile={currentFile}
                    files={files}
                    isLoading={loading}
                    onCreateFile={handleCreateFile}
                    onDeleteFile={handleDeleteFile}
                    onDownloadFile={handleDownloadFile}
                    onFileSelect={loadFileContent}
                    onRefresh={refreshFiles}
                />
            </div>
        </div>
    );
}
