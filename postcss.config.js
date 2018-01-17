const precss = require('precss');
const autoprefixer = require('autoprefixer');

module.exports = {
	plugins: {
		precss: precss,
		autoprefixer: { browsers: ['last 4 versions'] }
	},
};