export interface AssertionMetadata {
    description: String,
    failed: Number,
    inapplicable: Number,
    outcome: String,
    passed: Number,
    success_criteria_level: String[],
    target_element: String[],
    name: String,
    result: {
        verdict: String, 
        resultCode: String,
        elements: [Number]
    } 
}

export interface Assertion{
    code: String,
    description: String,
    mapping: String,
    metadata: AssertionMetadata
}

export interface Module{
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
        type: [Assertion]
    }
}

export interface Report {
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
        act_rules: Module,
        best_practices: Module,
        wcag_techniques: Module
    }
}