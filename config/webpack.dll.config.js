const path = require('path')
const webpack = require('webpack')

const vendors = [
  'antd',
  'react',
  'react-dom',
  'react-router'
]

module.exports = {
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].[chunkhash].js',
    library: '[name]_[chunkhash]'
  },
  entry: {
    vendor: vendors
  },
  plugins: [
    new webpack.DllPlugin({
      path: 'manifest.json',
      name: '[name]_[chunkhash]',
      context: __dirname
    })
  ]
}
