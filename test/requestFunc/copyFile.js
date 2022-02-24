const request = require("supertest");
const app = require("../../src/app");
module.exports = async (id, token, newParentID) => {
  return await request(app)
    .patch(`/api/my-directory/file/copy/${id}`)
    .set("authentication", `bearer ${token}`)
    .send({
      newParentID,
    });
};
