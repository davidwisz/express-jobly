const db = require("../db");
const ExpressError = require("../helpers/expressError");

/** Collection of related methods for companies. */

class Company {

  static async getCompanies(queryObj) {
    /* BUILD ARRAYS FOR THE 'WHERE' STATEMENT OF OUR SQL QUERY AND FOR OUR ARRAY OF VARS */
    let queryArray = [];
    let whereArray = [];
    let where = '';
    if (queryObj) {
      console.log('QUERY OBJECT IS TRUEEEEEEEEEEEEE')
      where = 'WHERE';
      let max_employees = parseInt(queryObj.max_employees);
      let min_employees = parseInt(queryObj.min_employees);
      //console.log('max_employees', max_employees, typeof max_employees, 'min_employees', min_employees, typeof min_employees);
      let search = queryObj.search;
      if (max_employees < min_employees) {
        throw new ExpressError("Incorrect parameters", 400)
      }

      let i=1;
      if (search){
        whereArray.push(`handle ILIKE $${i}`);
        queryArray.push(search);
        i++
      }
      if (min_employees){
        whereArray.push(`num_employees > $${i}`);
        queryArray.push(min_employees);
        i++
      }
      if (max_employees){
        whereArray.push(`num_employees < $${i}`);
        queryArray.push(max_employees);
      }
    }

    let filter = whereArray.join(', ')

    let result = await db.query(`SELECT name, handle FROM companies ${where} ${filter}`, queryArray);
    return result.rows;
  }

}
module.exports = Company;