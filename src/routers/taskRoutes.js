const express = require("express");

const router = new express.Router();

const Tasks = require("../models/task");
const authorize = require("../middlewares/auth");

//Create Task
router.post("/tasks", authorize, async (req, res) => {
  const task = new Tasks({ ...req.body, owner: req.user._id });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

//Get All tasks
router.get("/tasks", authorize, async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  if (req.query.sortby) {
    const parts = req.query.sortby.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }

  try {
    // const tasks = await Tasks.find({ owner: req.user._id });
    await req.user.populate({
      path: "tasks",
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
      },
    });
    res.send(req.user.tasks);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

//Get One task
router.get("/tasks/:id", authorize, async (req, res) => {
  try {
    const tasks = await Tasks.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!tasks) {
      return res.status(400).send();
    }
    res.send(tasks);
  } catch (err) {
    res.status(400).send();
  }
});

// Update Task

router.put("/tasks/:id", authorize, async (req, res) => {
  const updates = Object.keys(req.body);
  try {
    const task = await Tasks.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send();
    }
    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

//Delete task
router.delete("/tasks/:id", authorize, async (req, res) => {
  try {
    const task = await Tasks.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(400).send();
    }
    await task.remove();
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
