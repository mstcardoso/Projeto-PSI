const mongoose = require("mongoose");

const { Schema } = mongoose;

const ActRulesSchema = new Schema({
    data: { type: mongoose.Schema.Types.Mixed }
});

const WcagTechniquesSchema = new Schema({
    data: { type: mongoose.Schema.Types.Mixed }
});

const ReportSchema = new Schema({
    act_rules: { type: Schema.Types.ObjectId, ref: 'actRules' },
    wcag_techniques: { type: Schema.Types.ObjectId, ref: 'wcagTechniques' }
});

const ActRules = mongoose.model("ActRules", ActRulesSchema);
const WcagTechniques = mongoose.model("WcagTechniques", WcagTechniquesSchema);
const Report = mongoose.model("report", ReportSchema);

module.exports = { ActRules, WcagTechniques, Report };
