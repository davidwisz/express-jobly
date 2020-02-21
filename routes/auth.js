const express = require("express");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { SECRET_KEY, JWT_OPTIONS } = require("../config");
const ExpressError = require('../helpers/expressError');

const router = new express.Router();

const app = express();
app.use(express.json());

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async function (req, res, next) {
  try {
    const { username, password } = req.body;
    let user = await User.authenticate(username, password);
    if (user) {
      let { is_admin } = user;
      let payload = { username, is_admin };
      let token = jwt.sign(payload, SECRET_KEY, JWT_OPTIONS);

      return res.send({ token });
    } else {
      throw new ExpressError("Invalid Username/Password!", 400);
    }
  } catch (err) {
    return next(err);
  }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post("/register", async function (req, res, next) {
  try {
    let results = await User.create(req.body);
    let { is_admin } = results;
    let payload = { username: results.username, is_admin };
    let token = jwt.sign(payload, SECRET_KEY, JWT_OPTIONS);
    return res.send({ token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
