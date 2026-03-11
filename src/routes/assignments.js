const express = require("express");
const { listAssignments, getAssignment } = require("../controllers/assignmentController");

const router = express.Router();

// GET /api/assignments - List all assignments
router.get("/", listAssignments);

// GET /api/assignments/:id  -  Load particular assignment + build sandbox
router.get("/:id", getAssignment);

module.exports = router;