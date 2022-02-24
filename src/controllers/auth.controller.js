const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const Directory = require("../models/Directory.model");
require("dotenv").config();
const newToken = (user) => {
  return jwt.sign({ user }, process.env.JWT_SECRET_KEY);
};

const signup = async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });

    if (user)
      return res
        .status(401)
        .send({ error: true, message: "user already exist" });

    user = await User.create(req.body);

    const root_directory_id = await createDir(user);

    if (!root_directory_id) {
      await User.findByIdAndDelete(user.id);
      return res.status(500).json({ error: true, message: "Try again😣" });
    }
    user.root_directory = root_directory_id;
    user.save();
    const token = newToken(user);
    res.status(201).json({
      error: false,
      token,
      message: "Account created successfully😋",
    });
  } catch (err) {
    console.log("signup of auth controller", err.message);
    res.status(500).json({ error: true, message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res
        .status(401)
        .json({ error: true, message: "email or password is wrong" });
    const match = user.checkPassword(req.body.password);
    if (!match)
      return res
        .status(401)
        .json({ error: true, message: "email or password is wrong" });
    const token = newToken(user);
    return res
      .status(200)
      .json({ error: false, message: "login successfully😋", token });
  } catch (err) {
    console.log("loginOfAuthController", err.message);
    res.status(500).json({ error: true, message: err.message });
  }
};

module.exports = { login, signup };

async function createDir(user) {
  try {
    const directory = await Directory.create({
      directory_name: "root",
      user: user._id,
      path: "/root",
      parent: null,
    });
    return directory.id;
  } catch (err) {
    console.log("createDirOfAuthController", err.message);
    return err.message;
  }
}
