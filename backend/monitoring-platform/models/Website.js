const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const WebsiteSchema = new Schema({
    url: { type: String, required: true },
    monitoringStatus: { type: String, required: true },
    registrationDate: { type: Date, required: true },
    lastEvaluationDate: { type: Date},
    pages: { type: [Schema.Types.ObjectId], ref: "WebsitePage", required: true},
    commonErrors: { type: Map, of: String, required: false },   
});

module.exports = mongoose.model("Website", WebsiteSchema);