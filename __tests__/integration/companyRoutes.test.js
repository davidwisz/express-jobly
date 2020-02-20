process.env.NODE_ENV = "test";
const app = require("../../app");
const db = require("../../db");
const Company = require("../../models/company");
const request = require("supertest");


describe("Company Routes Test", function () {
    let c1, c2, c3;

    beforeEach(async function () {
        await db.query("DELETE FROM companies")
        c1 = await Company.create({
            handle: 'TestComp',
            name: 'Test Company Name',
            num_employees: 500,
            description: 'test description about company',
            logo_url: 'http://randomurl.com'
        });
        c2 = await Company.create({
            handle: 'TestComp2',
            name: 'Test Company Name2',
            num_employees: 300,
            description: 'test description about company',
            logo_url: 'http://randomurl.com'
        });
        c3 = await Company.create({
            handle: 'TestComp3',
            name: 'Test Company Name3',
            num_employees: 200,
            description: 'test description about company',
            logo_url: 'http://randomurl.com'
        });
    })

    describe("GET /companies/", function () {
        test("can get all companies", async function () {
            let response = await request(app)
                .get('/companies');
            expect(response.statusCode).toEqual(200);
            expect(response.body.companies.length).toEqual(3);
            expect(response.body).toEqual({ companies: [{ handle: 'TestComp', name: 'Test Company Name' },{ handle: 'TestComp2', name: 'Test Company Name2' },{ handle: 'TestComp3', name: 'Test Company Name3' }] });
        });
    });

    describe("GET /companies/:handle", function () {
        test("can get a company", async function () {
            let response = await request(app)
                .get(`/companies/${c1.handle}`)
            expect(response.statusCode).toEqual(200);
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
                .post('/companies').send(company);
            expect(response.statusCode).toEqual(201);
            expect(response.body).toEqual({ company })

            const getCompanyResponse = await request(app).get('/companies');
            expect(getCompanyResponse.body.companies).toContainEqual({handle: "AnotherTestComp", name: "Another Test Company Name2"});
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