const express = require("express");
const { signup, login, logout, getProfile } = require("../controllers/authController");
const protect = require("../middleware/protect");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/profile", protect, getProfile); // protected route

module.exports = router;