// --LIBRARY IMPORTS--
const express = require("express");
const cookieParser = require("cookie-parser");

//--UTILS--
const connectDB = require("./config/database");

//--SETING DNS LOCALLY--
const dns = require("dns/promises");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

//---MIDDLEWARE IMPORTS--
const errorHandler = require("./middleware/errorHandler");

//CONFIG
const app = express();
const PORT = 4000;

//--MIDDLEWARE--
app.use(express.json());
app.use(cookieParser());

//--ROUTES IMPORTS--
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const profileRouter = require("./routes/profile");

//--PROTECTED ROUTES--
app.use("/", authRouter);
app.use("/", userRouter);
app.use("/", profileRouter);

//GEH
app.use(errorHandler);

//DB CONNECTION
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
