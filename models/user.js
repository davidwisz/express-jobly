const db = require("../db");
const ExpressError = require("../helpers/expressError");
const partialUpdate = require("../helpers/partialUpdate");
const bycrpt = require('bcrypt')
const { BCRYPT_WORK_FACTOR } = require('../config')



/** Collection of related methods for users. */

class User {

  static async create(data) {
    const { username, password, first_name, last_name, email, photo_url } = data;
    const hashedPassword = await bycrpt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, email, photo_url) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING username, first_name, last_name, email, photo_url`,
      [username, hashedPassword, first_name, last_name, email, photo_url]);
      
    if (!result.rows[0]) {
      throw new ExpressError(`Invalid registration info`, 400);
    }

    return result.rows[0];
  }
  
  static async authenticate(username, password) {
    const result = await db.query(`
      SELECT password 
      FROM users 
      WHERE username = $1`,
      [username]);
    const user = result.rows[0];
    
    if (user){
      let isValid = await bycrpt.compare(password, user.password);
      return isValid;
    }
    return false;
  }

  static async getAll(){
    const result = await db.query(`SELECT username, first_name, last_name, email FROM users ORDER BY username`);
    return result.rows;
  }


  static async getOne(username){
    const result = await db.query(`
      SELECT username, first_name, last_name, email, photo_url FROM users WHERE username = $1`, 
    [username]);

    return result.rows[0];
  }



  static async edit(username, data){
    const { query, values } = partialUpdate('users', data, 'username', username);
    const result = await db.query(query, values);
    let user = result.rows[0];
    delete user.password;
    delete user.is_admin;
    return user;
  }

  static async remove(username){
    const result = await db.query(`
    DELETE FROM users WHERE username = $1 RETURNING username`,
    [username]);
    if (!result.rows.length) {
      throw new ExpressError(`There is no user with a username '${username}`, 404);
    }
  }
}

module.exports = User;

