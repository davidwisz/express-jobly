process.env.NODE_ENV = "test";
const app = require("../../app");
const db = require("../../db");
const Company = require("../../models/company");
const Job = require("../../models/job");
const User = require("../../models/user");
const request = require("supertest");


describe("Company Routes Test", function () {
  let token, c1, c2, c3, j1, j2, j3;

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
      logo_url: 'http://www.randomurl.com',
    });
    c2 = await Company.create({
      handle: 'TestComp2',
      name: 'Test Company Name2',
      num_employees: 300,
      description: 'test description about company',
      logo_url: 'http://www.randomurl.com'
    });
    c3 = await Company.create({
      handle: 'TestComp3',
      name: 'Test Company Name3',
      num_employees: 200,
      description: 'test description about company',
      logo_url: 'http://www.randomurl.com'
    });
    j1 = await Job.create({
      title: 'Test Job Title',
      salary: 50000,
      equity: 0.005,
      company_handle: 'RITH',
    });
    j2 = await Job.create({
      title: 'Test Job2 Title',
      salary: 100000,
      equity: 0.015,
      company_handle: 'RITH',
    });
    j3 = await Job.create({
      title: 'Test Job3 Title',
      salary: 500000,
      equity: 0.05,
      company_handle: 'RITH',
    });
  })

  describe("GET /companies/", function () {
    test("can get all companies", async function () {
      let response = await request(app)
        .get('/companies').send({ token });
      expect(response.statusCode).toEqual(200);
      expect(response.body.companies.length).toEqual(3);
      expect(response.body).toEqual({ companies: [{ handle: 'RITH', name: 'Test Company Name' }, { handle: 'TestComp2', name: 'Test Company Name2' }, { handle: 'TestComp3', name: 'Test Company Name3' }] });
    });
  });

  describe("GET /companies/:handle", function () {
    test("can get a company", async function () {
      let response = await request(app)
        .get(`/companies/${c1.handle}`).send({ token });
      expect(response.statusCode).toEqual(200);
      j1.date_posted = expect.any(String)
      j2.date_posted = expect.any(String)
      j3.date_posted = expect.any(String)
      delete j1.company_handle;
      delete j2.company_handle;
      delete j3.company_handle;
      c1.jobs = [j1, j2, j3];
      expect(response.body).toEqual({ company: c1 })
    });
  });

  describe("POST /companies/", function () {
    test("can create a company", async function () {
      let company = {
        handle: 'AnotherTestComp',
        name: 'Another Test Company Name2',
        num_employees: 200,
        description: 'test description about company',
        logo_url: 'http://randomurl2.com'
      }
      let response = await request(app)
        .post('/companies').send({ ...company, token });
      expect(response.statusCode).toEqual(201);
      expect(response.body).toEqual({ company })

      const getCompanyResponse = await request(app).get('/companies').send({ token });
      expect(getCompanyResponse.body.companies).toContainEqual({ handle: "AnotherTestComp", name: "Another Test Company Name2" });
      expect(getCompanyResponse.body.companies.length).toEqual(4)

    });

    test("trying to create a company with invalid url", async function () {
      let company = {
        handle: 'Another TestComp',
        name: 'Another Test Company Name',
        num_employees: 200,
        description: 'test description about company',
        logo_url: 'notaproperurl'
      }
      let response = await request(app)
        .post('/companies').send({ ...company, token });
      expect(response.statusCode).toEqual(400);
      expect(response.body.message[0]).toContain('logo_url');
    });
  });

  describe("PATCH /companies/:handle", function () {
    test("can update a company", async function () {
      let changes = {
        num_employees: 1000,
        description: 'another test description in the patch'
      }
      let response = await request(app)
        .patch(`/companies/${c1.handle}`).send({ ...changes, token });

      expect(response.statusCode).toEqual(200);
      c1.num_employees = 1000;
      c1.description = 'another test description in the patch'
      expect(response.body).toEqual({ company: c1 })

      j1.date_posted = expect.any(String)
      j2.date_posted = expect.any(String)
      j3.date_posted = expect.any(String)
      delete j1.company_handle;
      delete j2.company_handle;
      delete j3.company_handle;
      c1.jobs = [j1,j2,j3]
      const getCompanyResponse = await request(app).get('/companies/RITH').send({ token });
      expect(getCompanyResponse.body).toEqual({ company: c1 });
    });

    test("trying to update a company with invalid url", async function () {
      let company = {
        name: 'Another Test Company Name',
        num_employees: 200,
        description: 'test description about company ',
        logo_url: 'notaproperurl'
      }
      let response = await request(app)
        .patch('/companies/RITH').send({ ...company, token });
      expect(response.statusCode).toEqual(400);
      expect(response.body.message[0]).toContain('logo_url');
    });
  });

  describe("DELETE /companies/:handle", function () {
    test("can delete a company", async function () {
      let response = await request(app)
        .delete(`/companies/${c1.handle}`).send({ token });
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({ message: "Company deleted." });

      let companyResponse = await request(app).get('/companies').send({ token });
      expect(companyResponse.body.companies.length).toEqual(2);
    });
  });
});

afterAll(async function () {
  await db.end();
});