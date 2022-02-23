const router = require("express").Router();
const Directory = require("../models/Directory.model");
const authentication = require("../middlewares/authentication");
const { findCat, fileType } = require("../utils/findCat");
const validateUser = require("../middlewares/validateUser");
const createDeepCopy = require("../utils/createDeepCopy");
const populateSubDirAndFile = require("../utils/populateSubDirAndFile");
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
  "/create/:id",
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

// for deleting a directory (only if it is empty)

router.delete(
  "/:id",
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

//// for renaming a folder
router.patch(
  "/rename/:id",
  authentication,
  validateUser(Directory),
  async (req, res) => {
    try {
      /// get the directory and update
      const directory = req.directory;
      await directory.updateOne(req.body);
      // getting its parent
      const parentDirectory = await Directory.findById(
        directory.parent
      ).populate(populateSubDirAndFile);
      return res.status(200).send({ error: false, directory: parentDirectory });
    } catch (err) {
      return res.status(500).send({ error: true, message: err.message });
    }
  }
);

// for moving one directory to another

router.patch(
  "/move/:id",
  authentication,
  validateUser(Directory),
  async (req, res) => {
    try {
      let { newParentID, prevParentID } = req.body;
      //  get the new parent directory
      let newParent = await Directory.findById(newParentID).populate(
        populateSubDirAndFile
      );
      // if we're pasting in same directory
      if (JSON.stringify(newParentID) === JSON.stringify(prevParentID)) {
        return res.status(200).send({ error: false, directory: newParent });
      }
      //  get the directory and change parent of directory with new parent
      let directory = req.directory;
      await directory.updateOne({
        parent: newParent.id,
        path: newParent.path + "/" + req.directory.directory_name,
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

/// organising a directory❤👌😎

router.patch(
  "/organize/:id",
  authentication,
  validateUser(Directory),
  async (req, res) => {
    try {
      /// get the directory
      let directory = req.directory;
      await directory.populate([
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

// for copy one directory to another (The deep copy using recursion)

router.patch(
  "/copy/:id",
  authentication,
  validateUser(Directory),
  async (req, res) => {
    try {
      let { newParentID } = req.body;
      //  get the new parent directory
      let newParent = await Directory.findById(newParentID).populate(
        populateSubDirAndFile
      );
      // create a deep copy of the directory 👌
      let deepCopy = await createDeepCopy(req.directory, newParent);

      //  push this deep copy directory id into new parent directory
      newParent.sub_directories.push(deepCopy.id);
      await newParent.populate(populateSubDirAndFile);
      //  return the new updated parent
      newParent.save();
      return res.status(200).send({ error: false, directory: newParent });
    } catch (err) {
      console.log(err.message);
      return res.status(500).send({ error: true, message: err.message });
    }
  }
);

module.exports = router;
