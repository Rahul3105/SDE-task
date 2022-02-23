const request = require("supertest");
const app = require("../../src/app");
module.exports = async (token) => {
  return await request(app)
    .get(`/api/users`)
    .set("authentication", `bearer ${token}`);
};
