const request = require("supertest");
const connectWithDB = require("../src/configs/connectWithDB");
const disconnectWithDB = require("../src/configs/disconnectWithDB");
const clearDB = require("../src/configs/clearDB");
const app = require("../src/app");
let idOfRoot, token, idOfNewDir;
describe("testing the whole flow", () => {
  beforeAll(async () => {
    await connectWithDB();
    await clearDB();
    jest.setTimeout(90 * 1000);
  });
  afterAll(async () => {
    await disconnectWithDB();
  });

  describe("POST /signup", () => {
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
      token = res.body.token;
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
  // describe("POST /login", () => {
  //   test("should give the token back", async () => {
  //     let res = await request(app).post("/api/login").send({
  //       email: "test@gmail.com",
  //       password: "12345",
  //     });
  //   });
  // });
  describe("GET /users", () => {
    test("should give the user as response because passing token", async () => {
      let res = await request(app)
        .get(`/api/users`)
        .set("authentication", `bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.user.root_directory).toBeDefined();
      idOfRoot = res.body.user.root_directory;
    });
    test("should not give the user as response because not passing token", async () => {
      let res = await request(app).get(`/api/users`);
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Please provide a valid token");
    });
  });

  describe("GET /my-directory", () => {
    test("should give the directory as response", async () => {
      let res = await request(app)
        .get(`/api/my-directory/${idOfRoot}`)
        .set("authentication", `bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.directory.user).toBeDefined();
    });
    test("should not give the directory as response because not passing token", async () => {
      let res = await request(app).get(`/api/my-directory/${idOfRoot}`);
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Please provide a valid token");
    });
  });
  //creating a new directory
  describe("PATCH /my-directory/directory/:id", () => {
    test("should create a directory ", async () => {
      let res = await request(app)
        .patch(`/api/my-directory/directory/create/${idOfRoot}`)
        .set("authentication", `bearer ${token}`)
        .send({
          directory_name: "new directory",
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.directory.directory_name).toBe("root");
      expect(res.body.directory.sub_directories[0].directory_name).toBe(
        "new directory"
      );
      idOfNewDir = res.body.directory.sub_directories[0]._id;
    });
    test("should not create a directory because token is invalid", async () => {
      let res = await request(app)
        .patch(`/api/my-directory/directory/create/${idOfRoot}`)
        .send({
          directory_name: "new directory",
        });
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Please provide a valid token");
    });
  });
  // creating a new file
  // describe("PATCH /my-directory/file/:id", () => {
  //   test("should create a new file", async () => {
  //     let res = await request(app)
  //       .patch(`/api/my-directory/file/create/${idOfRoot}`)
  //       .set("authentication", `bearer ${token}`)
  //       .attach("file", "/text.txt");
  //     expect(res.statusCode).toBe(201);
  //   });
  // });
  describe("PATCH  /my-directory/directory/rename/:id", () => {
    test("should rename the directory", async () => {
      let res = await request(app)
        .patch(`/api/my-directory/directory/rename/${idOfNewDir}`)
        .set("authentication", `bearer ${token}`)
        .send({
          directory_name: "new name",
        });
      expect(res.statusCode).toBe(200);
    });
  });
  describe("DELETE /my-directory/directory/:id", () => {
    test("should delete a directory", async () => {
      let res = await request(app)
        .delete(`/api/my-directory/directory/${idOfNewDir}`)
        .set("authentication", `bearer ${token}`);
      expect(res.statusCode).toBe(200);
    });
    test("should not delete a root directory", async () => {
      let res = await request(app)
        .delete(`/api/my-directory/directory/${idOfRoot}`)
        .set("authentication", `bearer ${token}`);
      expect(res.statusCode).toBe(405);
      expect(res.body.message).toBe("Can't delete root directory");
    });
  });
});
