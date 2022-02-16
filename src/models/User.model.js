const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new Schema(
  {
    first_name: { type: "string", required: true },
    last_name: { type: "string", required: false },
    email: { type: "string", required: true },
    password: { type: "string", required: true },
    root_directory: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: "directory",
    },
  },
  { timestamps: true, versionKey: false }
);
userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hashSync(this.password, 8);
  next();
});

userSchema.methods.checkPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};
const User = model("user", userSchema);

module.exports = User;
