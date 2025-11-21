/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
// https://vitejs.dev/config/
export default defineConfig({
    optimizeDeps: {
        exclude: ['@skogkalk/common']
    },
    build: {
        outDir: 'build',
        commonjsOptions: {
            transformMixedEsModules: true,
            include: [/@skogkalk\/common/, /node_modules/]
        }
    },
    test: {
        globals: true,
        environment: 'jsdom',
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