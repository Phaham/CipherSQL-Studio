const express = require("express");
const { signup, login, logout, getProfile, getMe } = require("../controllers/authController");
const protect = require("../middleware/protect");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.get("/profile", protect, getProfile); // protected route

module.exports = router;