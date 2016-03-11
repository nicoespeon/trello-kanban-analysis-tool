module.exports = config:
  paths:
    watched: [ 'app' ]

  files:
    javascripts: joinTo: 'app.js'
    stylesheets: joinTo: 'app.css'

  plugins:
    babel:
      loose: "all"
