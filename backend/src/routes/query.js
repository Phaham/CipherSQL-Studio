const express = require("express");
const { runQuery } = require("../controllers/queryController");
const protect = require("../middleware/protect");

const router = express.Router();

// POST /api/query/run - Execute user SQL in sandbox
router.post("/run", protect, runQuery);

module.exports = router;
