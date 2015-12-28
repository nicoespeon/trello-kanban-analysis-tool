exports.config = {
  files: {
    javascripts: {
      joinTo: {
        'vendor.js': /^(bower_components|vendor)/,
        'app.js': /^app/
      }
    },
    stylesheets: {
      joinTo: 'app.css'
    }
  },

  plugins: {
    babel: {
      ignore: [ /^(bower_components|vendor)/ ],
      loose: "all"
    }
  }
};
