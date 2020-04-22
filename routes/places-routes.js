const express = require("express");

const router = express.Router();

const DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire state building",
    description: "bla bla bla",
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    address: "20 W 34th St, New York, NY 10001",
    creator: "u1",
  },
  {
    id: "p2",
    title: "Empire state building",
    description: "bla bla bla",
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    address: "20 W 34th St, New York, NY 10001",
    creator: "u2",
  },
];

// ovaj path "/" se nastavlja na filter u app.js "/api/places" -> za ovaj router
router.get("/:pid", (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find(p => p.id === placeId);

  // if (!place) {
  //   return res
  //     .status(404)
  //     .json({ message: "Could not find a place with that ID" });
  // }
  // zamjenio sa error handleing u app.js 6-10

  if (!place) {
    const error = new Error("Could not find a place with that ID");
    error.code = 404;
    throw error; // moze samo za sihroni kod...za asihroni kod mora ici next(error)
    //next ako ima argument  znaci da je error handleing middleware
    // throw error NE ZAHTJEVA return... kod se prekida svejedno
  }

  res.json({ place: place });
});

router.get("/user/:uid", (req, res, next) => {
  const userId = req.params.uid;

  const place = DUMMY_PLACES.find(u => u.creator === userId);

  // if (!place) {
  //   return res
  //     .status(404)
  //     .json({ message: "Could not find a place with that user ID" });
  // }
  //zamjenio !!!!!!! 6-10
  if (!place) {
    const error = new Error("Could not find a place with that user ID");
    error.code = 404;
    return next(error); // verzija sa next ...kao primjer...mogao je i throw error
  }
  res.json({ place: place });
});

module.exports = router;
