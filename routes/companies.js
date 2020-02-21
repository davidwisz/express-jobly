const express = require("express");
const Company = require("../models/company");
const jsonschema = require("jsonschema");
const companySchema = require("../schemas/companySchema.json");
const companyPatchSchema = require("../schemas/companyPatchSchema.json");
const ExpressError = require("../helpers/expressError");

const router = new express.Router();

router.get("/", async function (req, res, next) {
	try {
		const searchParams = Object.keys(req.query);

		let companies = (searchParams.length) 
			? await Company.getCompaniesByQuery(req.query)
			: await Company.getAll();

		return res.json({ companies });
	} catch (err) {
		return next(err);
	}
});

router.get("/:handle", async function (req, res, next) {
	try {
		const company = await Company.getOne(req.params.handle);
		return res.json({ company });
	} catch (err) {
		return next(err);
	}
});

router.post("/", async function (req, res, next) {
	try {
		const result = jsonschema.validate(req.body, companySchema);

		if (!result.valid) {
			let listOfErrors = result.errors.map(error => error.stack);
			throw new ExpressError(listOfErrors, 400);
		}

		const company = await Company.create(req.body);
		return res.json({ company }, 201);
	} catch (err) {
		return next(err);
	}
})

router.patch("/:handle", async function(req, res, next){
	try {
		const result = jsonschema.validate(req.body, companyPatchSchema);

		if (!result.valid) {
			let listOfErrors = result.errors.map(error => error.stack);
			throw new ExpressError(listOfErrors, 400);
		}

		const company = await Company.edit(req.params.handle, req.body);

		return res.json({ company });

	} catch (err) {
		return next(err);
	}
})

router.delete("/:handle", async function(req, res, next){
	try {

		await Company.remove(req.params.handle);

		return res.json({message: "Company deleted."});

	} catch (err) {
		return next(err)
	}
})

module.exports = router;
