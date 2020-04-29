//12-7

const jwt = require("jsonwebtoken");
const HttpError = require("../model/http-error");

module.exports = (req, res, next) => {
  //OPTIONS req je nesto od browsera defaultno...to pustam automatski
  if (req.method === "OPTIONS") {
    return next();
  }

  // token ne moze biti u req.body zato stvo sve zasticene rute nemaju req.body
  //(npr. DELETE nema nikakav body, a mora biti authenticated)

  try {
    //try/catch radim zbog toga jer req mozda nema authorization na hedersima, pa da sprijecim app crash
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new HttpError("Authentication failed", 403);
    }

    //u jwt sam spremio userId i email...sada taj ID dodam na req
    const decodedToken = jwt.verify(token, "secret_dont_share");
    //sada svaki middleware poslije ovoga moze znati koji je UserId ... ko je poslao req
    req.userData = { userId: decodedToken.userId };

    next();
  } catch (err) {
    const error = new HttpError("Authentication failed #2", 401);
    return next(error);
  }
};
