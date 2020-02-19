process.env.NODE_ENV = "test";
// const app = require("../app");
// const db = require("../db");
const request = require("supertest");
const sqlForPartialUpdate = require("../../helpers/partialUpdate")
describe("partialUpdate()", () => {
  it("should generate a proper partial update query with just 1 field",
      function () {
        let items = {title: "Manager"};
        let query = sqlForPartialUpdate("jobs", items, "id", 1);
        console.log(query);
        expect(query).toEqual({ query: 'UPDATE jobs SET title=$1 WHERE id=$2 RETURNING *',
        values: [ 'Manager', 1 ] });

  });
});
