/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        outDir: 'build'
    },
    base: '/editor/',
    server: {
        port: 3000,
    },
    test: {
        globals: true,
        environment: 'happy-dom',
        coverage: {
            provider: 'v8'
        },
    },
    plugins: [
        react(),
        viteTsconfigPaths(),
        svgr({
            include: '**/*.svg?react',
        }),
    ],
});
//    "test": "jest --runInBand --detectOpenHandles --forceExit --collect-coverage",
