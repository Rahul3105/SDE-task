const request = require("supertest");
const app = require("../../src/app");
module.exports = async (idOfDir, token) => {
  return await request(app)
    .get(`/api/my-directory/directory/${idOfDir}`)
    .set("authentication", `bearer ${token}`);
};
