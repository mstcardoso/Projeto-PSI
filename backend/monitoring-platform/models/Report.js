const mongoose = require("mongoose");

const { Schema } = mongoose;

const AssertionMetadataSchema = new Schema({
    description: String,
    failed: Number,
    inapplicable: Number,
    outcome: String,
    passed: Number,
    success_criteria_level: [String],
    target_element: [String],
    name: String,
    result: {
        verdict: String, 
        resultCode: String,
        elements: [Number]
    } 
});

const AssertionSchema = new Schema({
    code: String,
    description: String,
    mapping: String,
    metadata: AssertionMetadataSchema
});

const ModuleSchema = new Schema({
    metadata: {
        failed: {
            type: Number,
            default: 0
        },
        inapplicable: {
            type: Number,
            default: 0
        },
        passed: {
            type: Number,
            default: 0
        },
        warning: {
            type: Number,
            default: 0
        }
    },
    assertions: {
        type: [AssertionSchema]
    }
});

const ReportSchema = new Schema({
    metadata: {
        failed: {
            type: Number,
            default: 0
        },
        inapplicable: {
            type: Number,
            default: 0
        },
        passed: {
            type: Number,
            default: 0
        },
        warning: {
            type: Number,
            default: 0
        }
    },
    modules: {
        act_rules: ModuleSchema,
        best_practices: ModuleSchema,
        wcag_techniques: ModuleSchema
    }
});