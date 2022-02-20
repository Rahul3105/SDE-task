const mongoose = require("mongoose");
module.exports = () =>
  mongoose.connect(
    "mongodb+srv://rahul3105:abcd3105@sde-task.rxiec.mongodb.net/myFirstDatabase"
  );
