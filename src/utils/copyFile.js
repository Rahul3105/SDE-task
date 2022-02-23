const File = require("../models/File.model");

const fs = require("fs");
const path = require("path");
module.exports = async (file) => {
  let { file_name, extension, user, file_url } = file;
  let newFilePath = Date.now() + "-" + file_name;
  fs.copyFileSync(file_url, newFilePath);
  let newFileURL = path.join(__dirname, `../../public/${newFilePath}`);
  fs.renameSync(path.join(__dirname, `../../${newFilePath}`), newFileURL);
  let newFile = await File.create({
    file_name,
    extension,
    user,
    file_url: newFileURL,
  });
  return newFile;
};
