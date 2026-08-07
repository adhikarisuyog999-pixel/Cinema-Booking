const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    length: Number,
    img: String,
    poster: String,
    price: Number,
    language: String,
    description: String,
  },
  { timestamps: true },
);

module.exports = mongoose.models.Movie || mongoose.model("Movie", movieSchema);
