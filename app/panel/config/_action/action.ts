'use server';

import fs from 'fs';
import path from 'path';

import {parse} from 'yaml';
import {revalidatePath} from 'next/cache';

import {checkAbility} from '@/libs/casl-ability.lib';

// Use different paths for development vs production
const isDev = process.env.NODE_ENV === 'development';
const TRAEFIK_DIR = isDev ? './traefik' : '/app/traefik';
const CONFIG_PATH = isDev ? './traefik/config.yml' : '/app/traefik/config.yml';

interface FileInfo {
    name: string;
    path: string;
    isDirectory: boolean;
    size?: number;
    lastModified?: string;
    extension?: string;
}

// Legacy function for backward compatibility
export async function updateConfig(content: string): Promise<{success: boolean; error?: string}> {
    return updateFile(CONFIG_PATH, content);
}

export async function validateConfigAction(content: string, fileExtension?: string): Promise<{valid: boolean; error?: string}> {
    try {
        const ext = fileExtension?.toLowerCase();

        if (ext === '.yml' || ext === '.yaml') {
            parse(content);
        } else if (ext === '.json') {
            JSON.parse(content);
        }
        // For other file types, we'll skip validation for now

        return {valid: true};
    } catch (error) {
        const fileType = fileExtension?.includes('json') ? 'JSON' : 'YAML';

        return {
            valid: false,
            error: error instanceof Error ? error.message : `Unknown ${fileType} parsing error`,
        };
    }
}

export async function getTraefikFiles(): Promise<{success: boolean; files?: FileInfo[]; error?: string}> {
    try {
        await checkAbility('read', 'Config');

        if (!fs.existsSync(TRAEFIK_DIR)) {
            return {
                success: false,
                error: 'Traefik directory not found',
            };
        }

        const files: FileInfo[] = [];

        const items = fs.readdirSync(TRAEFIK_DIR, {withFileTypes: true});

        for (const item of items) {
            const itemPath = path.join(TRAEFIK_DIR, item.name);

            const stats = fs.statSync(itemPath);

            // Skip log and txt files
            if (!item.isDirectory()) {
                const extension = path.extname(item.name).toLowerCase();
                const excludedExtensions = ['.gz'];

                if (excludedExtensions.includes(extension)) {
                    continue;
                }
            }

            files.push({
                name: item.name,
                path: itemPath,
                isDirectory: item.isDirectory(),
                size: item.isDirectory() ? undefined : stats.size,
                lastModified: stats.mtime.toISOString(),
                extension: item.isDirectory() ? undefined : path.extname(item.name),
            });
        }

        // Sort files: directories first, then files alphabetically
        files.sort((a, b) => {
            if (a.isDirectory && !b.isDirectory) return -1;
            if (!a.isDirectory && b.isDirectory) return 1;

            return a.name.localeCompare(b.name);
        });

        return {
            success: true,
            files,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to read traefik directory',
        };
    }
}

export async function getFileContent(filePath: string): Promise<{success: boolean; content?: string; error?: string}> {
    try {
        await checkAbility('read', 'Config');

        // Security check: ensure file is within traefik directory
        const normalizedPath = path.normalize(filePath);
        const normalizedTraefikDir = path.resolve(TRAEFIK_DIR);
        const resolvedFilePath = path.resolve(filePath);

        if (!resolvedFilePath.startsWith(normalizedTraefikDir)) {
            return {
                success: false,
                error: 'Access denied: File must be within traefik directory',
            };
        }

        if (!fs.existsSync(filePath)) {
            return {
                success: false,
                error: 'File not found',
            };
        }

        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            return {
                success: false,
                error: 'Cannot read directory as file',
            };
        }

        const content = fs.readFileSync(filePath, 'utf8');

        return {
            success: true,
            content,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to read file',
        };
    }
}

