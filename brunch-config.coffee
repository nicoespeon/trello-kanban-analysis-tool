module.exports = config:
  paths:
    watched: [ 'app', 'node_modules/nvd3/build/nv.d3.css' ]

  files:
    javascripts: joinTo: 'app.js'
    stylesheets: joinTo:
      'app.css': 'app/**/*.scss'
      'vendor.css': 'node_modules/nvd3/build/nv.d3.css'

  conventions:
    ignored: /-test\.js/

  plugins:
    babel:
      loose: 'all'

    postcss:
      processors: [
        require('autoprefixer')(['last 8 versions'])
      ]
