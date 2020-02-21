const express = require("express");
const Job = require("../models/job");
const jsonschema = require("jsonschema");
const jobSchema = require("../schemas/jobSchema.json");
const jobPatchSchema = require("../schemas/jobPatchSchema.json");
const ExpressError = require("../helpers/expressError");
const { ensureLoggedIn, ensureIsAdmin } = require('../middleware/auth');

const router = new express.Router();

router.use(ensureLoggedIn);

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

router.get("/:id", async function (req, res, next) {
	try {
		const job = await Job.getOne(req.params.id);
		return res.json({ job });
	} catch (err) {
		return next(err);
	}
});

router.post("/", ensureIsAdmin, async function (req, res, next) {
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

router.patch("/:id", ensureIsAdmin, async function(req, res, next){
	try {

		const result = jsonschema.validate(req.body, jobPatchSchema);

		if (!result.valid) {
			let listOfErrors = result.errors.map(error => error.stack);
			throw new ExpressError(listOfErrors, 400);
		}

		const job = await Job.edit(req.params.id, req.body);

		return res.json({ job });

	} catch (err) {
		return next(err);
	}
})

router.delete("/:id", ensureIsAdmin, async function(req, res, next){
	try {

		await Job.remove(req.params.id);

		return res.json({message: "Job deleted."});

	} catch (err) {
		return next(err)
	}
})

module.exports = router;
