const router = require("express").Router();
const Directory = require("../models/Directory.model");
const authentication = require("../middlewares/authentication");
const { uploadSingle } = require("../middlewares/fileUploads");
const File = require("../models/File.model");
const fs = require("fs");
const { findCat, fileType } = require("../utils/findCat");
const validateUser = require("../middlewares/validateUser");
const populateSubDirAndFile = [
  {
    path: "sub_directories",
    select: { directory_name: 1 },
  },
  {
    path: "files",
  },
];
/// for getting a directory
router.get(
  "/:id",
  authentication,
  validateUser(Directory),
  async (req, res) => {
    try {
      let directory = req.directory;
      await directory.populate(populateSubDirAndFile);
      directory.save();
      res.status(200).send({ error: false, directory });
    } catch (err) {
      return res.status(500).send({ error: true, message: err.message });
    }
  }
);

// for creating a new directory inside a particular directory

router.patch(
  "/directory/create/:id",
  authentication,
  validateUser(Directory),
  async (req, res) => {
    try {
      // get the parent directory
      const parentDirectory = req.directory;
      //create a repo
      const childDirectory = await Directory.create({
        ...req.body,
        user: parentDirectory.user,
        parent: parentDirectory.id,
        path: `${parentDirectory.path}/${req.body.directory_name}`,
      });
      // push it into it's forign key in it's parent folder arr
      parentDirectory.sub_directories.push(childDirectory.id);
      await parentDirectory.populate(populateSubDirAndFile);
      parentDirectory.save();
      // return the updated parent
      return res.status(201).send({ error: false, directory: parentDirectory });
    } catch (err) {
      return res.status(500).send({ error: true, message: err.message });
    }
  }
);

/// for creating a new file inside a particular directory

router.patch(
  "/file/create/:id",
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
      return res.status(500).send({ error: true, message: err.message });
    }
  }
);

// for deleting a directory (only if it is empty)

router.delete(
  "/directory/:id",
  authentication,
  validateUser(Directory),
  async (req, res) => {
    try {
      // get the directory
      const directory = req.directory;
      // check if it is root directory or not
      if (directory.path === "/root") {
        return res
          .status(405)
          .send({ error: true, message: "Can't delete root directory" });
      }
      // check if it is empty or not
      if (directory.files.length > 0 || directory.sub_directories.length > 0) {
        // if not than just send the response saying can't delete directory
        return res
          .status(405)
          .send({ error: true, message: "Directory is not empty" });
      }
      // delete the directory and send it's parent directory as response
      const parentDirectory = await Directory.findByIdAndUpdate(
        directory.parent,
        { $pull: { sub_directories: req.params.id } },
        { new: true }
      ).populate(populateSubDirAndFile);
      // deleting from the data base also
      await Directory.findByIdAndDelete(req.params.id);
      return res.status(200).send({ error: false, directory: parentDirectory });
    } catch (err) {
      return res.status(500).send({ error: true, message: err.message });
    }
  }
);

// for deleting a file
router.delete(
  "/file/:id",
  authentication,
  validateUser(File),
  async (req, res) => {
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
      return res.status(500).send({ error: true, message: err.message });
    }
  }
);

//// for renaming a folder
router.patch(
  "/directory/rename/:id",
  authentication,
  validateUser(Directory),
  async (req, res) => {
    try {
      /// get the directory and update
      const directory = await Directory.findByIdAndUpdate(
        req.params.id,
        req.body
      );
      // send it's parent
      const parentDirectory = await Directory.findById(
        directory.parent
      ).populate(populateSubDirAndFile);
      return res.status(200).send({ error: false, directory: parentDirectory });
    } catch (err) {
      return res.status(500).send({ error: true, message: err.message });
    }
  }
);

/// for renaming a file

router.patch(
  "/file/rename/:id",
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
      return res.status(500).send({ error: true, message: err.message });
    }
  }
);

// for moving one directory to another

router.patch(
  "/directory/move/:id",
  authentication,
  validateUser(Directory),
  async (req, res) => {
    try {
      let { newParentID, prevParentID } = req.body;
      //  get the new parent directory
      let newParent = await Directory.findById(newParentID);
      // if we're pasting in same directory
      if (JSON.stringify(newParentID) === JSON.stringify(prevParentID)) {
        return res.send(200).send({ error: false, directory: newParent });
      }
      //  get the directory and change parent of directory with new parent
      let directory = await Directory.findByIdAndUpdate(req.params.id, {
        parent: newParent.id,
        path: newParent.path + req.directory.directory_name,
      });

      //  push this directory id into new parent directory
      newParent.sub_directories.push(req.params.id);
      await newParent.populate(populateSubDirAndFile);
      // remove directory from it's previous parent
      let prevParent = await Directory.findByIdAndUpdate(prevParentID, {
        $pull: { sub_directories: req.params.id },
      });
      //  return the new updated parent
      newParent.save();
      return res.status(200).send({ error: false, directory: newParent });
    } catch (err) {
      return res.status(500).send({ error: true, message: err.message });
    }
  }
);

/// for moving one file to another

router.patch(
  "/file/move/:id",
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
      return res.status(201).send({ error: false, directory: newParent });
    } catch (err) {
      return res.status(500).send({ error: true, message: err.message });
    }
  }
);

/// organising a directory❤👌😎

router.patch(
  "/directory/organize/:id",
  authentication,
  validateUser(Directory),
  async (req, res) => {
    try {
      /// get the directory
      let directory = await Directory.findById(req.params.id).populate([
        {
          path: "sub_directories",
          select: { directory_name: 1, files: 1 },
        },
        {
          path: "files",
        },
      ]);

      let map = new Map();
      // if there already exist file type folder than store it before creating
      for (let dir of directory.sub_directories) {
        if (fileType[dir.directory_name]) {
          map.set(dir.directory_name, dir);
        }
      }

      // create folders for every extension name and push every file id that match the extension into it

      for (let file of directory.files) {
        let dirName = findCat(file.file_name);

        if (map.has(dirName)) {
          let doc = map.get(dirName);
          doc.files.push(file.id);
          await doc.updateOne({ $push: { files: file.id } });
        } else {
          let newDir = await Directory.create({
            directory_name: dirName,
            path: `${directory.path}/${dirName}`,
            files: [file.id],
            parent: directory._id,
            user: directory.user,
          });
          directory.sub_directories.push(newDir._id);
          map.set(dirName, newDir);
        }
      }
      // remove all files from the parent
      directory.files = [];
      await directory.populate(populateSubDirAndFile);
      directory.save();
      // return the updated parent
      return res.status(201).send({ error: false, directory });
    } catch (err) {
      console.log(err.message);
      res.status(500).send({ error: true, message: err.message });
    }
  }
);
module.exports = router;
