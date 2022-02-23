const mongoose = require("mongoose");
module.exports = () =>
  mongoose.connect(
    // process.env.NODE_ENV === "test"
    "mongodb://127.0.0.1:27017/SDE"
  );
//  "mongodb+srv://rahul3105:abcd3105@sde-task.rxiec.mongodb.net/myFirstDatabase"
