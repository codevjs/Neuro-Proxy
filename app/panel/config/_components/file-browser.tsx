'use client';

import {Card, CardBody} from '@heroui/card';
import {Button} from '@heroui/button';
import {Input} from '@heroui/input';
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from '@heroui/modal';
import {useState, useCallback, useMemo} from 'react';
import {FileText, Folder, FolderOpen, Plus, Trash2, Download, Search, RefreshCw} from 'lucide-react';
import {Chip} from '@heroui/chip';
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem} from '@heroui/dropdown';

interface FileInfo {
    name: string;
    path: string;
    isDirectory: boolean;
    size?: number;
    lastModified?: string;
    extension?: string;
}

interface FileBrowserProps {
    files: FileInfo[];
    currentFile: string | null;
    onFileSelect: (filePath: string) => void;
    onCreateFile: (fileName: string, isDirectory: boolean) => void;
    onDeleteFile: (filePath: string) => void;
    onDownloadFile: (filePath: string) => void;
    onRefresh: () => void;
    isLoading?: boolean;
}

const getFileIcon = (file: FileInfo) => {
    if (file.isDirectory) {
        return file.name === 'traefik' || file.path.includes('traefik') ? (
            <FolderOpen className='h-4 w-4 text-blue-500' />
        ) : (
            <Folder className='h-4 w-4 text-yellow-500' />
        );
    }

    const ext = file.extension?.toLowerCase();
    const iconClass = 'h-4 w-4';

    switch (ext) {
        case '.yml':
        case '.yaml':
            return <FileText className={`${iconClass} text-green-500`} />;
        case '.json':
            return <FileText className={`${iconClass} text-blue-500`} />;
        case '.toml':
            return <FileText className={`${iconClass} text-purple-500`} />;
        case '.conf':
        case '.config':
            return <FileText className={`${iconClass} text-orange-500`} />;
        default:
            return <FileText className={`${iconClass} text-gray-500`} />;
    }
};

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

export default function FileBrowser({
    files,
    currentFile,
    onFileSelect,
    onCreateFile,
    onDeleteFile,
    onDownloadFile,
    onRefresh,
    isLoading = false,
}: FileBrowserProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [newFileName, setNewFileName] = useState('');
    const [isCreatingDirectory, setIsCreatingDirectory] = useState(false);
    const {isOpen, onOpen, onClose} = useDisclosure();

    const filteredFiles = useMemo(() => {
        if (!searchTerm) return files;

        return files.filter(
            (file) => file.name.toLowerCase().includes(searchTerm.toLowerCase()) || file.path.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [files, searchTerm]);

    const handleCreateFile = useCallback(() => {
        if (newFileName.trim()) {
            onCreateFile(newFileName.trim(), isCreatingDirectory);
            setNewFileName('');
            setIsCreatingDirectory(false);
            onClose();
        }
    }, [newFileName, isCreatingDirectory, onCreateFile, onClose]);

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '-';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));

        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';

        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Card className='flex h-full flex-col'>
            <CardBody className='flex h-full flex-col p-4'>
                {/* Header */}
                <div className='mb-4 flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <Folder className='h-5 w-5 text-blue-500' />
                        <Chip
                            size='sm'
                            variant='flat'
                        >
                            {files.length} items
                        </Chip>
                    </div>

                    <div className='flex items-center gap-2'>
                        <Button
                            isIconOnly
                            isLoading={isLoading}
                            size='sm'
                            variant='light'
                            onPress={onRefresh}
                        >
                            <RefreshCw className='h-4 w-4' />
                        </Button>

                        <Dropdown>
                            <DropdownTrigger>
                                <Button
                                    size='sm'
                                    startContent={<Plus className='h-4 w-4' />}
                                    variant='flat'
                                >
                                    New
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu>
                                <DropdownItem
                                    key='file'
                                    startContent={<FileText className='h-4 w-4' />}
                                    onPress={() => {
                                        setIsCreatingDirectory(false);
                                        onOpen();
                                    }}
                                >
                                    New File
                                </DropdownItem>
                                <DropdownItem
                                    key='folder'
                                    startContent={<Folder className='h-4 w-4' />}
                                    onPress={() => {
                                        setIsCreatingDirectory(true);
                                        onOpen();
                                    }}
                                >
                                    New Folder
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </div>

                {/* Search */}
                <Input
                    isClearable
                    className='mb-4'
                    placeholder='Search files...'
                    size='sm'
                    startContent={<Search className='h-4 w-4 text-default-400' />}
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                />

                {/* File List */}
                <div className='flex-1 space-y-1 overflow-auto'>
                    {filteredFiles.map((file) => (
                        <div
                            key={file.path}
                            className={`group flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all hover:bg-default-50 ${
                                currentFile === file.path
                                    ? 'border-primary-200 bg-primary-50 shadow-sm'
                                    : 'border-transparent hover:border-default-200'
                            }`}
                            onClick={() => !file.isDirectory && onFileSelect(file.path)}
                        >
                            <div className='flex min-w-0 flex-1 items-center gap-3'>
                                {getFileIcon(file)}

                                <div className='flex min-w-0 flex-1 flex-col'>
                                    <span
                                        className={`truncate text-sm font-medium ${
                                            currentFile === file.path ? 'text-primary-700' : 'text-foreground'
                                        }`}
                                    >
                                        {file.name}
                                    </span>
                                </div>
                            </div>

                            {!file.isDirectory && (
                                <div className='flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                                    <Button
                                        isIconOnly
                                        className='h-8 w-8'
                                        size='sm'
                                        title='Download file'
                                        variant='light'
                                        onPress={() => {
                                            onDownloadFile(file.path);
                                        }}
                                    >
                                        <Download className='h-3 w-3' />
                                    </Button>

                                    <Button
                                        isIconOnly
                                        className='h-8 w-8'
                                        color='danger'
                                        size='sm'
                                        variant='light'
                                        onPress={() => {
                                            onDeleteFile(file.path);
                                        }}
                                    >
                                        <Trash2 className='h-3 w-3' />
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}

                    {filteredFiles.length === 0 && (
                        <div className='flex items-center justify-center py-8 text-default-500'>
                            <div className='text-center'>
                                <FileText className='mx-auto mb-2 h-8 w-8 opacity-50' />
                                <p className='text-sm'>{searchTerm ? 'No files match your search' : 'No files found'}</p>
                            </div>
                        </div>
                    )}
                </div>
            </CardBody>

            {/* Create File Modal */}
            <Modal
                isOpen={isOpen}
                placement='top'
                onClose={onClose}
            >
                <ModalContent>
                    <ModalHeader>Create New {isCreatingDirectory ? 'Folder' : 'File'}</ModalHeader>
                    <ModalBody>
                        <Input
                            autoFocus
                            description={
                                isCreatingDirectory
                                    ? 'Enter a name for the new folder'
                                    : 'Enter a name with extension (e.g., config.yml, middleware.toml)'
                            }
                            label={isCreatingDirectory ? 'Folder Name' : 'File Name'}
                            placeholder={isCreatingDirectory ? 'my-folder' : 'config.yml'}
                            value={newFileName}
                            onValueChange={setNewFileName}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant='light'
                            onPress={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            color='primary'
                            isDisabled={!newFileName.trim()}
                            onPress={handleCreateFile}
                        >
                            Create {isCreatingDirectory ? 'Folder' : 'File'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Card>
    );
}
