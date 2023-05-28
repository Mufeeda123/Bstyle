const mongoClient = require("mongodb").MongoClient;
const state = {
  db: null,
};
module.exports.connect = function (done) {
  const url = "mongodb+srv://Bstyle:0000@cluster0.9x2nzns.mongodb.net/?retryWrites=true&w=majority";
  const dbname = "BStyle";

  mongoClient.connect(url, (err, data) => {
    if (err) return done(err);
    state.db = data.db(dbname);
    done();
  });
};

module.exports.get = function () {
  return state.db;
};
