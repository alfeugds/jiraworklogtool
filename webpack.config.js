const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  entry: {
    popup: './chrome-extension/popup.js',
    options: './chrome-extension/options.js'
  },
  target: 'web',
  devtool: 'source-map',
  // Where files should be sent once they are bundled
  output: {
    path: path.join(__dirname, '/dist', '/extension'),
    filename: '[name].bundle.js',
    clean: true
  },
  // webpack 5 comes with devServer which loads in development mode
  devServer: {
    port: 3000,
    watchContentBase: true
  },
  // Rules of how webpack will take our files, compile & bundle them for the browser
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.s?css$/,
        exclude: /node_modules/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.json$/,
        loader: 'file-loader',
        options: 'name=[name].json'
      }
    ]
  },
  plugins: [
    // new HtmlWebpackPlugin({ template: './chrome-extension/popup.html' }),
    new CopyPlugin({
      patterns: [
        {
          from: 'chrome-extension/*.json',
          to: '[name][ext]'
        },
        {
          from: 'chrome-extension/*.html',
          to: '[name][ext]'
        },
        {
          from: 'chrome-extension/img/*.*',
          to: 'img/[name][ext]'
        }
      ]
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser'
    })
  ],
  optimization: {
    minimize: false
  }
}
