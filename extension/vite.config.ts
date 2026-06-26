import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		rollupOptions: {
			input: {
				background: 'src/background.ts',
				'editor-fill-content': 'src/editor-fill-content.ts',
				'trigger-content': 'src/trigger-content.ts',
				popup: 'src/popup/popup.ts',
			},
			output: {
				entryFileNames: '[name].js',
				chunkFileNames: 'chunks/[name]-[hash].js',
				assetFileNames: 'assets/[name][extname]',
			},
		},
	},
});
