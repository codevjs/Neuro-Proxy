import Dockerode from 'dockerode';

export function calculateCPUUsage(stats: Dockerode.ContainerStats) {
    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;

    const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;

    const onlineCPUs = stats.cpu_stats.online_cpus || 1;

    if (systemDelta > 0 && cpuDelta > 0) return (cpuDelta / systemDelta) * onlineCPUs * 100;

    return 0;
}
