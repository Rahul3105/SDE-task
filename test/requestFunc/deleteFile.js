const request = require("supertest");
const app = require("../../src/app");
module.exports = async (idOfParent, token, fileId) => {
  return await request(app)
    .delete(`/api/my-directory/file/${fileId}`)
    .send({
      parent: idOfParent,
    })
    .set("authentication", `bearer ${token}`);
};
