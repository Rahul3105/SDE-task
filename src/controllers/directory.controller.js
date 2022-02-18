const router = require("express").Router();
const { append } = require("express/lib/response");
const Directory = require("../models/Directory.model");
const Authentication = require("../middlewares/Authentication");
const { uploadSingle } = require("../middlewares/fileUploads");
const File = require("../models/File.model");

/// for getting a directory
router.get("/:id", Authentication, async (req, res) => {
  try {
    const directory = await Directory.findById(req.params.id).populate([
      {
        path: "sub_directories",
        select: { directory_name: 1 },
      },
      {
        path: "files",
      },
    ]);
    res.status(200).send({ error: false, directory });
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message });
  }
});
// for creating a new directory inside a particular directory

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
    await parentDirectory.populate([
      {
        path: "sub_directories",
        select: { directory_name: 1 },
      },
      {
        path: "files",
      },
    ]);
    parentDirectory.save();
    // return the updated parent
    return res.send(parentDirectory);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

/// for creating a new file inside a particular directory

router.post("/file", uploadSingle("file"), async (req, res) => {
  try {
    // get the parent
    const parentDirectory = await Directory.findById(req.body.parent);
    //creata a file document
    let payload = {
      file_name: req.file_name,
      extension: req.extension,
      file_url: req.file?.path,
    };

    const file = await File.create(payload);
    // push it into it's forign key in it's parent folder arr
    parentDirectory.files.push(file.id);

    await parentDirectory.populate([
      {
        path: "sub_directories",
        select: { directory_name: 1 },
      },
      {
        path: "files",
      },
    ]);

    parentDirectory.save();
    return res.send(parentDirectory);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// for deleting a directory (only if it is empty)
router.delete("/directory/:id", async (req, res) => {
  try {
    // get the directory
    const directory = await Directory.findById(req.params.id);
    // check if it is empty or not
    if (directory.files.length > 0 || directory.sub_directories.length > 0) {
      // if not than just send the response saying can't delete directory
      return res
        .status(500)
        .send({ error: true, message: "Directory is not empty" });
    }
    // delete the directory and send it's parent directory as response
    const parentDirectory = await Directory.findByIdAndUpdate(
      directory.parent,
      { $pull: { sub_directories: req.params.id } },
      { new: true }
    );
    // deleting from the data base also
    await Directory.findByIdAndDelete(req.params.id);
    return res.status(201).send(parentDirectory);
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
});

// for deleting a file
router.delete("/file/:id", async (req, res) => {
  try {
    // get the directory
    const directory = await Directory.findById(req.params.id);
    // check if it is empty or not
    if (directory.files.length > 0 || directory.sub_directories.length > 0) {
      // if not than just send the response saying can't delete directory
      return res
        .status(500)
        .send({ error: true, message: "Directory is not empty" });
    }
    // delete the directory and send it's parent directory as response
    const parentDirectory = await Directory.findByIdAndUpdate(
      directory.parent,
      { $pull: { sub_directories: req.params.id } },
      { new: true }
    );
    // deleting from the data base also
    await Directory.findByIdAndDelete(req.params.id);
    return res.status(201).send(parentDirectory);
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
});

module.exports = router;
