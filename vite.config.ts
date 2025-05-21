// vite.config.ts
import { defineConfig } from 'vite';
import * as fs from 'node:fs';

export default defineConfig({
    plugins: [
        {
            name: 'pre-dev-server-action',
            buildStart() {
                console.log('Performing action before dev server start...');
                // get html files at same level as vite.config.ts
                const files = fs.readdirSync('.');
                const htmlFiles = files.filter(file => file.endsWith('.html') && file !== 'index.html');
                console.log('htmlFiles', htmlFiles);
            },
        },
    ],
});