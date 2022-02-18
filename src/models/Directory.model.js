const { Schema, model } = require("mongoose");

const directorySchema = new Schema(
  {
    directory_name: { type: String, required: true },
    sub_directories: [
      {
        type: Schema.Types.ObjectId,
        required: false,
        ref: "directory",
      },
    ],
    files: [{ type: Schema.Types.ObjectId, required: false, ref: "file" }],
    path: { type: String, required: false },
    parent: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: "directory",
      default: null,
    },
    user: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("directory", directorySchema);
