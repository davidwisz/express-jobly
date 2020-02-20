const express = require("express");
const Job = require("../models/job");
const jsonschema = require("jsonschema");
const jobSchema = require("../schemas/jobSchema.json");
const jobPatchSchema = require("../schemas/jobPatchSchema.json");
const ExpressError = require("../helpers/expressError");

const router = new express.Router();

router.get("/", async function (req, res, next) {
	try {
		let jobs = null;
		const searchParams = Object.keys(req.query);

		if (searchParams.length) {
			jobs = await Job.getCompaniesByQuery(req.query)
		} else {
			jobs = await Job.getAll();
		}

		return res.json({ jobs });
	} catch (err) {
		return next(err);
	}
});

router.get("/:handle", async function (req, res, next) {
	try {
		const job = await Job.getOne(req.params.handle);
		return res.json({ job });
	} catch (err) {
		return next(err);
	}
});

router.post("/", async function (req, res, next) {
	try {
		const result = jsonschema.validate(req.body, jobSchema);

		if (!result.valid) {
			let listOfErrors = result.errors.map(error => error.stack);
			throw new ExpressError(listOfErrors, 400);
		}

		const job = await Job.create(req.body);
		return res.json({ job }, 201);
	} catch (err) {
		return next(err);
	}
})

router.patch("/:handle", async function(req, res, next){
	try {

		const result = jsonschema.validate(req.body, jobPatchSchema);

		if (!result.valid) {
			let listOfErrors = result.errors.map(error => error.stack);
			throw new ExpressError(listOfErrors, 400);
		}

		const job = await Job.edit(req.params.handle, req.body);

		return res.json({ job });

	} catch (err) {
		return next(err);
	}
})

router.delete("/:handle", async function(req, res, next){
	try {

		await Job.remove(req.params.handle);

		return res.json({message: "Job deleted."});

	} catch (err) {
		return next(err)
	}
})

module.exports = router;
