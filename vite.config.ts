// vite.config.ts
import { defineConfig } from 'vite';
import * as fs from 'node:fs';

const files = fs.readdirSync('.');
const htmlFiles = files.filter(file => file.endsWith('.html') && file !== 'index.html');

export default defineConfig({
    plugins: [
        {
            name: 'pre-dev-server-action',
            transform(code, id) {
                if (id.includes('index.ts')) {
                    const links = htmlFiles.map(fileName => `<li><a href="${fileName}">${fileName}</a></li>`).join('');
                    code += `;\ndocument.querySelector('ul').innerHTML = '${links}';`;
                }
                return code;
            },
        },
    ],
});