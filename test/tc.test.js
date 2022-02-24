const request = require("supertest");
const connectWithDB = require("../src/configs/connectWithDB");
const disconnectWithDB = require("../src/configs/disconnectWithDB");
const clearDB = require("../src/configs/clearDB");
const app = require("../src/app");
const signupUser = require("./requestFunc/signupUser");
const loginUser = require("./requestFunc/loginUser");
const getUser = require("./requestFunc/getUser");
const getDirectory = require("./requestFunc/getDirectory");
const createDirectory = require("./requestFunc/createDirectory");
const createFile = require("./requestFunc/createFile");
const deleteFile = require("./requestFunc/deleteFile");
const copyFile = require("./requestFunc/copyFile");
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
      let res = await signupUser({
        first_name: "test",
        last_name: "user",
        email: "test@gmail.com",
        password: "12345",
      });
      expect(res.statusCode).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.message).toBe("Account created successfully😋");
      // i can create user on every test case but that won't make much sense because if user creation tc is not passing that other tc can never pass
      token = res.body.token;
    });

    test("should not create the user that already exists", async () => {
      let res = await signupUser({
        first_name: "test",
        last_name: "user",
        email: "test@gmail.com",
        password: "12345",
      });
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("user already exist");
    });
  });
  describe("POST /login", () => {
    test("should give the token back", async () => {
      let res = await loginUser({
        email: "test@gmail.com",
        password: "12345",
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    test("should not give the token back because passing wrong crediantials", async () => {
      let res = await loginUser({
        email: "test2@gmail.com",
        password: "12345",
      });
      expect(res.statusCode).toBe(401);
      expect(res.body.token).not.toBeDefined();
    });
  });
  // getting a user
  describe("GET /users", () => {
    test("should give the user as response because passing token", async () => {
      let res = await getUser(token);
      expect(res.statusCode).toBe(200);
      expect(res.body.user.root_directory).toBeDefined();
      idOfRoot = res.body.user.root_directory;
    });
    test("should not give the user as response because not passing token", async () => {
      let res = await request(app).get(`/api/users`);
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Please provide a valid token");
    });
    test("should not give the user as response because passing wrong token", async () => {
      let res = await getUser(token + "making tc wrong");
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Please provide a valid token");
    });
  });

  describe("GET /my-directory/directory/:id", () => {
    test("should give the directory as response", async () => {
      let res = await getDirectory(idOfRoot, token);
      expect(res.statusCode).toBe(200);
      expect(res.body.directory.user).toBeDefined();
    });
    test("should not give the directory as response because not passing token", async () => {
      let res = await request(app).get(
        `/api/my-directory/directory/${idOfRoot}`
      );
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Please provide a valid token");
    });
    test("should not give the directory as response because not passing correct directory id in params", async () => {
      let res = await getDirectory(idOfRoot + "making id wrong", token);
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Directory or file not found");
    });
  });

  // creating a new directory
  describe("PATCH /my-directory/directory/:id", () => {
    test("should create a directory ", async () => {
      let res = await createDirectory(idOfRoot, token);
      expect(res.statusCode).toBe(201);
      expect(res.body.directory.directory_name).toBe("root");
      expect(res.body.directory.sub_directories[0].directory_name).toBe(
        "new directory"
      );
      idOfNewDir = res.body.directory.sub_directories[0]._id;
    });
    test("should not create a directory because not passing token", async () => {
      let res = await request(app)
        .patch(`/api/my-directory/directory/create/${idOfRoot}`)
        .send({
          directory_name: "new directory",
        });
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Please provide a valid token");
    });
    test("should not create a directory because not passing new directory name in body", async () => {
      let res = await request(app)
        .patch(`/api/my-directory/directory/create/${idOfRoot}`)
        .send({})
        .set("authentication", `bearer ${token}`);
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe(
        "directory validation failed: directory_name: Path `directory_name` is required."
      );
    });
  });

  // deleting a directory

  describe("DELETE /my-directory/directory/:id", () => {
    test("Should delete a directory", async () => {
      let res1 = await createDirectory(
        idOfRoot,
        token,
        "Creating this directory just for testing delete request😁"
      );
      let res = await request(app)
        .delete(
          `/api/my-directory/directory/${res1.body.directory.sub_directories[1]._id}`
        )
        .set("authentication", `bearer ${token}`);
      expect(res.statusCode).toBe(200);
    });

    test("Should not delete root directory", async () => {
      let res = await request(app)
        .delete(`/api/my-directory/directory/${idOfRoot}`)
        .set("authentication", `bearer ${token}`);
      expect(res.statusCode).toBe(405);
      expect(res.body.message).toBe("Can't delete root directory");
    });
    test("Should not delete directory because it isn't empty", async () => {
      // now procedure to setup this tc is bit long
      // creating parent directory and pushing something into it than trying to delete it
      let parent = await createDirectory(idOfRoot, token, "he is parent");
      let parentId = parent.body.directory.sub_directories[1]._id;
      let child = await createDirectory(parentId, token, "he is child");
      let res = await request(app)
        .delete(`/api/my-directory/directory/${parentId}`)
        .set("authentication", `bearer ${token}`);
      expect(res.statusCode).toBe(405);
      expect(res.body.message).toBe("Directory is not empty");
    });
  });

  // renaming a directory
  describe("PATCH  /my-directory/directory/rename/:id", () => {
    test("should rename the directory", async () => {
      let res = await request(app)
        .patch(`/api/my-directory/directory/rename/${idOfNewDir}`)
        .set("authentication", `bearer ${token}`)
        .send({
          directory_name: "new name",
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.directory.sub_directories[0].directory_name).toBe(
        "new name"
      );
    });

    test("should not rename the directory because not passing the token", async () => {
      let res = await request(app)
        .patch(`/api/my-directory/directory/rename/${idOfNewDir}`)

        .send({
          directory_name: "new name",
        });
      expect(res.statusCode).toBe(401);
    });
  });

  // moving one directory to another
  describe("PATCH /my-directory/directory/move/:id", () => {
    test("Should move the directory", async () => {
      // create a directory in root folder
      let testDir = await createDirectory(
        idOfRoot,
        token,
        "directory for moving"
      );
      let testDirId = top(testDir.body.directory.sub_directories)._id;
      // move it to another folder
      let res = await request(app)
        .patch(`/api/my-directory/directory/move/${testDirId}`)
        .set("authentication", `bearer ${token}`)
        .send({
          newParentID: idOfNewDir,
          prevParentID: idOfRoot,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.directory.sub_directories[0].directory_name).toBe(
        "directory for moving"
      );
    });
  });

  //  *********************************************************************************************
  //  creating a new file
  describe("PATCH /my-directory/file/create/:id", () => {
    test("should create a new file", async () => {
      let res = await createFile(idOfRoot, token, "text.txt");
      expect(res.statusCode).toBe(201);
    });
  });

  // deleting a file
  describe("DELETE /my-directory/file/:id", () => {
    test("Should delete a file", async () => {
      let res = await createFile(idOfRoot, token, "text.txt");
      let fileId = top(res.body.directory.files)._id;
      let res1 = await deleteFile(idOfRoot, token, fileId);
      expect(res1.statusCode).toBe(200);
    });
  });

  // renaming the file
  describe("PATCH /my-directory/file/rename/:id", () => {
    test("Should rename a file", async () => {
      let res = await createFile(idOfRoot, token, "text.txt");
      let fileId = top(res.body.directory.files)._id;
      let res1 = await request(app)
        .patch(`/api/my-directory/file/rename/${fileId}`)
        .send({
          parent: idOfRoot,
          file_name: "new name",
        })
        .set("authentication", `bearer ${token}`);
      expect(res1.statusCode).toBe(200);
      expect(top(res1.body.directory.files).file_name).toBe("new name");
    });
  });

  // moving one file to another directory
  describe("PATCH /my-directory/file/move/:id", () => {
    test("Should move the file", async () => {
      // create a folder
      let parent = await createDirectory(idOfRoot, token, "testing file move");
      let parentId = top(parent.body.directory.sub_directories)._id;
      // create a file inside that folder
      let file = await createFile(parentId, token, "text.txt");
      let fileId = top(file.body.directory.files)._id;
      // move that file to root folder
      let res = await request(app)
        .patch(`/api/my-directory/file/move/${fileId}`)
        .send({
          prevParentID: parentId,
          newParentID: idOfRoot,
        })
        .set("authentication", `bearer ${token}`);
      expect(res.statusCode).toBe(200);
    });
  });

  /// copy file
  describe("PATCH /my-directory/file/copy/:id", () => {
    test("Should copy the file", async () => {
      // create a file
      let res = await createFile(idOfRoot, token, "text.txt");
      let fileId = top(res.body.directory.files)._id;
      /// create a folder
      res = await createDirectory(idOfRoot, token, "test dir");
      let newParentId = top(res.body.directory.sub_directories)._id;
      // copy that file into that folder
      res = await copyFile(fileId, token, newParentId);
      expect(res.statusCode).toBe(200);
    });
  });
});

function top(arr) {
  return arr[arr.length - 1];
}
