import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react({
      babel: {
        // Suppress "deoptimised the styling" warning for large Figma SVG files (>500KB)
        compact: false,
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      // Resolve Figma Make asset imports to the local exported assets directory.
      { find: /^figma:asset\//, replacement: `${path.resolve(__dirname, './src/assets')}/` },
      // Alias @ to the src directory
      { find: '@', replacement: path.resolve(__dirname, './src') },
      // Pin 'three' to a single module file so sub-path imports
      // (e.g. three/examples/jsm/*) that re-export from 'three'
      // always get the exact same instance — eliminates the
      // "Multiple instances of Three.js being imported" warning.
      { find: /^three$/, replacement: path.resolve(__dirname, 'node_modules/three/build/three.module.js') },
    ],
    // Force Vite to always resolve 'three' from the project root so that
    // `import * as THREE from 'three'` and the `from 'three'` inside
    // three/examples/jsm/* hit the exact same module instance.
    dedupe: ['three', 'react', 'react-dom'],
  },
  optimizeDeps: {
    // Pre-bundle core packages into single optimized chunks.
    include: ['react', 'react-dom'],
    // Exclude three from pre-bundling so that `import * as THREE from 'three'`
    // and `from 'three'` inside three/examples/jsm/* resolve to the exact
    // same ESM module instance — prevents the duplicate-instance warning.
    exclude: ['three'],
  },
})
