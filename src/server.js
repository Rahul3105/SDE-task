const express = require("express");
const app = express();
const connectWithDB = require("./configs/connectWithDB");
const { signup, login } = require("./controllers/auth.controller");
const directoryController = require("./controllers/directory.controller");
const userController = require("./controllers/user.controller");
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use("/my-directory", directoryController);
app.use("/user", userController);
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
