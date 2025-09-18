console.log("Test Extension Loaded Successfully!");
SillyTavern.getContext().registerFunctionTool({
    name: 'test_func',
    description: 'A test function.',
    parameters: {
        type: 'object',
        properties: {},
        required: []
    },
    callback: async (args) => {
        console.log("Test function called!");
        return "Test function executed.";
    }
});
