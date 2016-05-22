module.exports = {
  "extends": "airbnb",
  "plugins": [
    "react"
  ],
  "globals": {
    "Trello": true,
    "d3": true
  },
  "rules": {
    "new-cap": ["error", {"capIsNew": false}],
    "no-underscore-dangle": [ "error", { "allow": ["__"] } ],

    // Authorize console logs while app is still not stable.
    "no-console": ["off"]
  }
};
