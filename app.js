const express = require("express");
const bodyParser = require("body-parser");

const placesRoutes = require("./routes/places-routes");

const app = express();

app.use("/api/places", placesRoutes); // => api/places/...

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

app.listen(5000);
