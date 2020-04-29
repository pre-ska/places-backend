const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const HttpError = require("./model/http-error");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");

const app = express();

app.use(bodyParser.json()); // ovo mi formatira req.body u citljiv oblik

//11-8 za dohvatit slike
//static samo return fajlove, ne executira ih
app.use("/uploads/images", express.static(path.join("uploads", "images")));

//10-5 CORS fix ... browser odbija prihvatit response od servera ako taj response ne sadrzi odredjene headere
// tako da u ovom koraku dodajem odredjene headere NA SVAKI RESPONSE... tj. na res objekt
app.use((req, res, next) => {
  //ovo dozvoljava bilo kojoj domeni da posalje request...mogao sam umjesto * staviti localhost:3000 (frontent server)...ali u ovom slucaju dopustam svim domenama da posalju request
  res.setHeader("Access-Control-Allow-Origin", "*");

  //ovo postavlja koji headeri mogu biti u requestu...i koji ce biti obradjeni
  //prva dva su automatski postavljena od browsera
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  //koje metode requesta su dozvoljene
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE");
  next();
});

//places rute
app.use("/api/places", placesRoutes);

// users rute
app.use("/api/users", usersRoutes);

// sve ostale rute koje nisu pokrivene
app.use((req, res, next) => {
  const error = new HttpError("Could not found this route", 404);
  throw error;
});

//generalni error
// ako midleware ima 4 argumenta, express ga tretira kao error handleing midleware function
app.use((error, req, res, next) => {
  //11-7 multer dodaje file prop na request
  // ako imam error, zelim izbrisati taj file ...jer nesto nije valjalo
  if (req.file) {
    // ovo  brise image sa servera
    fs.unlink(req.file.path, err => {
      console.log(err);
    });
  }

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
    "mongodb+srv://psp:JRAzWlQFfapeKuTl@cluster0-jyywc.mongodb.net/mern?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    app.listen(5000);
  })
  .catch(err => {
    console.log(err);
  });
