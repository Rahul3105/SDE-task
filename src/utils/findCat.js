const path = require("path");
const fileType = {
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
function findCat(fileName) {
  let ext = path.extname(fileName).slice(1);
  for (let type in fileType) {
    if (fileType[type].includes(ext)) {
      return type;
    }
  }
  return "others";
}

module.exports = { findCat, fileType };
