const HttpError = require("../model/http-error");
const { validationResult } = require("express-validator");
const User = require("../model/user");
const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");

// let DUMMY_USERS = [
//   {
//     id: "u1",
//     name: "test",
//     email: "test@email.com",
//     password: "test",
//   },
//   {
//     id: "u2",
//     name: "test2",
//     email: "test2@email.com",
//     password: "test",
//   },
// ];

const getUsers = async (req, res, next) => {
  // ovo vrati sve dokumente iz kolekcije iz Atlasa
  //trebam samo email i name ...ne zelim password
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (error) {
    return next(
      new HttpError("Fetching users failed. Please try again later", 500)
    );
  }

  res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed. Please check your data", 422)
    );
  }

  const { name, email, password } = req.body; // maknio places u 9-14

  // const hasUser = DUMMY_USERS.find(u => u.email === email);
  // if (hasUser) {
  //   throw new HttpError("User with that email already exists", 422);
  // }

  //9-11
  // za email validaciju vec imam unique provjeru u modelu...dali je jedinstve
  // ali error je defaultni...dodacu i manualnu validaciju
  //za provjeru pokusam dohvatit dali imam usera sa tom email adresom
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Signing up failed", 500);
    return next(error);
  }

  //ako imam taj email u DB
  if (existingUser) {
    const _error = new HttpError(
      "User exist already. Please login instead",
      422
    );
    return next(_error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("Could not create user", 500);

    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    image: req.file.path,
    places: [],
  });

  // DUMMY_USERS.push(newUser);

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Signing up failed no#2", 500);
    return next(error);
  }

  let token;
  //svaki monoose objekt kreiran ima getter za ID
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Signing up failed no#3", 500);
    return next(error);
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  // const identifiedUser = DUMMY_USERS.find(u => u.email === email);

  // if (!identifiedUser || identifiedUser.password !== password) {
  //   return next(
  //     new HttpError("Could not identify that user, wrong credentials", 401)
  //   );
  // }

  //9-12
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Logging in failed", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError("Invalid credentials", 403);
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError("Could not login user", 500);
    return next(error);
  }

  if (!isValidPassword) {
    const err = new HttpError("Invalid credentials", 401);
    return next(err);
  }

  let token;
  //svaki monoose objekt kreiran ima getter za ID
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Logging in failed no#3", 500);
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
