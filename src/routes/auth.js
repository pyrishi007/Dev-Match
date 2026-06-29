// --LIBRARY IMPORTS--
const express = require("express");

// --UTILS--
const { encryptPassword } = require("../Utils/password");
const {
  validateRegistrationData,
  authenticateUser,
} = require("../Utils/validations");
const Client = require("../models/user.model");

//CONFIG
const authRouter = express.Router();

//post /auth/register
authRouter.post("/auth/register", async (req, res, next) => {
  //Extracting SignUp data
  const {
    firstname,
    lastname,
    dob,
    number,
    email,
    password,
    age,
    gender,
    profileURL,
    skills,
  } = req?.body;

  try {
    //Validation checks for SignUp
    await validateRegistrationData(req);

    //Password hashing & encryption
    const hashPassword = await encryptPassword(req.body.password);

    //Final data storing
    const user = await Client({
      firstname,
      lastname,
      dob,
      number,
      email,
      password: hashPassword, //saving hash password
      age,
      gender,
      profileURL,
      skills,
    }).save();
    res.send(user);
  } catch (err) {
    next(err);
  }
});

//post /auth/login
authRouter.post("/auth/login", async (req, res, next) => {
  const { password, email } = req?.body;

  try {
    //check for login data
    const user = await authenticateUser(password, email);

    //JWT CREATION
    const token = await user.genrateJWT();

    // JWT INSIDE COOKIE
    res.cookie("token", token);
    res.status(200).send("Login successfull");
  } catch (err) {
    next(err);
  }
});
//post /auth/logout
authRouter.post("/auth/logout", async (req, res, next) => {
  try {
    //explicitly expiring the cookie, as null
    //cookie = "token" as key : null as value so JWT became as null
    res.cookie("token", null, {
      expires: new Date(Date.now()), //Current time, ongoing pressent time
    });
    res.send("Successfully Logout!");
  } catch (err) {
    next(err);
  }
});

module.exports = authRouter;
