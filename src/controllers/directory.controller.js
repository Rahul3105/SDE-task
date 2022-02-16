const router = require("express").Router();
const { append } = require("express/lib/response");
const Directory = require("../models/Directory.model");
router.get("/:id", async (req, res) => {
  try {
    // check if that directory owner is the same that we have got in req body
    const directory = await Directory.findById(req.params.id);
    console.log(directory.user.toString() === req.body.user_id);
    if (directory.user.toString() !== req.body.user_id)
      return res.status(401).send("you can't view this directory sorry😓");
    // if yes just return the directory 😁
    res.status(200).send({ error: false, directory });
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    //create a repo
    const directory = await Directory();
    // return it
  } catch (err) {}
});

module.exports = router;
