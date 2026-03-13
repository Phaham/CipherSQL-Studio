// resultComparator - Compares a user's query result against the assignment's expectedOutput.
/*
 * Expected output types (from MongoDB schema):
 *   table        → array of row objects (order-insensitive comparison)
 *   single_value → a scalar (number, string, etc.)
 *   column       → array of scalar values (order-insensitive)
 *   count        → a number
 *   row          → a single row object
 */

/**
 * Normalise a value for loose comparison:
 *  - Trim strings
 *  - Coerce numeric strings to numbers
*/

// "9000" -> 9000
function normalize(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === "string") {
    const trimmed = val.trim();
    const asNum = Number(trimmed);
    return !isNaN(asNum) && trimmed !== "" ? asNum : trimmed.toLowerCase();
  }
  if (typeof val === "number") return val;
  return val;
}

// {Name: "Phaham"} -> {name: "Phaham"}
function normalizeRow(row) {
  const result = {};
  for (const key of Object.keys(row)) {
    result[key.toLowerCase()] = normalize(row[key]);
  }
  return result;
}


function compareResults(queryResult, expectedOutput) {
  const { rows } = queryResult;
  const { value } = expectedOutput;

  // Normalize both sides for fair comparison
  const normalizedRows = rows.map(normalizeRow);
  const normalizedExpected = Array.isArray(value) ? value.map(normalizeRow) : normalizeRow(value);

  // Sort both so row order doesn't matter
  // const sortedRows = normalizedRows.map(rowToSortKey).sort();
  // const sortedExpected = (Array.isArray(normalizedExpected) ? normalizedExpected : [normalizedExpected])
  //   .map(rowToSortKey)
  //   .sort();
  const sortedRows = normalizedRows.sort();
  const sortedExpected = (Array.isArray(normalizedExpected) ? normalizedExpected : [normalizedExpected]).sort();

  const correct = JSON.stringify(sortedRows) === JSON.stringify(sortedExpected);

  return {
    correct,
    queryOutput: rows,
    expectedOutput: value,
  };
}

module.exports = { compareResults }