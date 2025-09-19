import fs from 'fs';

import {singleton} from 'tsyringe';
import {parse, stringify} from 'yaml';

import {ITreaficDynamicConfig} from './treafik.file.interface';

@singleton()
export class TreafikConfigRepository {
    private readonly DYNAMIC_CONFIG = '/app/traefik/config.yml';

    async getDynamicConfig(): Promise<ITreaficDynamicConfig> {
        const file = fs.readFileSync(this.DYNAMIC_CONFIG, 'utf8');

        return parse(file);
    }

    async updateDynamicConfig(config: ITreaficDynamicConfig): Promise<ITreaficDynamicConfig> {
        fs.writeFileSync(this.DYNAMIC_CONFIG, stringify(config));

        return config;
    }

    async getRawConfig(): Promise<string> {
        return fs.readFileSync(this.DYNAMIC_CONFIG, 'utf8');
    }

    async updateRawConfig(content: string): Promise<void> {
        // Validate YAML syntax before writing
        try {
            parse(content);
            fs.writeFileSync(this.DYNAMIC_CONFIG, content);
        } catch (error) {
            throw new Error(`Invalid YAML syntax: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async validateYaml(content: string): Promise<{valid: boolean; error?: string}> {
        try {
            parse(content);

            return {valid: true};
        } catch (error) {
            return {
                valid: false,
                error: error instanceof Error ? error.message : 'Unknown YAML parsing error',
            };
        }
    }
}
