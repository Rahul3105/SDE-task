const connectWithDB = require("./configs/connectWithDB");
const app = require("./app");
app.listen(1234, async () => {
  try {
    await connectWithDB();
    console.log("running on port 1234");
  } catch (err) {
    console.log(err.message);
  }
});
