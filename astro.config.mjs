// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import catppuccin from 'starlight-theme-catppuccin';

// https://astro.build/config
export default defineConfig({
	site: 'https://docs.happypathology.com',
	integrations: [
		starlight({
			title: 'HappyPathology Docs',
			plugins: [
				catppuccin({
					dark: 'mocha-blue',
					light: 'latte-blue',
				}),
			],
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/magimedical' }],
			sidebar: [
				 {
				 	label: 'Guides',
				 	items: [
				 		{ label: 'Getting Started', slug: 'guides/getting-started' },
						{ label: 'Check Connectivity', slug: 'guides/check-connectivity' },
						{ label: 'Auth Model', slug: 'guides/auth-model' },
						{ label: 'Create Signing Key Pairs', slug: 'guides/create-signing-key-pairs' },
						{ label: 'Signing JWTs', slug: 'guides/signing-jwts' },
						{ label: 'Verifying JWTs', slug: 'guides/verifying-jwts' },
						{ label: 'Make Authenticated Calls', slug: 'guides/make-authenticated-calls' },
						// { label: 'Data Model', slug: 'guides/data-model' },

				 		// { label: 'CBC Workflow', slug: 'guides/cbc-workflow' },
				 	],
				 },
				// {
				// 	label: 'Overview',
				// 	items: [
				// 		{ label: 'Getting Started', slug: 'guides/getting-started' },
				// 		// { label: 'Introduction', slug: 'introduction' },
				// 		// { label: 'Authentication', slug: 'api/authentication' },
				// 		{ label: 'HTTP Responses', slug: 'api/responses' },
				// 		{ label: 'Errors', slug: 'resources/errors' },
				// 	],
				// },
				{
					label: 'API Reference',
					items: [
						// { label: 'Endpoints', slug: 'api/endpoints' },
						{ label: 'Health Check', slug: 'api/health-check' },
					],
				},
				{
					label: 'Resources',
					items: [
						{ label: 'Status Page', slug: 'resources/status-page' },
						// { label: 'Sample Code', slug: 'resources/sample-code' },
					],
				},
			],
			components: {
				Sidebar: './src/components/CustomSidebar.astro',
			},
		}),
		react(),
	],
});
