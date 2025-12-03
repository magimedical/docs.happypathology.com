// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'HappyPathology Docs',
			customCss: ['./src/styles/custom.css'],
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/happypathology/docs' }],
			sidebar: [
				{
					label: 'Guides',
					items: [
						{ label: 'Getting Started', slug: 'guides/getting-started' },
					],
				},
				{
					label: 'API Reference',
					items: [
						{ label: 'Introduction', slug: 'api/introduction' },
						{ label: 'Endpoints', slug: 'api/endpoints' },
					],
				},
			],
		}),
		react(),
	],
});
