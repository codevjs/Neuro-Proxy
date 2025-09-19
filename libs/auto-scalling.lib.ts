import fs from 'fs';

import {createId} from '@paralleldrive/cuid2';

import container from '../server-container';
import {DockerApiRepository} from '../repositories/api/docker/docker.api';
import {calculateCPUUsage} from '../helpers/calculate-cpu-usage.helper';

const dockerApiRepository = container.resolve(DockerApiRepository);

type ScallingConfigType = {
    name: string;
    description?: string;
    master: string;
    upper_cpu_threshold: number;
    lower_cpu_threshold: number;
    limit: number;
    slave: string[];
    lastScaledAt?: number;
};

const SCALLING_CONFIG = '/app/traefik/scalling.json';
const SCALLING_LOGS = '/app/traefik/scalling-logs.json';

const scalingLocks = new Set<string>();
const logBuffer: {master: string; timestamp: Date; level: 'INFO' | 'WARNING' | 'ERROR'; message: string}[] = [];
const intervalMap = new Map<string, NodeJS.Timeout>();

const loadConfig = (): ScallingConfigType[] => {
    if (fs.existsSync(SCALLING_CONFIG)) return JSON.parse(fs.readFileSync(SCALLING_CONFIG, 'utf8'));

    return [];
};

const saveConfig = (config: ScallingConfigType) => {
    const configs = loadConfig();
    const index = configs.findIndex((c) => c.name === config.name);

    if (index > -1) configs[index] = config;
    else configs.push(config);
    fs.writeFileSync(SCALLING_CONFIG, JSON.stringify(configs, null, 2));
};

const flushLogs = () => {
    if (logBuffer.length === 0) return;
    const logs = loadLogs();

    logBuffer.forEach(({master, timestamp, level, message}) => {
        logs.push({master, timestamp, level, message});
    });
    fs.writeFileSync(SCALLING_LOGS, JSON.stringify(logs, null, 2));
    logBuffer.length = 0;
};

setInterval(flushLogs, 5000);

const loadLogs = (): {master: string; timestamp: Date; level: 'INFO' | 'WARNING' | 'ERROR'; message: string}[] => {
    if (fs.existsSync(SCALLING_LOGS)) return JSON.parse(fs.readFileSync(SCALLING_LOGS, 'utf8'));

    return [];
};

const logEvent = (master: string, level: 'INFO' | 'WARNING' | 'ERROR', message: string) => {
    console.log(message);
    logBuffer.push({master, timestamp: new Date(), level, message});
};

async function getLiveCPUUsage(containerId: string): Promise<number> {
    try {
        const container = dockerApiRepository.getOneContainer(containerId);
        const stats = await container.stats({stream: false});

        return calculateCPUUsage(stats);
    } catch (error) {
        logEvent(containerId, 'ERROR', `Failed to fetch CPU stats for ${containerId}: ${error.message}`);

        return 0;
    }
}

const runningContainers = new Set<string>();

export const autoScalling = async () => {
    try {
        const configs = loadConfig();

        // Hentikan interval yang tidak ada lagi di konfigurasi
        intervalMap.forEach((interval, master) => {
            if (!configs.some((config) => config.master === master)) {
                logEvent(master, 'INFO', `🔄 Stopping monitoring for master ${master} as it is no longer in the configuration.`);
                clearInterval(interval);
                intervalMap.delete(master);
                runningContainers.delete(master);
            }
        });

        for (let config of configs) {
            if (runningContainers.has(config.master)) continue;

            runningContainers.add(config.master);

            const interval = setInterval(async () => {
                if (scalingLocks.has(config.master)) return;

                scalingLocks.add(config.master);

                try {
                    const container = dockerApiRepository.getOneContainer(config.master);
                    const stats = await container.stats({stream: false});
                    const cpuUsage = calculateCPUUsage(stats);

                    logEvent(config.master, 'INFO', `📊 [${container.id}] CPU Usage: ${cpuUsage.toFixed(2)}%`);

                    const now = Date.now();
                    const cooldown = 60 * 1000;

                    if (cpuUsage > config.upper_cpu_threshold && now - (config.lastScaledAt || 0) > cooldown) {
                        logEvent(config.master, 'WARNING', '🔥 CPU overload detected, adding new slave...');

                        if (config.slave.length >= config.limit) {
                            logEvent(config.master, 'ERROR', '🚫 Cannot scale up, reached slave limit!');
                        } else {
                            const newSlave = await dockerApiRepository.duplicateContainer(config.master, `slave_${createId()}`);

                            config.slave.push(newSlave.id);
                            config.lastScaledAt = now;
                            saveConfig(config);
                        }
                    }

                    const idleSlaves = await Promise.all(config.slave.map(async (id) => ({id, cpu: await getLiveCPUUsage(id)})));

                    const removableSlave = idleSlaves.find((slave) => slave.cpu < config.lower_cpu_threshold);

                    if (removableSlave && now - (config.lastScaledAt || 0) > cooldown) {
                        logEvent(config.master, 'WARNING', `🛑 Removing slave ${removableSlave.id} due to low CPU usage.`);
                        await dockerApiRepository.removeContainer(removableSlave.id);
                        config.slave = config.slave.filter((id) => id !== removableSlave.id);
                        config.lastScaledAt = now;
                        saveConfig(config);
                    }
                } catch (error) {
                    logEvent(config.master, 'ERROR', `Error during scaling operation: ${error.message}`);
                } finally {
                    scalingLocks.delete(config.master);
                }
            }, 5000);

            intervalMap.set(config.master, interval);
        }
    } catch (error) {
        console.error('Error in auto-scaling:', error);
    }
};
