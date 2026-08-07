const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

mongoose
  .connect(process.env.DATABASE)
  .then(async () => {
    const admin = await User.create({
      username: "admin",
      email: "admin@example.com",
      password: "YourSecurePassword",
      role: "admin",
    });
    console.log(admin);
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
