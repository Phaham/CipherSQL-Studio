const express = require("express");
const { runQuery } = require("../controllers/queryController");

const router = express.Router();

// POST /api/query/run - Execute user SQL in sandbox
router.post("/run", runQuery);

module.exports = router;
