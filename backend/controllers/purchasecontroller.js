const Ticket = require("../models/Ticket");
const Showtime = require("../models/Showtime");

exports.createPurchase = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.showtimeId).populate(
      "movie",
    );

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: "Showtime not found",
      });
    }

    const now = new Date();

    // Use whichever field your Showtime model has
    const showDate = new Date(showtime.showtime || showtime.startTime);

    if (showDate.getTime() - now.getTime() <= 30 * 60 * 1000) {
      return res.status(400).json({
        success: false,
        message: "Booking closes 30 minutes before showtime",
      });
    }

    const ticket = await Ticket.create({
      user: req.user.id,
      showtime: showtime._id,
      movie: showtime.movie?._id,
      showtimeTime: showDate,
      seats: req.body.seats || [],
      price: showtime.price || showtime.movie?.price || 0,
      status: "booked",
    });

    return res.status(201).json({
      success: true,
      data: ticket,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
