const HttpError = require("../model/http-error");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const getCoordsForAddress = require("../util/location");
const Place = require("../model/place");

let DUMMY_PLACES = [
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
    id: "p5",
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

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  // const place = DUMMY_PLACES.find(p => p.id === placeId);

  //9-5 findById() je staticna metoda iz mongoosa
  // ne koristi se na instanci modela!!! vec na samom konstraktoru!!!!
  // znaci ne na "new Place" vec direktno na "Place"
  // ova metoda ne vraca promise...ako zelim promise moram napraviti Place.findById().exac()
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }

  // ovaj error je ako ne mogu pronaci taj ID u DB...
  //prethodni error iz try/catch je ako nesto nevalja sa zahtjevom, netom itd...
  if (!place) {
    const error = new HttpError("Could not find a place with that ID", 404);
    return next(error);
  }

  // place koji dobijem je spcialni mongoose objekt
  // da bi ga preveo u obicni JS obj trebam .toObject()
  // osim toga id mi je _id...prevescu ga u obicni id sa { getters: true}
  // sve spicajne stvari iz monggoosa su maknute sa .toObject() ukljucujuci i _id...pa sa getterom to popravim

  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  // slicno kao i "getPlaceById"
  const userId = req.params.uid;

  let places;
  try {
    // u MongoDB find() vrati cursor!!... pointer
    // u mongoose vrati array</cursor!!>
    places = await Place.find({ creator: userId });
  } catch (err) {
    const error = new HttpError(
      "Fetching places failed. Please try again later",
      500
    );
    return next(error);
  }

  if (!places || places.length === 0) {
    return next(new HttpError("Could not find places with that user ID", 404)); // verzija sa next ...kao primjer...mogao je i throw error
  }

  res.json({ places: places.map(place => place.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed. Please check your data", 422)
    );
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  // const createdPlace = {
  //   title,
  //   description,
  //   location: coordinates,
  //   address,
  //   creator,
  //   id: uuidv4(),
  // };
  // DUMMY_PLACES.push(createdPlace);

  //9-4
  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image:
      "https://www.askideas.com/media/39/Aerial-View-Of-Empire-State-Building-Picture.jpg",
    creator,
  });

  try {
    //9-4 save je metoda iz mongoose... kreirao sam model pomocu mongoosa pa koristim njegove static metode
    await createdPlace.save();
  } catch (err) {
    const error = new HttpError(
      "Creating place failed. Please try again.",
      500
    );
    return next(error); // nemogu throw error jer je async kod...i moram return
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed. Please check your data", 422)
    );
  }

  const { title, description } = req.body;

  const placeId = req.params.pid;

  // const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId) };

  // const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);

  //9-7
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong. Could not update place",
      500
    );
    return next(error);
  }

  place.title = title;
  place.description = description;

  // DUMMY_PLACES[placeIndex] = updatedPlace;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong. Could not update place err. #2",
      500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  // prvo dohvatim place pa ga onda obrisem...svaki put sa try/catch
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong. Could not find place with that ID",
      500
    );
    return next(error);
  }

  try {
    place.remove();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong. Could not delete place",
      500
    );
    return next(error);
  }

  // if (!DUMMY_PLACES.find(p => p.id === placeId)) {
  //   throw new HttpError("No place with that ID", 404);
  // }

  // DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);

  res.status(200).json({ message: "delete successful" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;

//***************************************************** */

// const error = new Error("Could not find a place with that ID");
// error.code = 404;
// throw error; // moze samo za sihroni kod...za asihroni kod mora ici next(error)
//next ako ima argument  znaci da je error handleing middleware
// throw error NE ZAHTJEVA return... kod se prekida svejedno
