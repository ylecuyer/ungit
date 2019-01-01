const path = require('path');
const fs = require('fs');

configurations = [
  {
    mode: 'development',
    entry: {
      ungit: './public/source/main.js'
    },
    output: {
      filename: "[name].js",
      path: path.resolve('./public/js')
    },
    externals: {
      knockout: 'ko'
    }
  }
  ,
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
    }
  })
})

module.exports = configurations
