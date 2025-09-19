import stream from 'stream';

import {NextRequest} from 'next/server';

import container from '@/server-container';
import {DockerApiRepository} from '@/repositories/api/docker/docker.api';

const dockerApiRepository = container.resolve(DockerApiRepository);

function removeFirstChars(str: string) {
    const reg = /^......../;
    let res = '';
    const lines = str.split(/\n/);

    lines.forEach((line) => {
        line = line.replace(reg, '');
        res += line + '\n';
    });

    return res;
}

// create a single stream for stdin and stdout
const logStream = new stream.PassThrough();

export async function GET(req: NextRequest) {
    const {searchParams} = new URL(req.url);
    const containerId = searchParams.get('containerId');

    if (!containerId) {
        return new Response(JSON.stringify({error: 'Missing containerId'}), {
            status: 400,
            headers: {'Content-Type': 'application/json'},
        });
    }

    try {
        const container = dockerApiRepository.getOneContainer(containerId);

        const stream = await container.logs({
            follow: true, // Enable live logs
            stdout: true,
            stderr: true,
            tail: 100,
            timestamps: false,
        });

        container.modem.demuxStream(stream, logStream, logStream);

        const encoder = new TextEncoder();

        const readableStream = new ReadableStream({
            start(controller) {
                logStream.on('data', (chunk) => {
                    controller.enqueue(encoder.encode(`data: ${removeFirstChars(chunk.toString('utf-8'))}\n\n`));
                });

                logStream.on('end', () => {
                    controller.close();
                });

                logStream.on('error', (error) => {
                    controller.close();
                });
            },
        });

        stream.on('end', function () {
            logStream.end('!stop!');
        });

        return new Response(readableStream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({error: error.message}), {
            status: 500,
            headers: {'Content-Type': 'application/json'},
        });
    }
}
