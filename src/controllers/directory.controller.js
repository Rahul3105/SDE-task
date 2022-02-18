const router = require("express").Router();
const { append } = require("express/lib/response");
const Directory = require("../models/Directory.model");
const Authentication = require("../middlewares/Authentication");
const { uploadSingle } = require("../middlewares/fileUploads");
const File = require("../models/File.model");
const fs = require("fs");
const path = require("path");
let fileType = {
  media: ["mp4", "mkv"],
  archives: ["zip", "7z", "rar", "tar", "gz", "ar", "iso", "xz"],
  documents: [
    "docx",
    "doc",
    "pdf",
    "xlsx",
    "xls",
    "odt",
    "ods",
    "odp",
    "odg",
    "odf",
    "txt",
    "ps",
    "tex",
    "js",
    "json",
  ],
  images: ["png", "jpg", "gif", "PNG"],
  app: ["exe", "dmg", "pkg", "deb"],
};
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
    ).populate([
      {
        path: "sub_directories",
        select: { directory_name: 1 },
      },
      {
        path: "files",
      },
    ]);
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
    // get the file and delete
    const file = await File.findByIdAndDelete(req.params.id);
    // unlink using fs module
    if (file.file_url) fs.unlinkSync(file.file_url);
    // remove from the parent directory also
    const parentDirectory = await Directory.findByIdAndUpdate(
      req.body.parent,
      { $pull: { files: req.params.id } },
      { new: true }
    ).populate([
      {
        path: "sub_directories",
        select: { directory_name: 1 },
      },
      {
        path: "files",
      },
    ]);
    return res.status(201).send(parentDirectory);
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
});

//// for renaming a folder

router.patch("/directory/:id", async (req, res) => {
  try {
    /// get the directory and update
    const directory = await Directory.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    // send it's parent
    const parentDirectory = await Directory.findById(directory.parent).populate(
      [
        {
          path: "sub_directories",
          select: { directory_name: 1 },
        },
        {
          path: "files",
        },
      ]
    );
    return res.status(200).send(parentDirectory);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

/// for renaming a file

router.patch("/file/:id", async (req, res) => {
  try {
    /// get the file and update
    let { parent, ...others } = req.body;
    const file = await File.findByIdAndUpdate(req.params.id, others);
    // send it's parent

    const parentDirectory = await Directory.findById(parent).populate([
      {
        path: "sub_directories",
        select: { directory_name: 1 },
      },
      {
        path: "files",
      },
    ]);
    return res.status(200).send(parentDirectory);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// for moving one directory to another

router.patch("/directory/move/:id", async (req, res) => {
  try {
    let { newParentID, prevParentID } = req.body;
    //  get the new parent directory
    let newParent = await Directory.findById(newParentID);
    //  get the directory and change parent of directory with new parent
    let directory = await Directory.findByIdAndUpdate(req.params.id, {
      parent: newParent.id,
    });
    //  push this directory id into new parent directory
    newParent.sub_directories.push(req.params.id);
    await newParent.populate([
      {
        path: "sub_directories",
        select: { directory_name: 1 },
      },
      {
        path: "files",
      },
    ]);
    // remove directory from it's previous parent
    let prevParent = await Directory.findByIdAndUpdate(
      prevParentID,
      {
        $pull: { sub_directories: req.params.id },
      },
      { new: true }
    );
    //  return the new updated parent
    newParent.save();
    return res.status(200).send(newParent);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

/// for moving one file to another

router.patch("/file/move/:id", async (req, res) => {
  try {
    let { newParentID, prevParentID } = req.body;
    //  get the new parent directory
    let newParent = await Directory.findById(newParentID);
    //  push this file id into new parent directory
    newParent.files.push(req.params.id);
    await newParent.populate([
      {
        path: "sub_directories",
        select: { directory_name: 1 },
      },
      {
        path: "files",
      },
    ]);
    // remove file from it's previous parent
    let prevParent = await Directory.findByIdAndUpdate(prevParentID, {
      $pull: { files: req.params.id },
    });
    //  return the new updated parent
    newParent.save();
    return res.status(200).send(newParent);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

/// organising a directory❤👌😎

router.patch("/directory/organize/:id", async (req, res) => {
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
      // console.log(doc);
      doc.save();
    } else {
      let newDir = await Directory.create({
        directory_name: dirName,
        path: `${directory.path}/${dirName}`,
        files: [file.id],
        parent: directory,
        user: directory.user,
      });
      directory.sub_directories.push(newDir.id);
      map.set(dirName, newDir);
    }
  }
  // remove all files from the parent
  directory.files = [];
  directory.save();
  // return the updated parent
  return res.send(directory);
});

function findCat(fileName) {
  let ext = path.extname(fileName).slice(1);
  for (let type in fileType) {
    if (fileType[type].includes(ext)) {
      return type;
    }
  }
  return "others";
}

module.exports = router;
