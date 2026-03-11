const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

function buildPrompt(assignment, userQuery) {
  const tableDescriptions = assignment.sampleTables;

  // If there are many rows in assignment then send column name and it's data tyype only
  // as LLM doesn't require rows to generate a hint

  // const tableDescriptions = assignment.sampleTables
  //   .map((t) => {
  //     const cols = t.columns.map((c) => `${c.columnName} (${c.dataType})`).join(", ");
  //     return `Table "${t.tableName}": columns → ${cols}`;
  //   })
  //   .join("\n");

  const userQueryPart = userQuery
    ? `The student's current attempt:\n${userQuery}`
    : "The student has not written a query yet.";

  return `You are a SQL tutor for beginners. Your ONLY job is to give a short, helpful HINT.

Rules to be folllowed in hint generation:
1. NEVER provide or suggest the complete SQL query answer.
2. NEVER write any SQL that, if copied directly, solves the question.
3. NEVER reveal what the expected output looks like.
4. Hints must be conceptual: mention the right SQL clause, function, or strategy to think about.
5. Keep your response to 2-4 sentences maximum.
6. Write in a friendly, encouraging tone.

Assignment question: "${assignment.question}"

Available tables:
${tableDescriptions}

${userQueryPart}

Give a concise hint that helps the student think in the right direction WITHOUT giving away the answer.`;
}

/**
 * Generate a hint using OpenAI's chat completions API.
 *
 * @param {Object} assignment - Mongoose Assignment document
 * @param {string|null} userQuery - The student's current SQL attempt (optional)
 * @returns {Promise<string>} The hint text
 */
async function generateHint(assignment, userQuery = null) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("LLM API key not configured. Please set correct API_KEY in your environment.");
  }

  const prompt = buildPrompt(assignment, userQuery);

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful SQL tutor. You give hints, never full solutions. Be concise and encouraging.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 200,
      temperature: 0.5,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`LLM API error (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  const hint = data.choices?.[0]?.message?.content?.trim();

  if (!hint) {
    throw new Error("LLM returned an empty response.");
  }

  return hint;
}

module.exports = { generateHint };
