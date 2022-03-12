const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = (env, argv) => ({
  mode: argv.mode || 'production',
  devtool: argv.mode ? 'source-map' : '',
  watch: !!argv.mode,
  entry: {
    background: './src/background.js',
    'content-script': {
      import: './src/inject/content-script.js',
      filename: 'inject/content-script.js',
    },
    playback: {
      import: './src/playback/playback.js',
      filename: 'playback/playback.js'
    },
    popup: {
      import: './src/popup/popup.js',
      filename: 'popup/popup.js',
    },
  },
  output: { 
    path: path.resolve(__dirname, 'build') ,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ],
      },
      {
        test: /\.png$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              mimetype: 'image/png'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'playback', 'playback.html'),
      filename: 'playback/playback.html',
      chunks: ['playback'],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'popup', 'popup.html'),
      filename: 'popup/popup.html',
      chunks: ['popup'],
    }),
    new CopyPlugin({
      patterns: [
        {
          from: './src/assets', 
          to: path.resolve(__dirname, 'build', 'assets') 
        },
        {
          from: './src/manifest.json' 
        },
      ]
    }),
    new MiniCssExtractPlugin({
      filename: '[name]/[name].css'
    }),
  ],
  optimization: {
    minimizer: [
      `...`,
      new CssMinimizerPlugin(),
    ],
  },
});
