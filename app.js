const express = require("express");
const bodyParser = require("body-parser");
const HttpError = require("./model/http-error");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");

const app = express();

app.use(bodyParser.json()); // ovo mi formatira req.body u citljiv oblik

//places rute
app.use("/api/places", placesRoutes);

// users rute
app.use("/api/users", usersRoutes);

// sve ostale rute koje nisu pokrivene
app.use((req, res, next) => {
  const error = new HttpError("Could not found this route", 404);
  throw error;
});

// ako midleware ima 4 argumenta, express je tretira kao error handleing midleware function
app.use((error, req, res, next) => {
  if (res.headerSent) {
    // ako je response vec poslan
    return next(error);
  }

  res
    .status(error.code || 500)
    .json({ message: error.message || "unknown error" });
});

mongoose
  .connect(
    "mongodb+srv://psp:JRAzWlQFfapeKuTl@cluster0-jyywc.mongodb.net/places?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    app.listen(5000);
  })
  .catch(err => {
    console.log(err);
  });
