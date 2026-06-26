//----GLOBAL ERROR HANDLER----
const errorHandler = (err, req, res, next) => {
  //VALIDATION ERROR
  if (err.name === "ValidationError") {
    return res
      .status(400)
      .send(
        `Bad request: ${err.name.toUpperCase()} \n Error Message: ${err.message}`,
      );
  }

  //TYPE ERROR
  if (err.name === "TypeError") {
    return res
      .status(500)
      .send(
        `Bad request: ${err.name.toUpperCase()} \n Error Message: ${err.message}`,
      );
  }

  //REFERENCE ERROR
  if (err.name === "ReferenceError") {
    return res
      .status(500)
      .send(
        `Bad request: ${err.name.toUpperCase()} \n Error Message: ${err.message}`,
      );
  }

  //CAST ERROR
  if (err.name === "CastError") {
    return res.status(400).send(`Bad Request: Invalid ${err.path}`);
  }

  //DUPLICATE VALUE ERROR
  if (err.code === 11000) {
    return res.status(409).send("Duplicate data already exists.");
  }

  //GENROIC ERROR
  return res
    .status(500)
    .send(`Error: ${err.name.toUpperCase()} \n Error Message: ${err.message}`);
};

module.exports = errorHandler;
