const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const Client = require("./models/user.model");
const conenctDB = require("./config/database");
const dns = require("dns/promises");
const encrptPassword = require("./Utils/password");
const { errorMonitor } = require("events");
const {
  validateRegistrationData,
  validateUpdateData,
  authenticateUser,
} = require("./Utils/validations");

// Setting up DNS locally
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const PORT = 4000;

//JSON -> JS object
app.use(express.json());

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
    const hashPassword = await encrptPassword(req.body.password);

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

//post /auth/login'
app.post("/auth/login", async (req, res, next) => {
  const { password, email } = req?.body;

  try {
    //check for login data
    const isAuthenticated = await authenticateUser(password, email);

    if (!isAuthenticated) throw new Error("Invalid password");

    res.send("Login successfull");
  } catch (err) {
    next(err);
  }
});

//get /user
app.get("/user", async (req, res, next) => {
  try {
    const allFeedUser = await Client.find();

    res.send(allFeedUser);
  } catch (err) {
    next(err);
  }
});

// get /user/id/:userId
app.get("/user/id/:id", async (req, res, next) => {
  try {
    const user = await Client.findById(req.params.id);
    res.send(user);
  } catch (err) {
    next(err);
  }
});

// get /user/email/:userEmail
app.get("/user/email/:email", async (req, res, next) => {
  try {
    const user = await Client.findOne({ email: req.params.email });
    res.send(user);
  } catch (err) {
    next(err);
  }
});

//delete /user/:userId
app.delete("/user/:id", async (req, res, next) => {
  try {
    const deletedUser = await Client.findByIdAndDelete(req.params.id);
    res.send(`User successfully deleted : ${deletedUser}`);
  } catch (err) {
    next(err);
  }
});

//patch /user/:id
app.patch("/user/:id", async (req, res, next) => {
  try {
    //Validation checks for ALLOWED_UPDATE
    validateUpdateData(req);

    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after", runValidators: true },
    );
    res.send(updatedClient);
  } catch (err) {
    next(err);
  }
});

// Global error Handler
app.use(errorHandler);

//DB connection
conenctDB()
  .then(() => {
    console.log("DB connection successfull");
    app.listen(PORT, () => {
      console.log(`Server is up and running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Error message : ${err.message}`);
  });
