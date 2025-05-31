
const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
})

module.exports = mongoose.model("Promotion", promotionSchema);