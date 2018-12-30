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
    }
  })
})

module.exports = configurations
