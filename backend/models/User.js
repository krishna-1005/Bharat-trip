const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

console.log("User model loaded v2");

const userSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: false,
    select: false
  },

  /* IMPORTANT FIX */
  firebaseUid: {
    type: String,
    required: false,
    default: null
  },

  /* NOTIFICATION SETTINGS */
  preferences: {
    emailAlerts: { type: Boolean, default: true },
    tripReminders: { type: Boolean, default: true },
    promoOffers: { type: Boolean, default: false }
  }

},
{ timestamps: true }
);

/* Hash password */
userSchema.pre("save", async function(){

  if(!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

});

/* Compare password */
userSchema.methods.comparePassword = async function(password){
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);