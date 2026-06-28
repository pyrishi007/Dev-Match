// --LIBRARY IMPORTS--
const jwt = require("jsonwebtoken");
const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// ---MIDDLEWARE---
const errorHandler = require("./middleware/errorHandler");
const verifyToken = require("./middleware/userAuth");

// --UTILITY & HELPER FUNCTION IMPORTS--
const Client = require("./models/user.model");
const connectDB = require("./config/database");
const { encryptPassword } = require("./Utils/password");
const {
  validateRegistrationData,
  validateUpdateData,
  authenticateUser,
} = require("./Utils/validations");

// --SETING DNS LOCALLY--
const dns = require("dns/promises");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// --BASIC CONFIG SETUP--
const app = express();
const PORT = 4000;

//MIDDLEWARE
//ELIGIBLE FOR ALL ROUTES
app.use(express.json());
app.use(cookieParser());

//VERIFY /user/n ROUTEs FOR JWT TOKEN
app.use("/user", verifyToken);

//-------AUTH ROUTES------
//post /auth/register
app.post("/auth/register", async (req, res, next) => {
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
app.post("/auth/login", async (req, res, next) => {
  const { password, email } = req?.body;

  try {
    //check for login data
    const user = await authenticateUser(password, email);

    //JWT CREATION
    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY);

    // JWT INSIDE COOKIE
    res.cookie("token", token);
    res.status(200).send("Login successfull");
  } catch (err) {
    next(err);
  }
});

// ------ PROTECTED ROUTES -------
//get /user
app.get("/users", async (req, res, next) => {
  try {
    const allFeedUser = await Client.find();

    res.send(allFeedUser);
  } catch (err) {
    next(err);
  }
});

// get /user/profile
app.get("/user/profile", (req, res, next) => {
  try {
    res.status(200).send(req.user);
  } catch (err) {
    next(err);
  }
});

// Global error Handler
app.use(errorHandler);

// ---- DB CONNECTION ----
connectDB()
  .then(() => {
    console.log("DB connection successfull");
    app.listen(PORT, () => {
      console.log(`Server is up and running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Error message : ${err.message}`);
  });
