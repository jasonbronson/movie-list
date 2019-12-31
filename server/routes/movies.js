var express = require("express");
var router = express.Router();
var cors = require("cors");

var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const movies = require("../controllers/movies");
router.get("/movies", cors(corsOptions), movies.get);

//router.get("/movies/test", cors(corsOptions), movies.download);

router.post("/movies", cors(corsOptions), movies.download);
router.post("/movies/:id", cors(corsOptions), movies.rating);

module.exports = router;
