const connectWithDB = require("./configs/connectWithDB");
const app = require("./app");
const port = process.env.PORT || 3000;
app.listen(port, async () => {
  try {
    await connectWithDB();
    console.log(`running on port ${port}`);
  } catch (err) {
    console.log(err.message);
  }
});
