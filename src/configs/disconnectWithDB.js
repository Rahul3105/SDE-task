const mongoose = require("mongoose");
require("dotenv").config();
module.exports = () =>
  mongoose.disconnect(
    process.env.NODE_ENV === "test"
      ? "mongodb://127.0.0.1:27017/SDE"
      : `mongodb+srv://rahul3105:${process.env.MONGO_DB_PASSWORD}@sde-task.rxiec.mongodb.net/myFirstDatabase`
  );
