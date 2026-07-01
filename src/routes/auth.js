// --LIBRARY IMPORTS--
const express = require("express");

// --UTILS--
const { encryptPassword } = require("../Utils/password");
const {
  validateRegistrationData,
  authenticateUser,
  forgetDataValidation,
  resetDataValidation,
} = require("../Utils/validations");
const {
  resetPasswordMail,
  forgetRandomToken,
} = require("../Utils/resetPasswordMail");
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

//post /auth/forget-password
authRouter.post("/auth/forget-password", async (req, res, next) => {
  try {
    //VALIDATION
    const user = await forgetDataValidation(req.body.email);

    //RANDOM TOKEN GENRATION
    const randomToken = forgetRandomToken();

    //SAVING TOKEN TO DB
    await user.saveToken(randomToken);

    //RESET TOKEN MAIL
    const info = await resetPasswordMail(req.body.email, randomToken);

    res.send("Email sent Successfully");
  } catch (err) {
    next(err);
  }
});

//post /auth/reset-password
authRouter.patch("/auth/reset-password", async (req, res, next) => {
  try {
    //VALIDATION
    const user = await resetDataValidation(
      req.body.token,
      req.body.newPassword,
    );

    //CHECKING TOKEN
    await user.verifyToken(req.body.token);

    //HASHING NEW PASSWORD
    const hasedPassword = await encryptPassword(req.body.newPassword);

    //SAVING THIS HASHED PASSWORD TO DB
    user.password = hasedPassword;

    //CLEANING TOKEN
    user.passwordToken = undefined;

    //SAVING NEW PASSWORD TO DB
    await user.save();

    //RESPONSE TO THE CLIENT
    res.send("Password has been updated successfully");
  } catch (err) {
    next(err);
  }
});

module.exports = authRouter;
