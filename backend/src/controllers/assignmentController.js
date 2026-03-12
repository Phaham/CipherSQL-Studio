const Assignment = require("../models/Assignment");
const { buildSandbox } = require("../services/sandboxService");

async function listAssignments(req, res, next) {
  try {
    // send titles only using projection 1
    const assignments = await Assignment.find(
      {},
      { title: 1, description: 1, question: 1, createdAt: 1 }
    ).sort({ createdAt: -1 });

    res.json({ success: true, data: assignments });
  } catch (err) {
    next(err);
  }
}

async function getAssignment(req, res, next) {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found." });
    }

    // Build the sandbox
    const sandboxInfo = await buildSandbox(assignment);

    // send reponse without sending full expectedOutput, send expectedOut's type only
    const responseData = {
      _id: assignment._id,
      title: assignment.title,
      description: assignment.description,
      question: assignment.question,
      sampleTables: assignment.sampleTables,
      createdAt: assignment.createdAt,
      // Expose expected output type for frontEnd
      expectedOutputType: assignment.expectedOutput.type,
    };

    res.json({
      success: true,
      data: responseData,
      sandbox: sandboxInfo,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listAssignments, getAssignment };