export async function updateFile(filePath: string, content: string): Promise<{success: boolean; error?: string}> {
    try {
        await checkAbility('update', 'Config');

        // Security check: ensure file is within traefik directory
        const normalizedPath = path.normalize(filePath);
        const normalizedTraefikDir = path.resolve(TRAEFIK_DIR);
        const resolvedFilePath = path.resolve(filePath);

        if (!resolvedFilePath.startsWith(normalizedTraefikDir)) {
            return {
                success: false,
                error: 'Access denied: File must be within traefik directory',
            };
        }

        const fileExtension = path.extname(filePath);

        // Validate content based on file type
        const validation = await validateConfigAction(content, fileExtension);

        if (!validation.valid) {
            return {
                success: false,
                error: `Invalid file format: ${validation.error}`,
            };
        }

        // Ensure directory exists
        const dir = path.dirname(filePath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {recursive: true});
        }

        fs.writeFileSync(filePath, content, 'utf8');

        revalidatePath('/panel/config');

        return {success: true};
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update file',
        };
    }
}

export async function createFile(fileName: string, isDirectory: boolean = false): Promise<{success: boolean; error?: string}> {
    try {
        await checkAbility('create', 'Config');

        const filePath = path.join(TRAEFIK_DIR, fileName);

        // Security check: ensure file is within traefik directory
        const normalizedPath = path.normalize(filePath);
        const normalizedTraefikDir = path.resolve(TRAEFIK_DIR);
        const resolvedFilePath = path.resolve(filePath);

        if (!resolvedFilePath.startsWith(normalizedTraefikDir)) {
            return {
                success: false,
                error: 'Access denied: File must be within traefik directory',
            };
        }

        if (fs.existsSync(filePath)) {
            return {
                success: false,
                error: `${isDirectory ? 'Directory' : 'File'} already exists`,
            };
        }

        if (isDirectory) {
            fs.mkdirSync(filePath, {recursive: true});
        } else {
            // Create empty file with appropriate default content
            let defaultContent = '';
            const ext = path.extname(fileName).toLowerCase();

            switch (ext) {
                case '.yml':
                case '.yaml':
                    defaultContent = '# Traefik configuration file\n# Add your configuration here\n';
                    break;
                case '.json':
                    defaultContent = '{\n  \n}\n';
                    break;
                case '.toml':
                    defaultContent = '# Traefik TOML configuration\n# Add your configuration here\n';
                    break;
                default:
                    defaultContent = '# Configuration file\n';
            }

            fs.writeFileSync(filePath, defaultContent, 'utf8');
        }

        revalidatePath('/panel/config');

        return {success: true};
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : `Failed to create ${isDirectory ? 'directory' : 'file'}`,
        };
    }
}

export async function deleteFile(filePath: string): Promise<{success: boolean; error?: string}> {
    try {
        await checkAbility('delete', 'Config');

        // Security check: ensure file is within traefik directory
        const normalizedPath = path.normalize(filePath);
        const normalizedTraefikDir = path.resolve(TRAEFIK_DIR);
        const resolvedFilePath = path.resolve(filePath);

        if (!resolvedFilePath.startsWith(normalizedTraefikDir)) {
            return {
                success: false,
                error: 'Access denied: File must be within traefik directory',
            };
        }

        if (!fs.existsSync(filePath)) {
            return {
                success: false,
                error: 'File not found',
            };
        }

        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            fs.rmSync(filePath, {recursive: true, force: true});
        } else {
            fs.unlinkSync(filePath);
        }

        revalidatePath('/panel/config');

        return {success: true};
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete file',
        };
    }
}

export async function downloadFile(filePath: string): Promise<{success: boolean; content?: string; fileName?: string; error?: string}> {
    try {
        await checkAbility('read', 'Config');

        // Security check: ensure file is within traefik directory
        const normalizedPath = path.normalize(filePath);
        const normalizedTraefikDir = path.resolve(TRAEFIK_DIR);
        const resolvedFilePath = path.resolve(filePath);

        if (!resolvedFilePath.startsWith(normalizedTraefikDir)) {
            return {
                success: false,
                error: 'Access denied: File must be within traefik directory',
            };
        }

        if (!fs.existsSync(filePath)) {
            return {
                success: false,
                error: 'File not found',
            };
        }

        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            return {
                success: false,
                error: 'Cannot download directory',
            };
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath);

        return {
            success: true,
            content,
            fileName,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to download file',
        };
    }
}
