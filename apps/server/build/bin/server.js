await import('reflect-metadata');
const { Ignitor, prettyPrintError } = await import('@adonisjs/core');
const appRoot = new URL('../', import.meta.url);
const importer = (filePath) => import(filePath.startsWith('.') ? new URL(filePath, appRoot).href : filePath);
new Ignitor(appRoot, { importer })
    .tap((app) => app.listen('SIGTERM', () => app.terminate()))
    .httpServer()
    .start()
    .catch((error) => {
    process.exitCode = 1;
    prettyPrintError(error);
});
export {};
//# sourceMappingURL=server.js.map