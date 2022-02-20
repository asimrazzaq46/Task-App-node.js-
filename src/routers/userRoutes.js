const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const { update } = require("../models/user");

const router = new express.Router();

const User = require("../models/user");
const authorize = require("../middlewares/auth");
const { sendWelcomEmail, sendCancellatioEmail } = require("../emails/account");

//create User
router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    sendWelcomEmail(user.email, user.name);
    const token = await user.getToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
  //   user
  //     .save()
  //     .then(() => res.status(201).send(user))
  //     .catch((err) => res.status(400).send(err));
});

//uploading profile images

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("please select an image"));
    }
    cb(undefined, true);
  },
});

router.post(
  "/users/me/avatar",
  authorize,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

//Get Profile image
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
});

//Delete profile image

router.delete(
  "/users/me/avatar",
  authorize,
  async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send(req.user);
  },
  (error, req, res, next) => {
    res.send({ error: error.message });
  }
);

// Login User
router.post("/users/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByCredentials(email, password);
    const token = await user.getToken();
    res.send({ user, token });
  } catch (error) {
    res.status(404).send(error);
  }
});

//Profile User
router.get("/users/me", authorize, async (req, res) => {
  res.send(req.user);
});

// Update User

router.put("/users/me", authorize, async (req, res) => {
  const updates = Object.keys(req.body);
  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.status(201).send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

//Delete User

router.delete("/users/me", authorize, async (req, res) => {
  try {
    await req.user.remove();

    sendCancellatioEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Logout User
router.post("/users/logout", authorize, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );

    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

//LogoutAll User

router.post("/users/logoutAll", authorize, async (req, res) => {
  try {
    req.user.tokens = [];
    req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
