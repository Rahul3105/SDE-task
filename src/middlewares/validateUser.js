const ObjectId = require("mongoose").Types.ObjectId;
function isValidObjectId(id) {
  if (ObjectId.isValid(id)) {
    if (String(new ObjectId(id)) === id) return true;
    return false;
  }
  return false;
}

module.exports = (Model) => {
  return async (req, res, next) => {
    // get the model (directory or file)
    const model = await Model.findById(
      isValidObjectId(req.params.id) ? req.params.id : null
    );
    // checking if that directory or file exists or not
    if (!model)
      return res
        .status(404)
        .send({ error: true, message: "Directory or file not found" });
    // check if owner of that (directory or file) is viewing or editing this (directory or file) or not?
    if (`"${req.user._id}"` !== JSON.stringify(model.user)) {
      return res.status(403).send({
        error: true,
        message:
          "You are not authorized to view or edit this directory or file",
      });
    }
    if (model.file_name) req.file = model;
    else req.directory = model;
    next();
  };
};
