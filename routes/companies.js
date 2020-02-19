const Company = require("../models/company");
const express = require("express");
const ExpressError = require("../helpers/expressError");

const router = new express.Router();

/** GET / => {companies: [company, ...]}  */

router.get("/", async function(req, res, next) {
	try {
    /* SEND QUERY STRING AS ARGUMENT TO FUNCTION ONLY IF QUERY STRING EXISTS */
    console.log(req.query);
		const companies = (req.query.length > 0) ? await Company.getCompanies(req.query) : await Company.getCompanies();
		return res.json({ companies });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
