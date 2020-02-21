const db = require("../db");
const ExpressError = require("../helpers/expressError");
const partialUpdate = require("../helpers/partialUpdate");

/** Collection of related methods for jobs. */

class Job {

  static async getJobsByQuery(queryObj) {
    /* BUILD ARRAYS FOR THE 'WHERE' STATEMENT OF OUR SQL QUERY AND FOR OUR ARRAY OF VARS */
    let i=1;
    let queryArray = [];
    let whereArray = [];

    const { min_salary, min_equity, search } = queryObj;

    if (search){
      whereArray.push(`title ILIKE $${i}`);
      queryArray.push(`%${search}%`);
      i++;
    }

    if (min_salary){
      whereArray.push(`salary > $${i}`);
      queryArray.push(min_salary);
      i++;
    }
    if (min_equity){
      whereArray.push(`equity > $${i}`);
      queryArray.push(min_equity);
    }
    
    let filter = whereArray.join(' AND ');
    let result = await db.query(`SELECT title, handle FROM jobs JOIN companies ON handle = company_handle WHERE ${filter} ORDER BY handle`, queryArray);
    if (!result.rows.length) {
      throw new ExpressError(`Your query didn't match any jobs.`, 404);
    }
    return result.rows;
  }

  static async getAll(){
    const result = await db.query(`SELECT title, handle FROM jobs JOIN companies ON handle = company_handle ORDER BY handle`);
    return result.rows;
  }


  static async getOne(id){
    const result = await db.query(`
      SELECT id, title, salary, equity, company_handle, date_posted
      FROM jobs 
      WHERE id = $1`, 
    [id]);
    if (!result.rows.length) {
      throw new ExpressError(`There is no job with an id ${id}`, 404);
    }
    return result.rows[0];
    
  }


  static async create(data){
    const { title, salary, equity, company_handle } = data;
    const result = await db.query(`
    INSERT INTO jobs (title, salary, equity, company_handle, date_posted) 
    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
    RETURNING id, title, salary, equity, company_handle, date_posted`,
    [title, salary, equity, company_handle]
    );
    return result.rows[0];
  }


  static async edit(id, data){
    const { query, values } = partialUpdate('jobs', data, 'id', id);
    const result = await db.query(query, values);
    if (!result.rows.length) {
      throw new ExpressError(`There is no job with an id ${id}`, 404);
    }
    return result.rows[0];
  }

  static async remove(id){
    const result = await db.query(`
    DELETE FROM jobs WHERE id = $1 RETURNING id`,
    [id]);
    if (!result.rows.length) {
      throw new ExpressError(`There is no job with an id ${id}`, 404);
    }
  }
}


module.exports = Job;