const db = require("../db");
const ExpressError = require("../helpers/expressError");
const partialUpdate = require("../helpers/partialUpdate");

/** Collection of related methods for companies. */

class Company {

  static async getCompaniesByQuery(queryObj) {
    /* BUILD ARRAYS FOR THE 'WHERE' STATEMENT OF OUR SQL QUERY AND FOR OUR ARRAY OF VARS */
    let i=1;
    let queryArray = [];
    let whereArray = [];

    const { max_employees, min_employees } = queryObj;
    let search = queryObj.search;

    if (+max_employees < +min_employees) {
      throw new ExpressError("Incorrect parameters", 400);
    }
    if (search){
      whereArray.push(`name ILIKE $${i}`);
      queryArray.push(`%${search}%`);
      i++;
    }

    if (min_employees){
      whereArray.push(`num_employees > $${i}`);
      queryArray.push(min_employees);
      i++;
    }
    if (max_employees){
      whereArray.push(`num_employees < $${i}`);
      queryArray.push(max_employees);
    }
    
    let filter = whereArray.join(' AND ');
    let result = await db.query(`SELECT handle, name FROM companies WHERE ${filter} ORDER BY handle`, queryArray);
    if (!result.rows.length) {
      throw new ExpressError(`Your query did not match any companies.`, 404);
    }
    return result.rows;
  }

  static async getAll(){
    const result = await db.query(`SELECT handle, name FROM companies ORDER BY handle`);
    return result.rows;
  }


  static async getOne(temp_handle){
    // const result = await db.query(`
    //   SELECT handle, name, num_employees, description, logo_url FROM companies WHERE handle = $1`, 
    // [handle]);

    const result = await db.query(`SELECT * FROM companies JOIN jobs ON handle = company_handle WHERE handle = $1 ORDER BY handle`,[temp_handle]);
    if (!result.rows.length) {
      throw new ExpressError(`There is no company with the handle ${temp_handle}`, 404);
    }
    let jobsArr= [];

    result.rows.forEach(function (obj) {
      const {id, title, salary, equity, date_posted} = obj
      jobsArr.push({id, title, salary, equity, date_posted})
    })

    let { handle, name, num_employees, description, logo_url } = result.rows[0];
    let company = { handle, name, num_employees, description, logo_url };
    company.jobs = jobsArr;
    
    return company;

    // let company = result.rows[0];
    
    // const jobResults = await db.query(`SELECT id, company_handle, title, salary, equity, date_posted FROM jobs WHERE company_handle = $1`, [handle]);
    // let jobs = jobResults.rows;

    // company.jobs = jobs;

    // 
    // return company;

  }

  static async create(data){
    const { handle, name, num_employees, description, logo_url } = data;
    const result = await db.query(`
    INSERT INTO companies (handle, name, num_employees, description, logo_url) 
    VALUES ($1, $2, $3, $4, $5)
    RETURNING handle, name, num_employees, description, logo_url`,
    [handle, name, num_employees, description, logo_url]
    );
    return result.rows[0];
  }


  static async edit(handle, data){
    const { query, values } = partialUpdate('companies', data, 'handle', handle);
    const result = await db.query(query, values);
    if (!result.rows.length) {
      throw new ExpressError(`There is no company with the handle ${handle}`, 404);
    }
    return result.rows[0];
  }

  static async remove(handle){
    const result = await db.query(`
    DELETE FROM companies WHERE handle = $1 RETURNING handle`,
    [handle]);
    if (!result.rows.length) {
      throw new ExpressError(`There is no company with the handle ${handle}`, 404);
    }
  }
}


module.exports = Company;