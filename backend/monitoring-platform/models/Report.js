const mongoose = require("mongoose");

const { Schema } = mongoose;

const ActRulesSchema = new Schema({
    data: { type: mongoose.Schema.Types.Mixed }
});

const WcagTechniquesSchema = new Schema({
    data: { type: mongoose.Schema.Types.Mixed }
});

const ReportSchema = new Schema({
    act: { type: Schema.Types.ObjectId, ref: 'ActRules' },
    wcag: { type: Schema.Types.ObjectId, ref: 'WcagTechniques' }
});

const ActRules = mongoose.model("ActRules", ActRulesSchema);
const WcagTechniques = mongoose.model("WcagTechniques", WcagTechniquesSchema);
const Report = mongoose.model("Report", ReportSchema);

module.exports = { ActRules, WcagTechniques, Report };
