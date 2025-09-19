import Docker from 'dockerode';
import {singleton} from 'tsyringe';

@singleton()
export class DockerApiRepository {
    private docker: Docker;

    constructor() {
        this.docker = new Docker({
            socketPath: '/var/run/docker.sock',
        });
    }

    async getAllContainer() {
        return await this.docker.listContainers({all: true});
    }

    getOneContainer(id: string) {
        return this.docker.getContainer(id);
    }

    async getAllNetwork() {
        return await this.docker.listNetworks();
    }

    async joinNetwork(containerId: string, networkName: string) {
        const network = this.docker.getNetwork(networkName);

        await network.connect({Container: containerId});
    }

    async leaveNetwork(containerId: string, networkName: string) {
        const network = this.docker.getNetwork(networkName);

        await network.disconnect({Container: containerId});
    }

    async duplicateContainer(containerId: string, newContainerName: string = 'new-container-name') {
        try {
            // Step 1: Get the original container
            const container = this.getOneContainer(containerId);
            const containerInfo = await container.inspect();

            // Step 2: Extract network settings
            const networks = Object.keys(containerInfo.NetworkSettings.Networks);

            if (networks.length === 0) {
                throw new Error('❌ Original container is not connected to any network.');
            }

            // Step 3: Create a new container with the same network settings
            const newContainer = await this.docker.createContainer({
                Image: containerInfo.Config.Image,
                Cmd: containerInfo.Config.Cmd,
                Env: containerInfo.Config.Env,
                HostConfig: {
                    ...containerInfo.HostConfig,
                    NetworkMode: networks[0], // Set the same network mode
                },
                Labels: containerInfo.Config.Labels,
                name: newContainerName,
            });

            console.log(`✅ New container created with ID: ${newContainer.id}`);

            // Step 4: Connect the new container to all networks
            for (const networkName of networks) {
                const network = this.docker.getNetwork(networkName);

                await network.connect({Container: newContainer.id});
                console.log(`🔗 Connected ${newContainerName} to network ${networkName}`);
            }

            // Step 5: Start the new container
            await newContainer.start();

            console.log(`🚀 New container '${newContainerName}' started successfully.`);

            return newContainer;
        } catch (error) {
            console.error(error);

            throw new Error(`❌ Error while duplicating container: ${error.message}`);
        }
    }

    async removeContainer(containerId: string) {
        try {
            const container = this.getOneContainer(containerId);

            await container.remove({force: true});
            console.log(`✅ Container with ID: ${containerId} removed successfully.`);
        } catch (error) {
            throw new Error(`❌ Error while removing container: ${error.message}`);
        }
    }
}
