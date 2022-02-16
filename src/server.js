const express = require("express");
const app = express();
const connectWithDB = require("./configs/connectWithDB");
const { signup, login } = require("./controllers/auth.controller");
const directoryController = require("./controllers/directory.controller");
app.use(express.json());
app.use("/my-directory", directoryController);
app.post("/signup", signup);
app.post("/login", login);
app.listen(1234, async () => {
  try {
    await connectWithDB();
    console.log("running on port 1234");
  } catch (err) {
    console.log(err.message);
  }
});
