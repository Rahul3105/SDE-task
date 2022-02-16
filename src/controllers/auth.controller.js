const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const Directory = require("../models/Directory.model");
const newToken = (user) => {
  return jwt.sign({ user: user }, "rahul");
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
    if (!root_directory_id)
      return res.status(500).json({ error: true, message: "Try again😣" });
    const token = newToken(user);
    res.status(201).json({
      error: false,
      token,
      message: "Account created successfully😋",
      root_directory_id,
      user,
    });
  } catch (err) {
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
    res.status(500).json({ error: true, message: err.message });
  }
};

module.exports = { login, signup };

async function createDir(user) {
  console.log(user);
  try {
    const directory = await Directory.create({
      directory_name: "root",
      user: user._id,
      path: "/root",
    });
    return directory.id;
  } catch (err) {
    return err.message;
  }
}
