const express = require("express");
const User = require("../models/user");
const jsonschema = require("jsonschema");
const userSchema = require("../schemas/userSchema.json");
const userPatchSchema = require("../schemas/userPatchSchema.json");
const ExpressError = require("../helpers/expressError");
const { ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth');

const router = new express.Router();

router.get("/", ensureLoggedIn, async function (req, res, next) {
	try {

		users = await User.getAll();

		return res.json({ users });
	} catch (err) {
		return next(err);
	}
});

router.get("/:username", ensureLoggedIn, async function (req, res, next) {
	try {
		const user = await User.getOne(req.params.username);
		return res.json({ user });
	} catch (err) {
		return next(err);
	}
});

router.post("/", async function (req, res, next) {
	try {
		const result = jsonschema.validate(req.body, userSchema);

		if (!result.valid) {
			let listOfErrors = result.errors.map(error => error.stack);
			throw new ExpressError(listOfErrors, 400);
		}

    const user = await User.create(req.body);
    
		return res.json({ user }, 201);
	} catch (err) {
		return next(err);
	}
})

router.patch("/:username", ensureLoggedIn, ensureCorrectUser, async function(req, res, next){
	try {
		const result = jsonschema.validate(req.body, userPatchSchema);

		if (!result.valid) {
			let listOfErrors = result.errors.map(error => error.stack);
			throw new ExpressError(listOfErrors, 400);
		}

		const user = await User.edit(req.params.username, req.body);

		return res.json({ user });

	} catch (err) {
		return next(err);
	}
})

router.delete("/:username", ensureLoggedIn, ensureCorrectUser, async function(req, res, next){
	try {

		await User.remove(req.params.username);

		return res.json({message: "User deleted."});

	} catch (err) {
		return next(err)
	}
})

module.exports = router;
