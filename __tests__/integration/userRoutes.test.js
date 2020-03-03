process.env.NODE_ENV = "test";
const app = require("../../app");
const db = require("../../db");
const User = require("../../models/user");
const request = require("supertest");

describe("User Routes Test", function () {
  let u1, u2, u3, adminUser, token;

  beforeEach(async function () {
    await db.query("DELETE FROM users");

    adminUser = {
      username: 'john',
      password: '123456',
      first_name: 'John',
      last_name: 'Smith',
      email: 'email@email.com',
      is_admin: true,
    };
    let response = await request(app).post(`/auth/register`).send(adminUser);

    token = response.body.token;
    
    u1 = await User.create({
      username: "A",
      password: "somepassword",
      first_name: "John",
      last_name: "Doe",
      email: "johndoe@gmail.com",
      photo_url: "http://someurl.com",
    });
    u2 = await User.create({
      username: "B",
      password: "somepassword",
      first_name: "John",
      last_name: "Doe",
      email: "anotheremail@gmail.com",
      photo_url: "http://someurl.com"
    });
    u3 = await User.create({
      username: "C",
      password: "somepassword",
      first_name: "John",
      last_name: "Doe",
      email: "testemail@gmail.com",
      photo_url: "http://someurl.com"
    });
  })

  describe("GET /users/", function () {
    test("can get all users", async function () {
      let response = await request(app)
        .get('/users').send({ token });
      expect(response.statusCode).toEqual(200);
      expect(response.body.users.length).toEqual(4);
      delete u1.photo_url;
      delete u2.photo_url;
      delete u3.photo_url;
      delete u1.is_admin;
      delete u2.is_admin;
      delete u3.is_admin;
      delete adminUser.is_admin;
      delete adminUser.password;
      expect(response.body).toEqual({ users: [u1, u2, u3, adminUser] });
    });
  });

  describe("GET /users/:username", function () {
    test("can get a user", async function () {
      let response = await request(app)
        .get(`/users/${u1.username}`).send({ token });
      expect(response.statusCode).toEqual(200);
      delete u1.password;
      delete u1.is_admin;
      expect(response.body).toEqual({ user: u1 })
    });
  });

  describe("POST /users/", function () {
    test("can create a user", async function () {
      let user = {
        username: "Z",
        password: "somepassword",
        first_name: "John",
        last_name: "Doe",
        email: "createuser@gmail.com",
        is_admin: false
      };
      let response = await request(app)
        .post('/users').send(user);
      expect(response.statusCode).toEqual(201);
      delete user.password;
      user.photo_url = null;
      expect(response.body).toEqual({ user });

      const getUserResponse = await request(app).get('/users').send({token});
      expect(getUserResponse.body.users.length).toEqual(5);

    });

    test("trying to create a user with invalid email", async function () {
      let user = {
        username: "Z",
        password: "somepassword",
        first_name: "John",
        last_name: "Doe",
        email: "asdfasdf"
      };
      let response = await request(app)
        .post('/users').send(user);
      expect(response.statusCode).toEqual(400);
      expect(response.body.message[0]).toContain('email');
    });
  });

  describe("PATCH /users/:username", function () {
    test("can update a user", async function () {
      let changes = {
        first_name: 'Jane'
      }
      let response = await request(app)
        .patch(`/users/${u1.username}`).send({ ...changes, token });

      expect(response.statusCode).toEqual(200);
      u1.first_name = 'Jane';
      expect(response.body).toEqual({ user: u1 });

      const getCompanyResponse = await request(app).get('/users/A');
      expect(getCompanyResponse.body).toEqual({ user: u1 })
    });

    test("trying to update a user with invalid email", async function () {
      let user = {
        email: 'asd'
      };
      let response = await request(app)
        .patch(`/users/{u1.username}`).send({ ...user, token });
      expect(response.statusCode).toEqual(400);
      expect(response.body.message[0]).toContain('email');
    });
  });

  describe("DELETE /users/:username", function () {
    test("can delete a user", async function () {
      let response = await request(app)
        .delete(`/users/${u1.username}`).send({token});
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({ message: "User deleted." });

      let userResponse = await request(app).get('/users');
      expect(userResponse.body.users.length).toEqual(2);
    });
  });
});

afterAll(async function () {
  await db.end();
});