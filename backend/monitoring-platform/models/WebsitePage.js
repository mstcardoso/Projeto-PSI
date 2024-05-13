const Report = require("./Report");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const WebsitePageSchema = new Schema({
    url: { type: String, required: true },
    lastEvaluationDate: { type: Date},
    monitoringStatus: { type: String, required: true },
    errorTypes: { type: [Boolean], required: false },
    commonErrors: { type: [String], required: false },
    report: { type: Schema.Types.ObjectId, ref: "report"},
});

const WebsitePage = mongoose.model('websitePage', WebsitePageSchema);
module.exports = WebsitePage;