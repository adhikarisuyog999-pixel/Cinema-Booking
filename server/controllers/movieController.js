const Movie = require("../models/Movie");
const Showtime = require("../models/Showtime");
const Ticket = require("../models/Ticket");

// @desc    Get all movies
// @route   GET /movie
// @access  Public
exports.getAll = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Alias (for compatibility)
exports.getMovies = exports.getAll;

// @desc    Get single movie
// @route   GET /movie/:id
// @access  Public
exports.getMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Create movie
// @route   POST /movie
// @access  Private
exports.createMovie = async (req, res) => {
  try {
    const movie = await Movie.create({
      name: req.body.name,
      length: req.body.length,
      img: req.body.img,
      poster: req.body.poster,
      price: req.body.price,
      language: req.body.language,
      description: req.body.description,
    });

    res.status(201).json({
      success: true,
      data: movie,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Alias
exports.addMovie = exports.createMovie;

// @desc    Update movie
// @route   PUT /movie/:id
// @access  Private
exports.updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Delete movie
// @route   DELETE /movie/:id
// @access  Private
exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    await movie.deleteOne();

    res.status(200).json({
      success: true,
      message: "Movie deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Get showing movies
// @route   GET /movie/showing
// @access  Public
exports.getShowingMovies = async (req, res) => {
  try {
    const showtimes = await Showtime.find({
      showtime: { $gte: new Date() },
      isRelease: true,
    }).populate("movie");

    res.status(200).json({
      success: true,
      data: showtimes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Get unreleased showing movies
// @route   GET /movie/unreleased/showing
// @access  Private
exports.getUnreleasedShowingMovies = async (req, res) => {
  try {
    const showtimes = await Showtime.find({
      isRelease: false,
    }).populate("movie");

    res.status(200).json({
      success: true,
      data: showtimes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Purchase ticket
// @route   POST /movie/purchase/:showtimeId
// @access  Private
exports.purchaseTicket = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.showtimeId);

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: "Showtime not found",
      });
    }

    const ticket = await Ticket.create({
      user: req.user.id,
      showtime: showtime._id,
      price: showtime.price || 0,
      status: "booked",
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    res.status(201).json({
      success: true,
      data: ticket,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
