const db = require("../db/db");

module.exports = {
  get: async (req, res, next) => {
    // check if required parameter are provided
    // if (!req.params.name) {
    //   return next(new Error('Required parameters not provided'));
    // }

    //console.log("**", req.query);
    let query = req.query.q;
    let limit = req.query._limit;
    let page = req.query._page;
    let id = req.query.id;
    let rating = req.query.rating_gte;

    const all = await db.get(id, limit, page, query, rating);

    let count = await db.getTotal();

    //console.log("DB**", all);
    res.status(200).json({
      rows: all,
      totalRecords: count
    });
  },
  rating: async (req, res, next) => {
    let rating = req.body.rating;
    let id = req.params.id;
    console.log(id, rating);
    await db.updateRating(id, rating);
    res.status(200).json({
      saved: "saved"
    });
  },
  download: async (req, res, next) => {
    // check if required parameter are provided
    // if (!req.params.name) {
    //   return next(new Error('Required parameters not provided'));
    // }

    const all = await db.test();
    //console.log("DB**", all);
    res.status(200).json({
      saved: "saved"
    });
  }
};
