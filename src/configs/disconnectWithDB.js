const mongoose = require("mongoose");
module.exports = () => mongoose.disconnect("mongodb://127.0.0.1:27017/SDE");
