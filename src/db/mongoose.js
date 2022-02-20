const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "config/config.env" });

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
