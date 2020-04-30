const express = require("express");
const { check } = require("express-validator");

const usersControllers = require("../controllers/users-controller");
// const fileUpload = require("../middleware/file-upload"); //11-4

const router = express.Router();

router.get("/", usersControllers.getUsers);

//normilizeEmail() napravi sve u malim slovima
//check je iz expres-validatora
//fileUpload - image je ime propertisa na req.body na kojem ocekujem da ce mi biti poslana slika iz frontenda
router.post(
  "/signup",
  // fileUpload.single("image"),
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 5 }),
  ],
  usersControllers.signup
);

router.post("/login", usersControllers.login);

module.exports = router;
