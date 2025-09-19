// this is the entrypoint of client and server side
export async function register() {
    // import the the sides that you wish
    await import('./server-container');
}
