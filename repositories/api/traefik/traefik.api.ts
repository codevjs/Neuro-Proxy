import axios from 'axios';
import {singleton} from 'tsyringe';

import {ITreafikEntryPointsApi, ITreafikOverviewApi, ITreafikRouterApi, ITreafikServiceApi} from './traefik.api.interface';

@singleton()
export class TraefikAPIRepository {
    private readonly TRAEFIK_API_URL = `${process.env.TRAEFIK_API_URL}/api`;

    private config(endPoint: string) {
        console.log(this.TRAEFIK_API_URL);

        return {
            method: 'get',
            url: `${this.TRAEFIK_API_URL}/${endPoint}`,
        };
    }

    private async request(endPoint: string) {
        const response = await axios(this.config(endPoint));

        return response.data;
    }

    async overview(): Promise<ITreafikOverviewApi> {
        return await this.request('overview');
    }

    async getAllEntryPoints(): Promise<ITreafikEntryPointsApi[]> {
        return await this.request('entrypoints');
    }

    async getEntryPointByName(name: string): Promise<ITreafikEntryPointsApi> {
        return await this.request(`entrypoints/${name}`);
    }

    async getAllServices(): Promise<ITreafikServiceApi[]> {
        return await this.request('http/services');
    }

    async getServiceByName(name: string): Promise<ITreafikServiceApi> {
        return await this.request(`http/services/${name}`);
    }

    async getAllRouters(): Promise<ITreafikRouterApi[]> {
        return await this.request('http/routers');
    }

    async getRouterByName(name: string): Promise<ITreafikRouterApi> {
        return await this.request(`http/routers/${name}`);
    }

    async getAllMiddlewares(): Promise<any[]> {
        return await this.request('http/middlewares');
    }

    async getMiddlewareByName(name: string): Promise<any> {
        return await this.request(`http/middlewares/${name}`);
    }
}
