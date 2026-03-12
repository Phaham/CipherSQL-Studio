const express = require("express");
const { getHint } = require("../controllers/hintController");

const router = express.Router();

// get hint from LLM - chatgpt/deepseek/claude
router.post("/", getHint);

module.exports = router;
