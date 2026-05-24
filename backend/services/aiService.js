const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const generateExplanation = async (abstract) => {
    const prompt = `Explain the following research paper abstract simply for a beginner. Provide your answer strictly formatted in Markdown.
Include these sections:
## Problem Statement
## Core Idea
## Method (step-by-step simple)
## Results
## Limitations
## Difficulty Level
## Real-world Applications

Abstract: ${abstract}`;

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
    });
    
    return response.choices[0].message.content;
};

const generateNextSteps = async (abstract) => {
    const prompt = `Based on this research abstract, provide research guidance formatted strictly as Markdown.
Include these sections:
## Related Topics (3)
## Improvement Ideas (3)
## Research Gaps (2)
## Mini Project Ideas (2)
## Advanced Research Idea (1)

Abstract: ${abstract}`;

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
    });
    
    return response.choices[0].message.content;
};

const generateImplementation = async (abstract) => {
    const prompt = `Convert this research idea into a practical implementation plan formatted strictly as Markdown. Provide:
## Step-by-step Implementation Guide
## Tools & Technologies Required
## Dataset Requirements
## Estimated Time
## Expected Output
## Challenges

Abstract: ${abstract}`;

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
    });
    
    return response.choices[0].message.content;
};

const generateGapAnalysis = async (content) => {
    const prompt = `Analyze this research content and find research gaps. Output formatted strictly as Markdown:
## Existing Work Summary
## Limitations
## Research Gaps
## Future Directions

Content: ${content}`;

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
    });
    
    return response.choices[0].message.content;
};

const generateWritingAssist = async (type, content) => {
    let prompt = `Act as an academic writing assistant. Improve or generate content based on the following input.\n\nType: ${type}\n\nInput Content: ${content}`;
    
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: "You are an expert academic writing assistant. Produce high quality, properly formatted text." }, { role: "user", content: prompt }],
        temperature: 0.7,
    });
    
    return response.choices[0].message.content;
};

module.exports = {
    generateExplanation,
    generateNextSteps,
    generateImplementation,
    generateGapAnalysis,
    generateWritingAssist
};
