const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define Schema
const UserSchema = new Schema(
  {
    firstname: { type: String },
    lastname: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
  },
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
const User = mongoose.model("User", UserSchema);
module.exports = User;
