const router = require("express").Router();
const { append } = require("express/lib/response");
const Directory = require("../models/Directory.model");
const Authentication = require("../middlewares/Authentication");
router.get("/:id", Authentication, async (req, res) => {
  try {
    const directory = await Directory.findById(req.params.id).populate({
      path: "sub_directories",
      select: { directory_name: 1 },
    });
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
      path: `${parentDirectory.path}/${req.body.directory_name}`,
    });
    // push it into it's forign key in it's parent folder arr
    parentDirectory.sub_directories.push(childDirectory.id);
    await parentDirectory.populate({
      path: "sub_directories",
      select: { directory_name: 1 },
    });

    parentDirectory.save();
    // return the updated parent
    return res.send(parentDirectory);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

module.exports = router;
