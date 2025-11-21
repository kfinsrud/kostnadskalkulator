// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';

export default {
    input: 'src/index.ts', // Point to your entry file, adjust as needed
    output: {
        file: 'dist/bundle.js', // Output file
        format: 'cjs', // Output format (cjs for CommonJS)
        sourcemap: true // Enable source maps
    },
    plugins: [
        resolve(), // Resolves node modules
        typescript() // Compiles TypeScript
    ],
    external: (id) => {
        // Don't externalize relative imports (our source code) or absolute paths
        if (id.startsWith('.') || id.startsWith('/') || id.includes('\\')) {
            return false;
        }
        // Externalize all bare module imports (from node_modules)
        return true;
    }

};