module.exports = {
	extends: 'airbnb',
	globals: {
		localStorage: true,
	},
	rules: {
		'react/jsx-filename-extension': 0,
		'react/sort-comp': 0,
		'implicit-arrow-linebreak': 1,
	},
	parser: 'babel-eslint',
	parserOptions: {
		sourceType: 'module'
	}
}