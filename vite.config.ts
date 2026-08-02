import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import { fileURLToPath } from 'node:url';
import { auditSourcesPlugin } from './vite-plugin-audit-sources.ts';

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), auditSourcesPlugin()],
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [fileURLToPath(new URL('./src/styles', import.meta.url))],
      },
    },
  },
});
