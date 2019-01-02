const path = require('path');
const fs = require('fs');

configurations = [
  { 
    mode: 'development',
    entry: {
      ungit: './client/src/main.js'
    },
    output: {
      filename: "ungit-web.js",
      path: path.resolve('./client/dist'),
      library: 'Ungit'
    },
    externals: {
      knockout: 'ko'
    },
    module: {
      rules: [
        {
          test: /\.(css|less)$/,
          use: ['style-loader', { loader: 'css-loader',  options: { url: false } }, 'less-loader']
        },
        {
          test: /\.html$/,
          use: [{ loader: 'file-loader', options: { name: '[name].[ext]' } }]
        }
      ]
    }
  }
]

fs.readdirSync('./client/src/components').forEach((component) => {
  configurations.push({
    mode: 'development',
    entry: `./client/src/components/${component}/${component}.js`,
    output: {
      filename: `${component}.bundle.js`,
      path: path.resolve('./client/dist/plugins/', component)
    },
    externals: {
      knockout: 'ko'
    },
    module: {
      rules: [{
        test: /\.less$/,
        use: ['style-loader', { loader: 'css-loader', options: { url: false } }, 'less-loader']
      }]
    }
  })
})

module.exports = configurations
