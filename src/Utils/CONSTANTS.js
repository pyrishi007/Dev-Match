const NUMBEREGEX = /^\d{10}$/;

const EMAILREGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const ALLOWED_GENDER_VALUES = ["male", "female", "other"];

const ALLOWED_UPDATE = ["firstname", "age", "profileURL", "skills"]

module.exports = {
  NUMBEREGEX,
  EMAILREGEX,
  PASSWORD_REGEX,
  ALLOWED_GENDER_VALUES,
  ALLOWED_UPDATE
};
