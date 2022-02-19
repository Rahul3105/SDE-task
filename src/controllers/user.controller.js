const router = require("express").Router();
const Authentication = require("../middlewares/Authentication");
router.get("/", Authentication, async (req, res) => {
  try {
    let { password, ...others } = req.user;
    res.status(200).send({ error: false, user: others });
  } catch (err) {
    res.status(500).send({ error: true, message: err.message });
  }
});
module.exports = router;
