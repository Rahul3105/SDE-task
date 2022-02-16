const router = require("express").Router();
const { append } = require("express/lib/response");
const Directory = require("../models/Directory.model");
router.get("/:id", async (req, res) => {
  try {
    // check if that directory owner is the same that we have got in req body
    const directory = await Directory.findById(req.params.id);
    if (directory.user.toString() !== req.body.user_id)
      return res.status(401).send("you can't view this directory sorry😓");
    // if yes just return the directory 😁
    res.status(200).send({ error: false, directory });
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message });
  }
});

router.post("/directory", async (req, res) => {
  try {
    // get the directory
    const parentDirectory = await Directory.findById(req.body.parent);
    //create a repo
    const childDirectory = await Directory.create({
      ...req.body,
      directory_name: `${parentDirectory.directory_name}/${req.body.directory_name}`,
    });
    // push it into it's forign key in it's parent folder arr
    parentDirectory.sub_directories.push(childDirectory.id);
    parentDirectory.save();
    // return the updated parent
    return res.send(parentDirectory);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

module.exports = router;
