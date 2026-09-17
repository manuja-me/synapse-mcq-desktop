import { PromptConfig } from '../types/mcq';

export const DEFAULT_PROMPT_CONFIG: PromptConfig = {
  questionCount: 10,
  difficulty: 'Balanced',
  archetype: 'Conceptual & Theory',
  academicLevel: 'Undergraduate',
  explanationDepth: 'Didactic (Every option analyzed)',
  language: 'English',
  customDirectives: '',
};

export function buildAntigravityPrompt(config: PromptConfig): string {
  const directivesSection = config.customDirectives.trim()
    ? `\n### Focus Areas & Specific Constraints:\n${config.customDirectives.trim()}\n`
    : '';

  return `You are an expert examiner and pedagogy specialist. Analyze the provided PDF document / study material and generate a rigorous set of Multiple Choice Questions (MCQs) strictly conforming to the JSON specification below.

### Generation Requirements:
1. **Total Questions**: Exactly ${config.questionCount} high-quality MCQs.
2. **Difficulty Target**: ${config.difficulty}.
3. **Question Archetype**: ${config.archetype}. Ensure the questions test genuine comprehension, deductive reasoning, and key principles from the text.
4. **Target Academic Level**: ${config.academicLevel}.
5. **Explanation Depth**: ${config.explanationDepth}.
   - In \`explanation\`, clearly state why the correct answer is valid.
   - In \`distractor_explanations\`, provide a dedicated 1-2 sentence breakdown for each distractor explaining specifically why it is incorrect or misleading.
6. **Language**: ${config.language}.${directivesSection}

### Crucial Formatting Rules:
- Return **ONLY valid, parseable JSON** inside a single markdown code block (\`\`\`json ... \`\`\`).
- Do NOT output conversational preamble, disclaimers, or postscript.
- Ensure all quotes and special characters are properly escaped.
- Each question MUST have exactly one unambiguous correct answer, specified as a 0-indexed integer in \`correct_answer\`.
- All distractors must be plausible and intellectually engaging.

### Output JSON Schema:
\`\`\`json
{
  "title": "Short Descriptive Title of Document/Topic",
  "description": "Comprehensive MCQ test set extracted from the provided PDF",
  "metadata": {
    "difficulty": "${config.difficulty}",
    "total_questions": ${config.questionCount},
    "target_audience": "${config.academicLevel}"
  },
  "questions": [
    {
      "id": 1,
      "question": "Clear, precise question stem?",
      "options": [
        "First option",
        "Second option",
        "Third option",
        "Fourth option"
      ],
      "correct_answer": 0,
      "explanation": "Detailed explanation of why this option is correct.",
      "distractor_explanations": [
        "Correct answer.",
        "Why the second option is incorrect based on the text.",
        "Why the third option is incorrect based on the text.",
        "Why the fourth option is incorrect based on the text."
      ],
      "topic": "Specific Sub-Topic or Chapter",
      "difficulty": "medium",
      "tags": ["Key Concept", "Chapter Name"]
    }
  ]
}
\`\`\`

Analyze the attached/provided PDF document and output the JSON matching this exact structure now:`;
}
