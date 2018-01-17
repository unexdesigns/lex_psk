var webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');


module.exports = env => {
	let dev  = env.NODE_ENV === 'dev';
	let prod = env.NODE_ENV === 'prod';

	let entry;

	if(dev){
		entry = [
			'./scripts/src/index.js'
		]
	} else {
		entry = [
			'babel-polyfill',
			'./scripts/src/index.js'
		]
	}

	let plugins = [
		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery',
			Popper: ['popper.js', 'default'],

		}),
		new ExtractTextPlugin("styles/css/style.css"),
		new webpack.DefinePlugin({ "DEV": dev, "PROD": prod}),
	]

	if(prod){
		plugins.push(new UglifyJSPlugin());
	}

	return {
		entry: entry,
		devtool: 'inline-source-map',
		output: {
			filename: './scripts/dist/bundle.js'
		},
		watch: dev,
		devServer: {
			
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /(node_modules|bower_components)/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: ['babel-preset-env']
						}
					}
				},
				{
					test: /\.scss$/,
					use: ExtractTextPlugin.extract({
						fallback: "style-loader",
						use: [
							{
								loader: 'css-loader',
								options: {
									minimize: prod,
									sourceMap: dev
								}
							},
							{
								loader: 'postcss-loader',
								options: { sourceMap: dev }
							},
							{
								loader: 'sass-loader',
								options: { sourceMap: dev }
							}
						]
					})
				}
			]
		},
		plugins: plugins
	}
};
