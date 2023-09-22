import { vitePreprocess } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-netlify';

const config = {
	kit: {
		adapter: adapter({
			split: false
		})
	},

	preprocess: [vitePreprocess({})]
};

export default config;
