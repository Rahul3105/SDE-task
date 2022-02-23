const request = require("supertest");
const app = require("../../src/app");
async function signupUser(body) {
  return await request(app).post("/api/signup").send(body);
}
module.exports = signupUser;
