process.env.NODE_ENV = "test";
const app = require("../../app");
const db = require("../../db");
const User = require("../../models/user");

const request = require("supertest");

describe("Auth Routes Test", function () {
  let u1;

  beforeEach(async function () {
    await db.query("DELETE FROM users");
    u1 = await User.create({
      username: "NotAdmin",
      password: "somepassword",
      first_name: "John",
      last_name: "Doe",
      email: "johndoe@gmail.com",
      photo_url: "http://someurl.com"
    });
  })

  describe("POST /auth/login", function () {
    test("can authenticate an existing user", async function () {
      let creds = {
        username: "NotAdmin",
        password: "somepassword",
      }
      let response = await request(app)
        .post('/auth/login').send(creds);
      expect(response.statusCode).toEqual(200);
      expect(response.body.token).not.toBeUndefined();
      expect(response.body.token.length).toBeGreaterThan(150);
    });

    test("won't authenticate bad credentials", async function () {
      let creds = {
        username: "NotAdmin",
        password: "somepassworddddd",
      }
      let response = await request(app)
        .post('/auth/login').send(creds);
      expect(response.statusCode).toEqual(400);
      expect(response.body.message).toContain("Invalid");
    });
  });

//   describe("GET /users/:username", function () {
//     test("can get a user", async function () {
//       let response = await request(app)
//         .get(`/users/${u1.username}`)
//       expect(response.statusCode).toEqual(200);
//       delete u1.password;
//       expect(response.body).toEqual({ user: u1 })
//     });
//   });

//   describe("POST /users/", function () {
//     test("can create a user", async function () {
//       let user = {
//         username: "Z",
//         password: "somepassword",
//         first_name: "John",
//         last_name: "Doe",
//         email: "createuser@gmail.com"
//       };
//       let response = await request(app)
//         .post('/users').send(user);
//       expect(response.statusCode).toEqual(201);
//       delete user.password;
//       user.photo_url = null;
//       expect(response.body).toEqual({ user });

//       const getUserResponse = await request(app).get('/users');
//       expect(getUserResponse.body.users.length).toEqual(4);

//     });

//     test("trying to create a user with invalid email", async function () {
//       let user = {
//         username: "Z",
//         password: "somepassword",
//         first_name: "John",
//         last_name: "Doe",
//         email: "asdfasdf"
//       };
//       let response = await request(app)
//         .post('/users').send(user);
//       expect(response.statusCode).toEqual(400);
//       expect(response.body.message[0]).toContain('email');
//     });
//   });

//   describe("PATCH /users/:username", function () {
//     test("can update a user", async function () {
//       let changes = {
//         first_name: 'Jane';
//       }
//       let response = await request(app)
//         .patch(`/users/${u1.username}`).send(changes);

//       expect(response.statusCode).toEqual(200);
//       u1.first_name = 'Jane';
//       expect(response.body).toEqual({ user: u1 });

//       const getCompanyResponse = await request(app).get('/users/A');
//       expect(getCompanyResponse.body).toEqual({ user: u1 })
//     });

//     test("trying to update a user with invalid email", async function () {
//       let user = {
//         email: 'asd';
//       };
//       let response = await request(app)
//         .patch(`/users/{u1.username}`).send(user);
//       expect(response.statusCode).toEqual(400);
//       expect(response.body.message[0]).toContain('email');
//     });
//   });

//   describe("DELETE /users/:username", function () {
//     test("can delete a user", async function () {
//       let response = await request(app)
//         .delete(`/users/${u1.username}`);
//       expect(response.statusCode).toEqual(200);
//       expect(response.body).toEqual({ message: "User deleted." });

//       let userResponse = await request(app).get('/users');
//       expect(userResponse.body.users.length).toEqual(2);
//     });
//   });
});

afterAll(async function () {
  await db.end();
});