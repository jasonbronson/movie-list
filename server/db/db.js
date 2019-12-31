"use strict";

const { AsyncNedb } = require("nedb-async"),
  db = new AsyncNedb({ filename: "../../database.json", autoload: true });

// const Datastore = require("nedb"),
//   db2 = new Datastore({ filename: "../../temp.json", autoload: true });

module.exports = {
  get: async (id = "", limit = 10, page = 0, query = "", rating = 0) => {
    if (id) {
      return await db.asyncFind({ _id: id });
    } else {
      page = page * limit;
      let temp = {};
      let results;
      if (query) {
        let rege = new RegExp(query, "gi");
        temp = { title: rege };
        console.log("Query:", temp);
      }
      if (rating) {
        results = await db.asyncFind({ rating: { $gt: 0 } }, [
          ["limit", limit],
          ["skip", page]
        ]);
        console.log("Rating:", rating);
      } else {
        results = await db.asyncFind(temp, [
          ["limit", limit],
          ["skip", page]
        ]);
      }

      console.log("returnDB:", results);
      return results;
    }
  },
  getTotal: async () => {
    let count = await db.asyncCount({});
    return count;
  },
  updateRating: async (id, rating) => {
    return await db.asyncUpdate({ _id: id }, { $set: { rating: rating } });
  }
};

// db.insert(movie, function (err, newDoc) {   // Callback is optional
//     // newDoc is the newly inserted document, including its _id
//     // newDoc has no key called notToBeSaved since its value was undefined
//     });
