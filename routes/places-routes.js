const express = require("express");
const { check } = require("express-validator");
// const fileUpload = require("../middleware/file-upload"); //11-9

const checkAuth = require("../middleware/check-auth"); //12-7

const placesControllers = require("../controllers/places-controller");

const router = express.Router();

// ovaj path "....." se nastavlja na filter u app.js "/api/places" -> za ovaj router
router.get("/:pid", placesControllers.getPlaceById);

router.get("/user/:uid", placesControllers.getPlacesByUserId);

//prva dva request su otvorena svima
//odavde pa nadalje, svi requestovi moraju biti authenticated (jwt token)
router.use(checkAuth);

router.post(
  "/",
  // fileUpload.single("image"),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placesControllers.createPlace
);

router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  placesControllers.updatePlace
);

router.delete("/:pid", placesControllers.deletePlace);

module.exports = router;
