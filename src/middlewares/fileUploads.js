const multer = require("multer");
const path = require("path");

const fileFilter = (req, file, callback) => {
  callback(null, true);
};
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, path.join(__dirname, "../../public"));
  },
  filename: function (req, file, callback) {
    req.file_name = file.originalname;
    req.extension = path.extname(file.originalname);
    callback(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 100,
  },
  storage,
});

const uploadSingle = (feildName) => {
  return (req, res, next) => {
    const uploadItem = upload.single(feildName);
    uploadItem(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.log(err.message, "1");
        res
          .status(400)
          .send({ error: true, message: err.message, type: "Multer error" });
      } else if (err) {
        console.log(err.message, "2", feildName);
        res
          .status(400)
          .send({ error: true, message: err.message, type: "Normal error" });
      } else {
        next();
      }
    });
  };
};
const uploadMultiple = (feildName, limit) => {
  return (req, res, next) => {
    const uploadItems = upload.array(feildName, limit);
    uploadItems(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        res
          .status(400)
          .send({ error: true, message: err.message, type: "Multer error" });
      } else if (err) {
        res
          .status(400)
          .send({ error: true, message: err.message, type: "Normal error" });
      } else {
        next();
      }
    });
  };
};
module.exports = { uploadSingle, uploadMultiple };
