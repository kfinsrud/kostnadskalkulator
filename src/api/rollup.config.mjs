// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';

export default {
    input: 'dist/index.js', // Point to compiled JS
    output: {
        file: 'dist/bundle.cjs', // Output file
        format: 'cjs', // Output format (cjs for CommonJS)
        sourcemap: true // Enable source maps
    },
    plugins: [
        resolve() // Resolves node modules
    ],
    external: (id) => {
        // Don't externalize @skogkalk/common - it needs to be bundled
        if (id.startsWith('@skogkalk/common')) {
            return false;
        }
        // Don't externalize absolute paths to our source files
        if (id.includes('/src/') || id.includes('\\src\\')) {
            return false;
        }
        // Don't externalize relative imports (our source code)
        if (id.startsWith('.') || id.startsWith('/')) {
            return false;
        }
        // Externalize all other bare module imports (from node_modules)
        return true;
    }

};