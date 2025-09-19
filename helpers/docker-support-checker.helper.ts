/**
 * Create helper function to check if container is support by container name
 * container name should be in format of `support-${i + 1}-${containerId}`
 */
export const isContainerSupport = (containerName: string) => {
    const regex = new RegExp(`support-\\d+`);

    return regex.test(containerName);
};
