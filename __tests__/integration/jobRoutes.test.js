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
          company_handle: 'RITH',
          date_posted: '2020-02-20'
        });
        j2 = await Job.create({
          title: 'Test Job2 Title',
          salary: 100000,
          equity: 0.015,
          company_handle: 'RITH',
          date_posted: '2020-02-20'
        });
        j3 = await Job.create({
          title: 'Test Job3 Title',
          salary: 500000,
          equity: 0.05,
          company_handle: 'RITH',
          date_posted: '2020-02-20'
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
                .get(`/jobs/1`)
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
            company_handle: 'RITH',
            date_posted: '2020-02-20'
          });
          let response = await request(app)
              .post('/jobs').send(job);
          expect(response.statusCode).toEqual(201);
          expect(response.body).toEqual({ job })

          const getJobResponse = await request(app).get('/jobs');
          
          expect(getJobResponse.body.jobs).toContainEqual({title: "Another Test Job Title", company_handle: "RITH", });
          expect(getJobResponse.body.companies.length).toEqual(4)

        });

        test("trying to create a job with invalid equity", async function () {
          let job = await Job.create({
            title: 'Another Test Job Title',
            salary: 666666,
            equity: 2,
            company_handle: 'RITH',
            date_posted: '2020-02-20'
          });
            let response = await request(app)
                .post('/jobs').send(job);
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
                .patch(`/jobs/1`).send(changes);

            expect(response.statusCode).toEqual(200);
            j1.salary = 0;
            j1.title = 'Dog Groomer';
            expect(response.body).toEqual({ job: j1 })

            const getJobResponse = await request(app).get('/jobs/1');
            expect(getJobResponse.body).toEqual({ job: j1 });
        });

        test("trying to update a job with invalid equity", async function () {
            let job = {
                title: 'Another Test Job Title',
                salary: 200.99,
                equity: 2
            }
            let response = await request(app)
                .patch('/jobs/1').send(job);
            expect(response.statusCode).toEqual(400);
            expect(response.body.message[0]).toContain('equity');
        });
    });

    describe("DELETE /jobs/:id", function () {
        test("can delete a job", async function () {
            let response = await request(app)
                .delete(`/jobs/1`)
            expect(response.statusCode).toEqual(200);
            expect(response.body).toEqual({ message: "Job deleted." });

            let companyResponse = await request(app).get('/jobs');
            expect(companyResponse.body.companies.length).toEqual(2);
        });
    });
});

afterAll(async function () {
    await db.end();
});