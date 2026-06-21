const errorHandler = (err, req, res, next) => {
  //For validation error
  if (err.name == "ValidationError") {
    return res
      .status(400)
      .send(
        `Bad request: ${err.name.toUpperCase()} \n Error Message: ${err.message}`,
      );
  }

  //For typo-error
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

    // Default handler
  return res.status(500).send(
    `Error:  ${err.name.toUpperCase()} \n Error Message: ${err.message}`
  );
};

module.exports = errorHandler;
