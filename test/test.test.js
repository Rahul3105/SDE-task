const request = require("supertest");
const connectWithDB = require("../src/configs/connectWithDB");
const disconnectWithDB = require("../src/configs/disconnectWithDB");
const app = require("../src/app");
describe("testing the while flow", () => {
  beforeAll(async () => {
    await connectWithDB();
  });

  afterAll(async () => {
    await disconnectWithDB();
  });
  describe("Creating a user", () => {
    test("should create the new user", async () => {
      let res = await request(app).post("/api/signup").send({
        first_name: "test",
        last_name: "user",
        email: "test@gmail.com",
        password: "12345",
      });
      expect(res.statusCode).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.message).toBe("Account created successfully😋");
    });
    test("should not create the user that already exists", async () => {
      let res = await request(app).post("/api/signup").send({
        first_name: "test",
        last_name: "user",
        email: "test@gmail.com",
        password: "12345",
      });
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("user already exist");
    });
  });
});
