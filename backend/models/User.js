// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true, trim: true },
//     email: { type: String, required: true, unique: true, lowercase: true, trim: true },
//     password: { type: String, required: false, minlength: 6, select: false },
//     bio: { type: String, default: "Adventure seeker & digital nomad" },
//     savedPlaces: [
//       {
//         name: String,
//         tag: String,
//         img: String,
//       }
//     ],
//   },
//   { timestamps: true }
// );

// userSchema.pre("save", async function () {

//   if (!this.isModified("password")) return;

//   this.password = await bcrypt.hash(this.password, 12);

// });

// userSchema.methods.comparePassword = async function (candidate) {
//   return bcrypt.compare(candidate, this.password);
// };

// userSchema.methods.toJSON = function () {
//   const obj = this.toObject();
//   delete obj.password;
//   return obj;
// };

// module.exports = mongoose.model("User", userSchema);


const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  firebaseUid: {
    type: String,
    required: true
  },
  photo: String,
  savedPlaces: []
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);