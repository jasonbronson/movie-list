var express = require("express");

const routes = {
  // PUBLIC ROUTES
  movies: require("./movies")
};

module.exports = function(app) {
  // Use Routes
  for (let key in routes) {
    app.use(routes[key]);
  }
};
