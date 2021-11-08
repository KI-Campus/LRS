var path = require('path');
var nodeEnv = process.env.NODE_ENV || 'development';
var isDev = (nodeEnv !== 'production');

var config = {
  mode: nodeEnv,
  entry: {
    dist: './src/entries/main.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'h5p-interactive-book.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        loader: 'babel-loader'
      },
      {
        test:/\.scss$/,
        include: path.resolve(__dirname, 'src/styles'),
        use:['style-loader','css-loader', 'sass-loader']
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        include: path.resolve(__dirname, 'src'),
        loader: 'url-loader?limit=100000'
      }
    ]
  },
  externals: {
    jquery: 'H5P.jQuery'
  }
};

if (isDev) {
  config.devtool = 'inline-source-map';
}

module.exports = config;
