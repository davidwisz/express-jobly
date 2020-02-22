process.env.NODE_ENV = "test";
const app = require("../../app");
const db = require("../../db");
const Job = require("../../models/job");
const Company = require("../../models/company");
const request = require("supertest");


describe("Jobs Routes Test", function () {
  let c1, j1, j2, j3;

  beforeEach(async function () {
    await db.query("DELETE FROM companies");
    await db.query("DELETE FROM jobs");
    await db.query("DELETE FROM users");

    let adminUser = {
      username: 'john',
      password: '123456',
      first_name: 'John',
      last_name: 'Smith',
      email: 'email@email.com',
      is_admin: true,
    };
    let response = await request(app).post(`/auth/register`).send(adminUser);

    token = response.body.token;

    c1 = await Company.create({
      handle: 'RITH',
      name: 'Test Company Name',
      num_employees: 500,
      description: 'test description about company',
      logo_url: 'http://randomurl.com',
    });
    j1 = await Job.create({
      title: 'Test Job Title',
      salary: 50000,
      equity: 0.005,
      company_handle: 'RITH'
    });
    j2 = await Job.create({
      title: 'Test Job2 Title',
      salary: 100000,
      equity: 0.015,
      company_handle: 'RITH'
    });
    j3 = await Job.create({
      title: 'Test Job3 Title',
      salary: 500000,
      equity: 0.05,
      company_handle: 'RITH'
    });
  })

  describe("GET /jobs/", function () {
    test("can get all jobs", async function () {
      let response = await request(app)
        .get('/jobs').send({ token });
      expect(response.statusCode).toEqual(200);
      expect(response.body.jobs.length).toEqual(3);
      expect(response.body).toEqual({ "jobs": [{ "title": "Test Job Title", "handle": "RITH" }, { "title": "Test Job2 Title", "handle": "RITH" }, { "title": "Test Job3 Title", "handle": "RITH" }] });
    });
  });

  describe("GET /jobs/:id", function () {
    test("can get a job", async function () {
      let response = await request(app)
        .get(`/jobs/${j1.id}`).send({ token });
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({ job: { ...j1, date_posted: expect.any(String) } })
    });
  });

  describe("POST /jobs/", function () {
    test("can create a job", async function () {
      let job = {
        title: 'Another Test Job Title',
        salary: 666666,
        equity: 0.015,
        company_handle: 'RITH',
      };
      let response = await request(app)
        .post('/jobs').send({ ...job, token });
      expect(response.statusCode).toEqual(201);
      expect(response.body.job).toMatchObject({ title: job.title })

      const getJobResponse = await request(app).get('/jobs').send({ token });

      expect(getJobResponse.body.jobs.length).toEqual(4)

    });

    test("trying to create a job with invalid equity", async function () {
      let job = {
        title: 'Another Test Job Title',
        salary: 666666,
        equity: 2,
        company_handle: 'RITH',
      };
      let response = await request(app)
        .post('/jobs').send({ ...job, token });
      expect(response.statusCode).toEqual(400);
      expect(response.body.message[0]).toContain('equity');
    });
  });

  describe("PATCH /jobs/:id", function () {
    test("can update a job", async function () {
      let changes = {
        salary: 0,
        title: 'Dog Groomer'
      }
      let response = await request(app)
        .patch(`/jobs/${j1.id}`).send({ ...changes, token });

      expect(response.statusCode).toEqual(200);
      j1.salary = 0;
      j1.title = 'Dog Groomer';
      expect(response.body).toEqual({ job: {...j1, date_posted: expect.any(String)} })

      const getJobResponse = await request(app).get(`/jobs/${j1.id}`).send({ token });
      expect(getJobResponse.body).toEqual({ job: {...j1, date_posted: expect.any(String)} });
    });

    test("trying to update a job with invalid equity", async function () {
      let job = {
        title: 'Another Test Job Title',
        salary: 200.99,
        equity: 2
      }
      let response = await request(app)
        .patch(`/jobs/${j1.id}`).send({ ...job, token });
      expect(response.statusCode).toEqual(400);
      expect(response.body.message[0]).toContain('equity');
    });
  });

  describe("DELETE /jobs/:id", function () {
    test("can delete a job", async function () {
      let response = await request(app)
        .delete(`/jobs/${j1.id}`).send({ token });
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({ message: "Job deleted." });

      let jobResponse = await request(app).get('/jobs').send({ token });
      expect(jobResponse.body.jobs.length).toEqual(2);
    });
  });
});

afterAll(async function () {
  await db.end();
});