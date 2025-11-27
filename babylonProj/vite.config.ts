import  { defineConfig } from 'vite';

export default defineConfig({
    optimizeDeps: {
        include: [
            "@babylonjs/core",
            "@babylonjs/loaders",
            "@babylonjs/gui",
            "@babylonjs/materials",
            "@babylonjs/havok"
        ]
    },
})