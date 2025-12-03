// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import catppuccin from 'starlight-theme-catppuccin';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'HappyPathology Docs',
			plugins: [
				catppuccin({
					dark: 'mocha-blue',
					light: 'latte-blue',
				}),
			],
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/happypathology/docs' }],
			sidebar: [
				{
					label: 'Overview',
					items: [
						{ label: 'Introduction', slug: 'introduction' },
						{ label: 'Authentication', slug: 'api/authentication' },
						{ label: 'HTTP Responses', slug: 'api/responses' },
						{ label: 'Errors', slug: 'resources/errors' },
					],
				},
				{
					label: 'API Reference',
					items: [
						{ label: 'Endpoints', slug: 'api/endpoints' },
						{ label: 'Health Check', slug: 'api/health-check' },
					],
				},
				{
					label: 'Guides',
					items: [
						{ label: 'Detection Workflow', slug: 'guides/pbs-workflow' },
					],
				},
				{
					label: 'Resources',
					items: [
						{ label: 'Sample Code', slug: 'resources/sample-code' },
					],
				},
			],
		}),
		react(),
	],
});
