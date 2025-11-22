import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";

export default defineConfig({
    build: {
        outDir: "dist",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                background: "src/background.js",
                content: "src/content.js",
            },
            output: {
                entryFileNames: `[name].js`,
                chunkFileNames: `[name].js`,
                assetFileNames: `[name].[ext]`,
            },
        },
    },
    plugins: [
        {
            name: "copy-manifest-and-assets",
            closeBundle() {
                const dest = resolve(__dirname, "dist");

                fs.copyFileSync(
                    resolve(__dirname, "manifest.json"),
                    resolve(dest, "manifest.json")
                );

                fs.copyFileSync(
                    resolve(__dirname, "public/icone-128.png"),
                    resolve(dest, "icone-128.png")
                );
            },
        },
    ],
});
