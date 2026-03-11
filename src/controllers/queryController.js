const Assignment = require("../models/Assignment");
const UserProgress = require("../../Extras/UserProgress");
const { executeQuery } = require("../services/sandboxService");
const { compareResults } = require("../services/resultComparator");

async function runQuery(req, res, next) {
  const { assignmentId, sql, userId } = req.body;

  if (!assignmentId || !sql) {
    return res.status(400).json({
      success: false,
      message: "assignmentId and sql are required.",
    });
  }

  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found." });
    }

    let queryResult;
    try {
      const cleanSql = sql.trim().replace(/;+$/, ""); // remove trailing semicolons
      queryResult = await executeQuery(assignmentId, cleanSql);
    } catch (queryErr) {
      const errorType = queryErr.type || "SQL_ERROR";
      return res.status(200).json({
        success: false,
        error: {
          type: errorType,
          message: queryErr.message,
          // detail: queryErr.detail || null,
          // hint: queryErr.hint || null,
          // position: queryErr.position || null,
        },
        result: null,
        verdict: null,
      });
    }

    // 3. Compare result
    const verdict = compareResults(queryResult, assignment.expectedOutput);

    // 4. Persist progress -
    // if (userId) {
    //   await UserProgress.findOneAndUpdate(
    //     { userId, assignmentId },
    //     {
    //       $set: {
    //         sqlQuery: sql,
    //         lastAttempt: new Date(),
    //         isCompleted: verdict.correct,
    //       },
    //       $inc: { attemptCount: 1 },
    //     },
    //     { upsert: true, new: true }
    //   );
    // }

    return res.json({
      success: true,
      result: {
        rows: queryResult.rows,
        fields: queryResult.fields,
        rowCount: queryResult.rowCount,
        truncated: queryResult.truncated,
      },
      verdict: {
        correct: verdict.correct,
        message: verdict.message,
        queryOutput: verdict.queryOutput,
        expectedOutput: verdict.expectedOutput,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { runQuery };
