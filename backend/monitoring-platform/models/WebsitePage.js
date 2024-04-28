const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const WebsitePageSchema = new Schema({
    url: { type: String, required: true },
    lastEvaluationDate: { type: Date},
    monitoringStatus: { type: String, required: true },
});

module.exports = mongoose.model("WebsitePage", WebsitePageSchema);