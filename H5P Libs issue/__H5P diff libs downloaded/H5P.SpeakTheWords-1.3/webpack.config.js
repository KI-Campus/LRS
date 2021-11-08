var path = require('path');
var webpack = require('webpack');

var nodeEnv = process.env.NODE_ENV || 'development';
var isDev = (nodeEnv !== 'production');

var config = {
  entry: {
    dist: './app/entries/dist.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'app'),
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        include: path.resolve(__dirname, 'app'),
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};

if (isDev) {
  config.devtool = 'inline-source-map';
}

module.exports = config;
