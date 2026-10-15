const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  devtool: 'inline-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      title: 'Weather App',
    }),
    new Dotenv(), // 1. 注入你的 .env 密钥，解决 API 泄露与 process is not defined
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.js$/i,
        type: 'javascript/auto', // 2. 核心护城河：强制允许 .js 文件使用 import/export 语法！
      },
    ],
  },
};
