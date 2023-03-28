const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define Schema
const PlayerSchema = new Schema(
  {
    firstname: { type: String },
    lastname: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    age: { type: Number, default: null },
    size: { type: Number, default: null },
    weight: { type: Number, default: null },
    position: { type: String, default: null },
    experience: { type: Number, default: null },
    description: { type: String, default: null },
    sport_id: { type: Number, default: null },
    club_id: { type: Number, default: null },
    address_id: { type: Number, default: null },
    token: String,
  },
  { timestamps: true },
  { versionKey: false }
);

// userSchema.set("toJSON", {
//   transform: (document, returnedObject) => {
//     returnedObject.id = returnedObject._id.toString();
//     delete returnedObject._id;
//     delete returnedObject.__v;
//   },
// });

// Export model
const Player = mongoose.model("Player", PlayerSchema);
module.exports = Player;
