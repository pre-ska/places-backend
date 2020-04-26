const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

//radi warning...zbog unique
mongoose.set("useCreateIndex", true);

const Schema = mongoose.Schema;

//unique takodjer ubrzava pretragu jer je indexiran
// unique ne validira dali je email jedinstven
//za to moram koristiti mongoose unique validator
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minLength: 6 },
  image: { type: String, required: true },
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: "Place" }],
});

// dodam uniqueValidator koji ce polja sa unique provjeriti
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
