const path = require('path');
const fs = require('fs');

configurations = [
  { 
    mode: 'development',
    entry: {
      ungit: './public/source/main.js'
    },
    output: {
      filename: "ungit-web.js",
      path: path.resolve('./public/js'),
      library: 'Ungit'
    },
    externals: {
      knockout: 'ko'
    },
    module: {
      rules: [{
        test: /\.(css|less)$/,
        use: ['style-loader', { loader: 'css-loader',  options: { url: false } }, 'less-loader']
      }]
    }
  }
]

fs.readdirSync('components').forEach((component) => {
  configurations.push({
    mode: 'development',
    entry: `./components/${component}/${component}.js`,
    output: {
      filename: `${component}.bundle.js`,
      path: path.resolve('./components/', component)
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
