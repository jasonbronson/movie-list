var express = require("express");
var router = express.Router();

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

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
