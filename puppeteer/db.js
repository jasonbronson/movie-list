"use strict";

const { AsyncNedb } = require("nedb-async");
var database = new AsyncNedb({ filename: "./database.json", autoload: true });

module.exports = {
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
    return await database.asyncFindOne({ title: title });
  },
  insert: async doc => {
    return await database.asyncInsert(doc);
  },
  updateByTitle: async (title, updatedDoc) => {
    return await database.asyncUpdate({ title: title }, { $set: updatedDoc });
  }
};
