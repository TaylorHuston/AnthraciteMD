await import('reflect-metadata');
const { Ignitor, prettyPrintError } = await import('@adonisjs/core');
const appRoot = new URL('../', import.meta.url);
const importer = (filePath) => import(filePath.startsWith('.') ? new URL(filePath, appRoot).href : filePath);
new Ignitor(appRoot, { importer }).ace().handle(process.argv.splice(2)).catch((error) => {
    process.exitCode = 1;
    prettyPrintError(error);
});
export {};
//# sourceMappingURL=console.js.map