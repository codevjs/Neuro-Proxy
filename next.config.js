/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '25mb',
        },
    },
    serverExternalPackages: ['dockerode'],
    redirects: async () => {
        return [
            {
                source: '/',
                destination: '/panel/dashboard',
                permanent: false,
            },
        ];
    },
};

module.exports = nextConfig;
