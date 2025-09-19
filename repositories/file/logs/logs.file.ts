import fs from 'fs';
import readline from 'readline';

import { singleton } from 'tsyringe';

import { ITreafikLogs } from './logs.file.interface';

@singleton()
export class TreafikLogsRepository {
    private readonly TREAFIK_LOGS = process.env.NODE_ENV === 'development' ? './traefik/access.log' : '/app/traefik/access.log';

    async getAll(search?: string) {
        const logEntries: ITreafikLogs[] = [];

        // Check if log file exists
        if (!fs.existsSync(this.TREAFIK_LOGS)) {
            console.warn('Traefik log file not found:', this.TREAFIK_LOGS);

            return logEntries;
        }

        const fileStream = fs.createReadStream(this.TREAFIK_LOGS);
        const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

        for await (const line of rl) {
            try {
                const logEntry = JSON.parse(line);

                // Skip logs from neuro_proxy_dashboard@file router
                if (logEntry.RouterName === 'neuro_proxy_dashboard@file' || logEntry.service === 'http://localhost:3000') {
                    continue;
                }

                if (!search || Object.values(logEntry).some((value) => typeof value === 'string' && value.includes(search))) {
                    logEntries.push(logEntry);
                }
            } catch (error) {
                console.warn('Error parsing JSON line:', line, error);
                // Skip malformed lines instead of throwing error
                continue;
            }
        }

        return logEntries;
    }
}
