"use strict";

const { AsyncNedb } = require("nedb-async");
var database = new AsyncNedb({
  filename: "/home/node/database/database.json",
  autoload: true
});

module.exports = {
  get: async (id = "", limit = 10, page = 0, query = "", rating = 0) => {
    if (id) {
      return await database.asyncFind({ _id: id });
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
        results = await database.asyncFind({ rating: { $gt: 1 } }, [
          ["limit", limit],
          ["skip", page]
        ]);
        console.log("Rating:", rating);
      } else {
        results = await database.asyncFind(temp, [
          ["limit", limit],
          ["skip", page]
        ]);
      }

      console.log("returnDB:", results);
      return results;
    }
  },
  getTotal: async () => {
    let count = await database.asyncCount({});
    return count;
  },
  updateRating: async (id, rating) => {
    return await database.asyncUpdate(
      { _id: id },
      { $set: { rating: rating } }
    );
  },
  findById: async id => {
    return await database.asyncFind({ _id: id });
  },
  findByTitle: async title => {
    return await database.asyncFind({ title: title });
  },
  insert: async doc => {
    return await database.asyncInsert(doc);
  },
  updateByTitle: async (title, updatedDoc) => {
    return await database.asyncUpdate({ title: title }, { $set: updatedDoc });
  }
};
