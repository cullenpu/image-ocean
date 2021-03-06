const express = require("express");
const router = express.Router();

const { User } = require("../models/user");
const { isMongoError } = require("./utils");

// Check if a user is already logged in to this session
router.get("/check-session", (req, res) => {
  if (req.session.user) {
    res.send();
  } else {
    res.status(401).send();
  }
});

// Create a new user
router.post("/", async (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  try {
    // Save user
    const newUser = await user.save();
    res.status(201).send();
  } catch (err) {
    if (isMongoError(err)) {
      res.status(500).send("Internal server error");
    } else {
      console.log(err);
      res.status(400).send("Bad Request");
    }
  }
});

// User login
router.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const user = await User.findByUsernamePassword(username, password);
    req.session.user = user._id;
    res.send({ id: user._id });
  } catch (err) {
    res.status(400).send();
  }
});

// User logout
router.get("/logout", (req, res) => {
  // Remove the session
  req.session.destroy((err) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send();
    }
  });
});

module.exports = router;
