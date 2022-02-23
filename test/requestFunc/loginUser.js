const request = require("supertest");
const app = require("../../src/app");
module.exports = async (body) => {
  return await request(app).post("/api/login").send(body);
};
