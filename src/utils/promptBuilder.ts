import { PromptConfig, FlashcardPromptConfig } from '../types/mcq';

export const DEFAULT_PROMPT_CONFIG: PromptConfig = {
  questionCount: 10,
  difficulty: 'Balanced',
  archetype: 'Conceptual & Theory',
  academicLevel: 'Undergraduate',
  explanationDepth: 'Didactic (Every option analyzed)',
  language: 'English',
  customDirectives: '',
  selfContainedQuestions: true,
  exhaustiveTheory: true,
  preventTopicDuplicates: true,
  strictPdfScopeOnly: true,
};

export const DEFAULT_FLASHCARD_CONFIG: FlashcardPromptConfig = {
  cardCount: 'auto',
  difficulty: 'Balanced',
  academicLevel: 'Undergraduate',
  theoryDepth: 'Comprehensive & Multi-Part Concepts',
  language: 'English',
  customDirectives: '',
  exhaustiveTheory: true,
  preventTopicDuplicates: true,
  strictPdfScopeOnly: true,
  onlyTheoryNotes: true,
};

export function buildAntigravityPrompt(config: PromptConfig): string {
  const directivesSection = config.customDirectives.trim()
    ? `\n### Focus Areas & Specific Constraints:\n${config.customDirectives.trim()}\n`
    : '';

  const selfContainedRule = config.selfContainedQuestions !== false
    ? `\n- **Autonomous & Self-Contained Stems (CRITICAL INVARIANT)**: The question stem MUST provide all necessary context, premises, definitions, or scenario parameters directly within itself so the learner can answer without needing external page/slide numbers. NEVER write "According to slide 14...", "As seen on page 5...", "In figure 3.2 on slide X...", "Look at slide Y", or "From paragraph 2...". Embed all required premises directly into the question text.`
    : '';

  const scopeRule = config.strictPdfScopeOnly !== false
    ? `\n- **Strict PDF Scope Invariant**: All questions, distractors, and explanations MUST be derived strictly and exclusively from the theory taught in the provided PDF. Do NOT introduce outside facts, extraneous trivia, or speculative extrapolations beyond the scope of this text.`
    : '';

  const nonDuplicationRule = config.preventTopicDuplicates !== false
    ? `\n- **Strict Topic Diversity & Zero Duplication**: Every single question MUST test a distinct theory element, principle, or mechanism. Do NOT duplicate or generate multiple questions on the same narrow theory topic twice.`
    : '';

  const exhaustiveRule = config.exhaustiveTheory !== false
    ? `\n- **Exhaustive Theory Extraction**: Extract as many core theoretical elements across the entire document as possible, maximizing pedagogical coverage across all sections.`
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

### Crucial Pedagogical & Formatting Rules:${selfContainedRule}${scopeRule}${nonDuplicationRule}${exhaustiveRule}
- Return **ONLY valid, parseable JSON** inside a single markdown code block (\`\`\`json ... \`\`\`).
- Do NOT output conversational preamble, disclaimers, or postscript.
- Ensure all quotes and special characters are properly escaped.
- Each question MUST have exactly one unambiguous correct answer, specified as a 0-indexed integer in \`correct_answer\`.
- All distractors must be plausible and intellectually engaging.

### Output JSON Schema:
\`\`\`json
{
  "title": "Short Descriptive Title of Document/Topic",
  "deck_type": "mcq",
  "description": "Comprehensive MCQ test set extracted from the provided PDF",
  "metadata": {
    "difficulty": "${config.difficulty}",
    "total_questions": ${config.questionCount},
    "target_audience": "${config.academicLevel}"
  },
  "questions": [
    {
      "id": 1,
      "question": "Clear, precise, self-contained question stem?",
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

export function buildFlashcardPrompt(config: FlashcardPromptConfig): string {
  const directivesSection = config.customDirectives.trim()
    ? `\n### Focus Areas & Specific Constraints:\n${config.customDirectives.trim()}\n`
    : '';

  const scopeRule = config.strictPdfScopeOnly !== false
    ? `\n- **Strict PDF Scope Invariant**: Every flashcard front and back MUST be strictly and exclusively bounded to the theory presented within this specific PDF document. Do not hallucinate external theory or unmentioned concepts.`
    : '';

  const nonDuplicationRule = config.preventTopicDuplicates !== false
    ? `\n- **Strict Topic Diversity & Zero Duplication**: Every flashcard MUST test a distinct theory element or mechanism. Do NOT duplicate or generate multiple flashcards testing the same theory topic twice.`
    : '';

  const exhaustiveRule = config.exhaustiveTheory !== false
    ? `\n- **Exhaustive Theory Extraction**: Extract as many core theoretical elements, definitions, and mechanisms from across the entire PDF as possible to achieve comprehensive mastery.`
    : '';

  const theoryNotesRule = config.onlyTheoryNotes !== false
    ? `\n- **Strict Theory-Only Extraction from Notes (CRITICAL INVARIANT)**: Generate flashcards ONLY from theoretical concepts, principles, axioms, architectural models, mechanisms, conditions, laws, and definitions presented in the study notes.
  * DO NOT generate flashcards for homework exercises, assignment instructions, laboratory setup, syllabus announcements, administrative slide notes, or numerical calculation steps.
  * Every card must test a foundational piece of theoretical knowledge suitable for active recall and conceptual memorization.`
    : '';

  const totalCardsRequirement = config.cardCount === 'auto'
    ? `1. **Total Flashcards (DYNAMIC & AI-DETERMINED)**:
   - Do NOT restrict generation to a fixed or arbitrary number.
   - Autonomously analyze the depth, density, and breadth of the provided study notes / PDF document.
   - Generate as many high-yield flashcards as there are distinct theoretical concepts, axioms, laws, definitions, mechanisms, and rules in the text.
   - Let the document's theoretical volume dictate the exact card count so that 100% of the theory is captured without omissions or artificial filler.`
    : `1. **Total Flashcards**: Exactly ${config.cardCount} high-yield theory flashcards.`;

  return `You are an expert cognitive scientist and pedagogy specialist. Analyze the provided PDF document / study material and generate a high-yield set of Theory Flashcards focused purely on memorizing core concepts, definitions, mechanisms, and theoretical rules.

### Generation Requirements:
${totalCardsRequirement}
2. **Theory Focus**: Extract ONLY fundamental theory parts (definitions, axioms, mechanisms, conditions, laws, taxonomies). Avoid trivial factoids, procedural logistics, or numerical exercises.
3. **Target Academic Level**: ${config.academicLevel}.
4. **Theory Depth**: ${config.theoryDepth}.
5. **Self-Contained Concepts**: Front prompts must never reference external slide/page numbers (e.g. NEVER "Look at slide X"). State the concept or theoretical question directly.
6. **Multi-Answer Itemization (CRITICAL RULE)**:
   - When a concept has multiple distinct components, conditions, rules, or steps (e.g. Coffman conditions, ACID properties, OSI layers, design tenets), you MUST supply them as a JSON array of strings in "back" rather than one big single sentence list.
   - For single-definition cards, "back" can be a single string or 1-element array.
7. **Language**: ${config.language}.${directivesSection}

### Crucial Pedagogical & Formatting Rules:${theoryNotesRule}${scopeRule}${nonDuplicationRule}${exhaustiveRule}
- Return **ONLY valid, parseable JSON** inside a single markdown code block (\`\`\`json ... \`\`\`).
- Do NOT output conversational preamble, disclaimers, or postscript.
- Set \`"deck_type": "flashcard"\` at the root.
- Set \`"total_cards"\` in metadata to the exact total number of flashcards generated.
- Ensure all quotes, LaTeX symbols, and special characters are properly escaped.

### Output JSON Schema:
\`\`\`json
{
  "title": "Short Descriptive Title of Theory Topic",
  "deck_type": "flashcard",
  "description": "High-yield theory flashcards for core definitions and mechanisms",
  "metadata": {
    "difficulty": "${config.difficulty}",
    "total_cards": ${config.cardCount === 'auto' ? '<exact_number_generated>' : config.cardCount},
    "target_audience": "${config.academicLevel}"
  },
  "cards": [
    {
      "id": 1,
      "front": "What are the four necessary Coffman conditions required for a deadlock to occur?",
      "back": [
        "Mutual Exclusion: At least one resource must be held in a non-shareable mode.",
        "Hold and Wait: A process holds resources while waiting for additional allocations.",
        "No Preemption: Resources cannot be forcibly expropriated from a process.",
        "Circular Wait: A closed loop of processes exists where each process waits for a resource held by the next."
      ],
      "explanation": "If any single one of these four conditions is eliminated, deadlock is mathematically prevented.",
      "topic": "Concurrency & Deadlocks",
      "difficulty": "medium",
      "tags": ["Operating Systems", "Deadlock"]
    },
    {
      "id": 2,
      "front": "Define the Principle of Locality in memory hierarchies.",
      "back": "Programs tend to reuse data and instructions they have used recently (temporal locality) or access memory locations near those recently accessed (spatial locality).",
      "explanation": "Hardware caches (L1/L2/L3, TLB) rely on this empirical principle to achieve high effective hit rates.",
      "topic": "Memory Systems",
      "difficulty": "easy",
      "tags": ["Architecture", "Cache"]
    }
  ]
}
\`\`\`

Analyze the attached/provided PDF document and output the Flashcard JSON matching this exact structure now:`;
}

