const { Schema, model } = require("mongoose");

const fileSchema = new Schema(
  {
    file_name: { type: String, required: true },
    file_url: { type: String, required: true },
    extension: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("file", fileSchema);
