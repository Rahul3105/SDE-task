const request = require("supertest");
const app = require("../../src/app");
module.exports = async (
  idOfParent,
  token,
  directory_name = "new directory"
) => {
  return await request(app)
    .patch(`/api/my-directory/directory/create/${idOfParent}`)
    .set("authentication", `bearer ${token}`)
    .send({
      directory_name,
    });
};
