module.exports = {
	content: [
		'./src/index.html',
		'./src/**/*.{js,ts,jsx,tsx}',
		'./src/**/*.scss', // Importante para processar @apply nos arquivos
	],
	theme: {
		extend: {},
	},
	plugins: [require(daisyui)],
	daisyui: {
		themes: ['light', 'dark'],
	},
};
