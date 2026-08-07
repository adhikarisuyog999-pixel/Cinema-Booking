const path = require("node:path");
const dns = require("node:dns");

dns.setServers(["192.168.100.1"]);

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
require("dotenv").config();
// console.log(process.env.DATABASE); // testing conn

const auth = require("./routes/auth");
const cinema = require("./routes/cinema");
const theater = require("./routes/theater");
const movie = require("./routes/movie");
const showtime = require("./routes/showtime");
const purchase = require("./routes/purchase");

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.DATABASE, { autoIndex: true })
  .then(() => {
    console.log("mongoose connected!");
  })
  .catch((err) => console.log(err));

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());

app.use(express.static(path.join(__dirname, "public")));
app.use("/auth", auth);
app.use("/cinema", cinema);
app.use("/theater", theater);
app.use("/movie", movie);
app.use("/showtime", showtime);
app.use("/purchase", purchase);

const port = process.env.PORT || 8080;

app.listen(port, () => console.log(`start server in port ${port}`));
