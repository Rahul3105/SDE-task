const request = require("supertest");
const app = require("../../src/app");
module.exports = async (idOfParent, token, filePath) => {
  const buffer = Buffer.from("some data");

  return await request(app)
    .patch(`/api/my-directory/file/create/${idOfParent}`)
    .set("authentication", `bearer ${token}`)
    .attach("file", buffer, filePath);
};
