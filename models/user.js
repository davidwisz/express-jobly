const db = require("../db");
const ExpressError = require("../helpers/expressError");
const partialUpdate = require("../helpers/partialUpdate");
const bycrpt = require('bcrypt')
const { BCRYPT_WORK_FACTOR } = require('../config')



/** Collection of related methods for users. */

class User {

  static async create(data) {
    let { username, password, first_name, last_name, email, photo_url, is_admin } = data;
    const hashedPassword = await bycrpt.hash(password, BCRYPT_WORK_FACTOR);
    if (!is_admin) {
      is_admin = false;
    }
    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, email, photo_url, is_admin) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING username, first_name, last_name, email, photo_url, is_admin`,
      [username, hashedPassword, first_name, last_name, email, photo_url, is_admin]);
      
    if (!result.rows[0]) {
      throw new ExpressError(`Invalid registration info`, 400);
    }

    return result.rows[0];
  }
  
  static async authenticate(username, password) {
    const result = await db.query(`
      SELECT password, is_admin
      FROM users 
      WHERE username = $1`,
      [username]);
    const user = result.rows[0];
    
    if (user){
      let isValid = await bycrpt.compare(password, user.password);
      if (isValid) {
        return user;
      }
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
    if (!result.rows.length) {
      throw new ExpressError(`There is no user with a username ${username}`, 404);
    }

    return result.rows[0];
  }

  static async edit(username, data){
    const { query, values } = partialUpdate('users', data, 'username', username);
    const result = await db.query(query, values);
    if (!result.rows.length) {
      throw new ExpressError(`There is no user with a username ${username}`, 404);
    }
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
      throw new ExpressError(`There is no user with a username ${username}`, 404);
    }
  }
  
}

module.exports = User;

