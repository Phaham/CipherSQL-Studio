const Assignment = require("../models/Assignment");
const { generateHint } = require("../services/hintService");

async function getHint(req, res, next) {
  const { assignmentId, currentQuery } = req.body;

  if (!assignmentId) {
    return res.status(400).json({ success: false, message: "assignmentId is required." });
  }

  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found." });
    }

    const hint = await generateHint(assignment, currentQuery || null);

    return res.json({ success: true, hint });
  } catch (err) {
    if (err.message.includes("LLM API error") || err.message.includes("API key")) {
      return res.status(503).json({
        success: false,
        message: "Hint service is temporarily unavailable. Please try again later.",
      });
    }
    next(err);
  }
}

module.exports = { getHint };