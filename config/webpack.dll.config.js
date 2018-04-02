const path = require('path')
const paths = require('./paths')
const webpack = require('webpack')

const vendors = [
  'antd',
  'react',
  'react-dom',
  'react-router',
  'redux',
  'moment',
  'react-redux'
]

module.exports = {
  output: {
    path: paths.appPublic,
    filename: '[name].dll.js',
    library: '_dll_[name]'
  },
  entry: {
    vendor: vendors
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(paths.appPublic, '[name].manifest.json'),
      name: '_dll_[name]'
    })
  ]
}
