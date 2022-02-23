const Directory = require("../models/Directory.model");
const copyFile = require("./copyFile");
const populateSubDirAndFile = require("../utils/populateSubDirAndFile");

async function createDeepCopy(directory, parent) {
  if (!directory) return null;
  await directory.populate([
    {
      path: "sub_directories",
    },
    {
      path: "files",
    },
  ]);
  await parent.populate([
    {
      path: "sub_directories",
    },
    {
      path: "files",
    },
  ]);

  let { directory_name, user } = directory;
  let newDirectory = await Directory.create({
    directory_name,
    parent: parent._id,
    user,
  });
  newDirectory.path = parent.path + "/" + newDirectory.directory_name;
  // pushing every file in it's file array;
  for (let file of directory.files) {
    let newFile = await copyFile(file);
    newDirectory.files.push(newFile._id);
  }
  // pushing every directory in its directory array
  for (let dir of directory.sub_directories) {
    let children = await createDeepCopy(dir, newDirectory);
    if (children) {
      newDirectory.sub_directories.push(children._id);
    }
  }
  newDirectory.save();
  await newDirectory.populate(populateSubDirAndFile);
  return newDirectory;
}
module.exports = createDeepCopy;
