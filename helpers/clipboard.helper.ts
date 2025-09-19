/**
 * Universal clipboard helper that works in both secure (HTTPS/localhost) and non-secure contexts
 * Provides fallback for environments where Clipboard API is not available
 */

export interface ClipboardOptions {
    onSuccess?: (text: string) => void;
    onError?: (error: Error) => void;
}

/**
 * Copy text to clipboard with automatic fallback for non-secure contexts
 */
export const copyToClipboard = async (text: string, options?: ClipboardOptions): Promise<boolean> => {
    // Check if modern Clipboard API is available (HTTPS or localhost)
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            options?.onSuccess?.(text);

            return true;
        } catch (error) {
            console.error('Modern clipboard API failed, using fallback:', error);

            // Fallback to legacy method
            return fallbackCopyTextToClipboard(text, options);
        }
    } else {
        // Fallback for non-secure contexts (HTTP on VPS)
        return fallbackCopyTextToClipboard(text, options);
    }
};

/**
 * Legacy clipboard copy method using document.execCommand
 * Works in non-secure contexts but is deprecated
 */
const fallbackCopyTextToClipboard = (text: string, options?: ClipboardOptions): boolean => {
    const textArea = document.createElement('textarea');

    textArea.value = text;

    // Avoid scrolling to bottom and make invisible
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    textArea.style.zIndex = '-1';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');

        document.body.removeChild(textArea);

        if (successful) {
            options?.onSuccess?.(text);

            return true;
        } else {
            options?.onError?.(new Error('document.execCommand failed'));

            return false;
        }
    } catch (err) {
        document.body.removeChild(textArea);
        const error = err instanceof Error ? err : new Error('Unknown clipboard error');

        console.error('Fallback: Could not copy text: ', error);
        options?.onError?.(error);

        return false;
    }
};

/**
 * Check if clipboard functionality is available
 */
export const isClipboardSupported = (): boolean => {
    return (navigator.clipboard && window.isSecureContext) || (document.queryCommandSupported && document.queryCommandSupported('copy'));
};
