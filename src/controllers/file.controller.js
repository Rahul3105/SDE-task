const router = require("express").Router();
const Directory = require("../models/Directory.model");
const authentication = require("../middlewares/authentication");
const { uploadSingle } = require("../middlewares/fileUploads");
const File = require("../models/File.model");
const fs = require("fs");
const path = require("path");
const copyFile = require("../utils/copyFile");

const validateUser = require("../middlewares/validateUser");

const populateSubDirAndFile = require("../utils/populateSubDirAndFile");

/// for creating a new file inside a particular directory

router.patch(
  "/create/:id",
  authentication,
  validateUser(Directory),
  uploadSingle("file"),
  async (req, res) => {
    try {
      // get the parent
      const parentDirectory = req.directory;
      //creata a file document
      let payload = {
        file_name: req.file_name,
        extension: req.extension,
        file_url: req.file ? req.file.path : null,
        user: parentDirectory.user,
      };
      const file = await File.create(payload);
      // push  it's forign key in it's parent directory
      parentDirectory.files.push(file.id);
      await parentDirectory.populate(populateSubDirAndFile);
      parentDirectory.save();
      return res.status(201).send({ error: false, directory: parentDirectory });
    } catch (err) {
      console.log(err.message);
      return res.status(500).send({ error: true, message: err.message });
    }
  }
);

// for deleting a file
router.delete("/:id", authentication, validateUser(File), async (req, res) => {
  try {
    // get the file
    const file = await File.findByIdAndDelete(req.params.id);
    // unlink using fs module
    if (file.file_url) fs.unlinkSync(file.file_url);
    // remove from the parent directory also
    const parentDirectory = await Directory.findByIdAndUpdate(
      req.body.parent,
      { $pull: { files: req.params.id } },
      { new: true }
    ).populate(populateSubDirAndFile);
    return res.status(200).send({ error: false, directory: parentDirectory });
  } catch (err) {
    console.log(err.message);
    return res.status(500).send({ error: true, message: err.message });
  }
});

/// for renaming a file

router.patch(
  "/rename/:id",
  authentication,
  validateUser(File),
  async (req, res) => {
    try {
      let { parent, ...others } = req.body;
      /// get the file and update
      const file = await File.findByIdAndUpdate(req.params.id, others);
      // send it's parent
      const parentDirectory = await Directory.findById(parent).populate(
        populateSubDirAndFile
      );
      return res.status(200).send({ error: false, directory: parentDirectory });
    } catch (err) {
      console.log(err.message);

      return res.status(500).send({ error: true, message: err.message });
    }
  }
);

/// for moving one file to another

router.patch(
  "/move/:id",
  authentication,
  validateUser(File),
  async (req, res) => {
    try {
      let { newParentID, prevParentID } = req.body;
      //  get the new parent directory
      let newParent = await Directory.findById(newParentID);
      //  push this file id into new parent directory
      newParent.files.push(req.params.id);
      await newParent.populate(populateSubDirAndFile);
      // remove file from it's previous parent
      let prevParent = await Directory.findByIdAndUpdate(prevParentID, {
        $pull: { files: req.params.id },
      });
      //  return the new updated parent
      newParent.save();
      return res.status(200).send({ error: false, directory: newParent });
    } catch (err) {
      console.log(err.message);

      return res.status(500).send({ error: true, message: err.message });
    }
  }
);
// copy file from one folder to another

router.patch(
  "/copy/:id",
  authentication,
  validateUser(File),
  async (req, res) => {
    try {
      // get the file
      let file = req.file;
      // create it's copy
      let copyOfFile = await copyFile(file);
      // get the new parent
      let { newParentID } = req.body;
      // push copy into new parent
      let newParent = await Directory.findById(newParentID);
      newParent.files.push(copyOfFile);
      newParent.save();
      // return new parent
      return res.status(200).send({ error: false, directory: newParent });
    } catch (err) {
      console.log(err.message);
      return res.status(500).send({ error: true, message: err.message });
    }
  }
);

module.exports = router;
