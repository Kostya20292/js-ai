import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import { fileURLToPath } from 'node:url';
import { auditSourcesPlugin } from './vite-plugin-audit-sources.ts';

const srcPath = (segment: string) => fileURLToPath(new URL(`./src/${segment}`, import.meta.url));

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), auditSourcesPlugin()],
  resolve: {
    alias: {
      '@api': srcPath('api'),
      '@config': srcPath('config'),
      '@services': srcPath('services'),
      '@hooks': srcPath('hooks'),
      '@components': srcPath('components'),
      '@utils': srcPath('utils'),
      '@types': srcPath('types.ts'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [fileURLToPath(new URL('./src/styles', import.meta.url))],
      },
    },
  },
});
