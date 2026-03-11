const mongoose = require("mongoose");

const ColumnSchema = new mongoose.Schema(
  {
    columnName: { type: String, required: true },
    dataType: {
      type: String,
      required: true,
      enum: ["INTEGER", "TEXT", "REAL", "BOOLEAN", "DATE", "TIMESTAMP", "NUMERIC", "VARCHAR"],
    },
  },
  { _id: false }
);

// Table Schema
const SampleTableSchema = new mongoose.Schema(
  {
    tableName: { type: String, required: true },
    columns: { type: [ColumnSchema], required: true },
    rows: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { _id: false }
);

// Expected Output Schema
const ExpectedOutputSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["table", "single_value", "column", "count", "row"],
    },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

// Assignment Schema
const AssignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: {
      type: String,
      required: true,
      enum: ["Easy", "Medium", "Hard"],
    },
    question: { type: String, required: true, trim: true },
    sampleTables: { type: [SampleTableSchema], required: true },
    expectedOutput: { type: ExpectedOutputSchema, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", AssignmentSchema);
