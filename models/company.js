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
    return result.rows;
  }

  static async getAll(){
    const result = await db.query(`SELECT handle, name FROM companies ORDER BY handle`);
    return result.rows;
  }


  static async getOne(handle){
    const result = await db.query(`
      SELECT handle, name, num_employees, description, logo_url FROM companies WHERE handle = $1`, 
    [handle]);
    let company = result.rows[0];
    
    const jobResults = await db.query(`SELECT company_handle, title, salary, equity, date_posted FROM jobs WHERE company_handle = $1`, [handle]);
    let jobs = jobResults.rows;

    company.jobs = jobs;

    return company;

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
    return result.rows[0];
  }

  static async remove(handle){
    const result = await db.query(`
    DELETE FROM companies WHERE handle = $1 RETURNING handle`,
    [handle]);
    if (!result.rows.length) {
      throw new ExpressError(`There is no company with a handle '${handle}`, 404);
    }
  }
}


module.exports = Company;