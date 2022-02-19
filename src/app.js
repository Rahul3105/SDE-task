const express = require("express");
const app = express();
const { signup, login } = require("./controllers/auth.controller");
const directoryController = require("./controllers/directory.controller");
const userController = require("./controllers/user.controller");
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use("/api/my-directory", directoryController);
app.use("/api/users", userController);
app.post("/api/signup", signup);
app.post("/api/login", login);

module.exports = app;
