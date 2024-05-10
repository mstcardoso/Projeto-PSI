const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const WebsitePageSchema = new Schema({
    url: { type: String, required: true },
    lastEvaluationDate: { type: Date},
    monitoringStatus: { type: String, required: true },
    errorsType: { type: Array, of: Boolean, required: false },
    commonErrors: { type: Map, of: String, required: false },
    report: { type: [Schema.Types.ObjectId], ref: "Report", required: true},
});

module.exports = mongoose.model("WebsitePage", WebsitePageSchema);