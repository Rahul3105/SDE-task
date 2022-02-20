const connectWithDB = require("./configs/connectWithDB");
const app = require("./app");
app.listen(3000, async () => {
  try {
    await connectWithDB();
    console.log("running on port 1234");
  } catch (err) {
    console.log(err.message);
  }
});
