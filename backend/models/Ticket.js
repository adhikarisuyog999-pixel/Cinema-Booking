const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    showtime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Showtime",
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
    },
    status: {
      type: String,
      default: "booked",
    },
    showtimeTime: {
      type: Date,
    },
    bookedAt: {
      type: Date,
      default: Date.now,
    },
    price: {
      type: Number,
      default: 0,
    },
    seats: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);
