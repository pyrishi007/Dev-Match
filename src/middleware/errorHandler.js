const errorHandler = (err, req, res, next) => {
  if (err.name == "ValidationError") {
    return res
      .status(400)
      .send(
        `Bad request: ${err.name.toUpperCase()} \n Error Message: ${err.message}`,
      );
  }

  if (err.name == "TypeError") {
    return res
      .status(500)
      .send(
        `Bad request: ${err.name.toUpperCase()} \n Error Message: ${err.message}`,
      );
  }

  if (err.name == "ReferenceError") {
    return res
      .status(500)
      .send(
        `Bad request: ${err.name.toUpperCase()} \n Error Message: ${err.message}`,
      );
  }

  //Anonymous error-handler
  return res
    .status(500)
    .send(`Error:  ${err.name.toUpperCase()} \n Error Message: ${err.message}`);
};

module.exports = errorHandler;
