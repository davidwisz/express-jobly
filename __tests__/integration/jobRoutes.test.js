process.env.NODE_ENV = "test";
const app = require("../../app");
const db = require("../../db");
const Job = require("../../models/job");
const request = require("supertest");


describe("Jobs Routes Test", function () {
    let j1, j2, j3;

    beforeEach(async function () {
        await db.query("DELETE FROM jobs")
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
                .get('/jobs');
            expect(response.statusCode).toEqual(200);
            expect(response.body.jobs.length).toEqual(3);
            expect(response.body).toEqual({ "jobs": [{"title": "Test Job Title", "handle": "RITH"},{"title": "Test Job2 Title","handle": "RITH"},{"title": "Test Job3 Title","handle": "RITH"}]});
        });
    });

    describe("GET /jobs/:id", function () {
        test("can get a job", async function () {
            let response = await request(app)
                .get(`/jobs/${j1.handle}`)
            expect(response.statusCode).toEqual(200);
            expect(response.body).toEqual({ job: j1 })
        });
    });

    describe("POST /jobs/", function () {
        test("can create a job", async function () {
          let job = await Job.create({
            title: 'Another Test Job Title',
            salary: 666666,
            equity: 0.015,
            company_handle: 'RITH'
          });
            let response = await request(app)
                .post('/jobs').send(job);
            expect(response.statusCode).toEqual(201);
            expect(response.body).toEqual({ job })

            const getJobResponse = await request(app).get('/jobs');
            
            expect(getCompanyResponse.body.companies).toContainEqual({handle: "AnotherTestComp", title: "Another Test Job Name2"});
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
                .post('/companies').send(company);
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
                .patch(`/companies/${c1.handle}`).send(changes);

            expect(response.statusCode).toEqual(200);
            c1.num_employees = 1000;
            c1.description = 'another test description in the patch'
            expect(response.body).toEqual({ company: c1 })

            const getCompanyResponse = await request(app).get('/companies/TestComp');
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
                .patch('/companies/TestComp').send(company);
            expect(response.statusCode).toEqual(400);
            expect(response.body.message[0]).toContain('logo_url');
        });
    });

    describe("DELETE /companies/:handle", function () {
        test("can delete a company", async function () {
            let response = await request(app)
                .delete(`/companies/${c1.handle}`)
            expect(response.statusCode).toEqual(200);
            expect(response.body).toEqual({ message: "Company deleted." });

            let companyResponse = await request(app).get('/companies');
            expect(companyResponse.body.companies.length).toEqual(2);
        });
    });
});

afterAll(async function () {
    await db.end();
});