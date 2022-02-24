const jwt = require("jsonwebtoken");
require("dotenv").config();
const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, dcryptData) => {
      if (err) return reject(err);
      resolve(dcryptData);
    });
  });
};
/// testing
module.exports = async (req, res, next) => {
  //is authentication key avail in header?
  if (!req?.headers?.authentication) {
    return res.status(401).send({
      error: true,
      message: "Please provide a valid token",
    });
  }
  // is token type bearer?
  let token = req.headers.authentication.split(" ");
  if (token[0] !== "bearer") {
    return res.status(401).send({
      error: true,
      message: "Please provide a valid token",
    });
  }
  //is token valid?
  let user;
  try {
    token =
      token[1][0] === `"` ? token[1].slice(1, token[1].length - 1) : token[1];
    user = await verifyToken(token);
  } catch (err) {
    return res.status(401).send({
      error: true,
      message: "Please provide a valid token",
    });
  }
  // attach  the user to the request
  req.user = user.user;
  // give permission to go to next middleware
  next();
};
