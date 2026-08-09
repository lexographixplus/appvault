import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// The bundle's asset URLs must match the path the site is served from, or every
// request 404s. This deployment uses the custom domain appvault.lexostudio.gm,
// which serves from the root — hence '/'. A GitHub Pages *project* site without
// a custom domain lives at https://<user>.github.io/<repo>/ and needs
// BASE_PATH=/<repo>/ instead.
const BASE_PATH = process.env.BASE_PATH ?? '/';

export default defineConfig(({command, isPreview}) => {
  return {
    // `vite preview` also reports command === 'serve', but it serves the built
    // bundle — it needs the same base as the build or every asset 404s.
    // The dev server runs behind Express at the root, so it stays on '/'.
    base: command === 'build' || isPreview ? BASE_PATH : '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
