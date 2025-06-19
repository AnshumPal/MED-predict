const mongoose = require("mongoose");

const PredictionSchema = new mongoose.Schema({
  age: { type: Number, required: true },
  bmi: { type: Number, required: true },
  children: { type: Number, required: true },
  sex: { type: String, required: true },  // "male" or "female"
  smoker: { type: Boolean, required: true },  // true or false
  region_southwest: { type: Number, required: true },
  region_northwest: { type: Number, required: true },
  region_southeast: { type: Number, required: true },
  predicted_cost: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Prediction", PredictionSchema);
