const jwt = require("jsonwebtoken");
const User = require("../models/User");
const UserProgress = require("../models/UserProgress");
const Assignment = require("../models/Assignment");

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function sendTokenCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,                                // JS can't access it
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,             // 7 days in ms
  });
}

// POST /api/auth/signup
async function signup(req, res, next) {
  const { firstName, lastName, email, mobileNo, password } = req.body;

  if (!firstName || !lastName || !email || !mobileNo || !password) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }
 
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already in use." });
    }

    const user = await User.create({ firstName, lastName, email, mobileNo, password });
    const token = generateToken(user._id);
    sendTokenCookie(res, token);

    res.status(201).json({
      success: true,
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, mobileNo: user.mobileNo },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = generateToken(user._id);
    sendTokenCookie(res, token);

    res.json({
      success: true,
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout
async function logout(req, res) {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out successfully." });
}

async function getMe (req, res, next) {
  try{
    res.json({
      success: true,
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
      }
    });
  } catch (err) {
    next(err);
  }
}


// GET /api/auth/profile  (protected)
async function getProfile(req, res, next) {
  try {
    // Fetch all assignments the user has solved
    const solvedProgress = await UserProgress.find({
      userId: req.user._id,
      isCompleted: true,
    }).populate("assignmentId", "title difficulty");

    const solvedAssignments = solvedProgress.map((p) => ({
      assignmentId: p.assignmentId._id,
      title: p.assignmentId.title,
      difficulty: p.assignmentId.difficulty,
      solvedAt: p.updatedAt,
    }));

    res.json({
      success: true,
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        mobileNo: req.user.mobileNo,
      },
      solvedAssignments,
      totalSolved: solvedAssignments.length,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login, logout, getMe, getProfile };