var express = require("express");
var router = express.Router();
var cors = require("cors");

var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const scanner = require("../controllers/scanner");
router.get("/scan", cors(corsOptions), scanner.get);

module.exports = router;
