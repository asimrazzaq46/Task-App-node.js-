//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

const express = require("express");
const dotenv = require("dotenv");
require("./db/mongoose");

const userRouter = require("./routers/userRoutes");
const tasksRouter = require("./routers/taskRoutes");
const { ObjectID } = require("bson");

const app = express();
dotenv.config({ path: "config/config.env" });
const port = process.env.PORT || 300;

app.use(express.json());

app.use(userRouter);
app.use(tasksRouter);

///////////////////////// TASKS ////////////////////////////

app.listen(port, () => {
  console.log(`App is running on PORT ${port}`);
});
