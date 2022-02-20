const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Tasks = require("../models/task");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: [6, "must be atleast 6 letters long."],
      max: 18,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("you can't put password as a password");
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Age must be a positive number.");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

// Creating virtual relation between user and tasks

userSchema.virtual("tasks", {
  ref: "Tasks",
  localField: "_id",
  foreignField: "owner",
});

// Hiding passwords , tokens and avatars
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
};

//creating json web token for authorizations
userSchema.methods.getToken = async function () {
  const user = this;
  const token = await jwt.sign(
    { _id: user._id.toString() },
    process.env.JWT_SECRET,
    {
      expiresIn: "7 days",
    }
  );

  user.tokens = user.tokens.concat({ token });
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  await user.save();
  return token;
};

//comparing password for login
userSchema.statics.findByCredentials = async function (email, password) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("email or password is invalid!");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("email or password is invalid!");
  }
  return user;
};

//hashing and salting passwords
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

//Deleting all task while deleting the user
userSchema.pre("remove", async function (next) {
  const user = this;
  await Tasks.deleteMany({ owner: user._id });
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
