const router = require("express").Router();
const Authentication = require("../middlewares/Authentication");
router.get("/", Authentication, async (req, res) => {
  try {
    res.status(200).send(req.user);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
module.exports = router;
