const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlenght: 4,
      maxlenght: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      minlenght: 6,
      maxlenght: 50,
    },
    password: {
      type: String,
      required: true,
      minlenght: 6,
      maxlenght: 100,
    },
    admin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
