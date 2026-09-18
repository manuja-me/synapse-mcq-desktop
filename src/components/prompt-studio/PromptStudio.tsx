import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  FileText,
  HelpCircle,
  Layers,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Code
} from 'lucide-react';
import { PromptConfig, FlashcardPromptConfig } from '../../types/mcq';
import {
  DEFAULT_PROMPT_CONFIG,
  DEFAULT_FLASHCARD_CONFIG,
  buildAntigravityPrompt,
  buildFlashcardPrompt
} from '../../utils/promptBuilder';

interface PromptStudioProps {
  onGoToIngestion: () => void;
}

export const PromptStudio: React.FC<PromptStudioProps> = ({ onGoToIngestion }) => {
  const [activeMode, setActiveMode] = useState<'mcq' | 'flashcard'>('mcq');
  const [mcqConfig, setMcqConfig] = useState<PromptConfig>(DEFAULT_PROMPT_CONFIG);
  const [flashcardConfig, setFlashcardConfig] = useState<FlashcardPromptConfig>(DEFAULT_FLASHCARD_CONFIG);
  const [copied, setCopied] = useState(false);

  const generatedPrompt = useMemo(() => {
    if (activeMode === 'flashcard') {
      return buildFlashcardPrompt(flashcardConfig);
    }
    return buildAntigravityPrompt(mcqConfig);
  }, [activeMode, mcqConfig, flashcardConfig]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy prompt to clipboard:', err);
    }
  };

  const handleReset = () => {
    if (activeMode === 'flashcard') {
      setFlashcardConfig(DEFAULT_FLASHCARD_CONFIG);
    } else {
      setMcqConfig(DEFAULT_PROMPT_CONFIG);
    }
  };

  const questionPresets: Array<number | 'auto'> = ['auto', 5, 10, 15, 20, 30, 50];
  const cardPresets: Array<number | 'auto'> = ['auto', 5, 10, 15, 20, 25, 30];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-[#121215] border border-[#27272A] p-6 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#18181B] border border-[#27272A] text-[#10B981] text-xs font-mono mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>UNIFIED PROMPT SYNTHESIZER</span>
            </div>
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight font-mono">
              AI Prompt Studio for PDF Ingestion
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Generate specialized prompts to extract either rigorous Multiple Choice Questions or pure Theory Flashcards from your PDFs.
            </p>
          </div>

          <button
            onClick={onGoToIngestion}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-[#09090B] text-xs font-semibold self-start md:self-auto transition-colors font-mono"
          >
            <span>Have JSON ready? Go to Ingestion</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Generator Mode Selector Tabs */}
        <div className="mt-5 pt-4 border-t border-[#27272A] flex items-center gap-2">
          <button
            onClick={() => setActiveMode('mcq')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold transition-colors ${
              activeMode === 'mcq'
                ? 'bg-[#10B981] text-[#09090B]'
                : 'bg-[#18181B] text-zinc-400 hover:text-zinc-200 border border-[#27272A]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Multiple Choice (MCQ)</span>
          </button>

          <button
            onClick={() => setActiveMode('flashcard')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold transition-colors ${
              activeMode === 'flashcard'
                ? 'bg-amber-400 text-black'
                : 'bg-[#18181B] text-zinc-400 hover:text-zinc-200 border border-[#27272A]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Theory Flashcards</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls Form, Right Real-time Prompt Code */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Form Asking Questions with Dropdown Lists */}
        <div className="lg:col-span-5 bg-[#121215] border border-[#27272A] p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200 font-mono">
              <Sliders className="w-4 h-4 text-[#10B981]" />
              <span>{activeMode === 'flashcard' ? 'FLASHCARD PARAMETERS' : 'MCQ PARAMETERS'}</span>
            </div>
            <button
              onClick={handleReset}
              className="text-xs text-zinc-400 hover:text-[#10B981] flex items-center gap-1 transition-colors font-mono"
              title="Reset parameters to defaults"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {activeMode === 'flashcard' ? (
            <>
              {/* Flashcard Count */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 font-mono">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Total Flashcards</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-[#18181B] border border-[#27272A] px-2 py-0.5">
                    {flashcardConfig.cardCount === 'auto' ? '⚡ Auto (AI-Determined)' : `${flashcardConfig.cardCount} Cards`}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cardPresets.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setFlashcardConfig((prev) => ({ ...prev, cardCount: preset }))}
                      className={`px-3 py-1 text-xs font-mono transition-colors ${
                        flashcardConfig.cardCount === preset
                          ? 'bg-amber-400 text-black font-bold'
                          : 'bg-[#18181B] text-zinc-400 hover:text-zinc-200 border border-[#27272A]'
                      }`}
                    >
                      {preset === 'auto' ? '⚡ Auto (AI Dynamic)' : preset}
                    </button>
                  ))}
                </div>
                {flashcardConfig.cardCount === 'auto' && (
                  <div className="text-[11px] text-amber-400/90 font-mono bg-amber-950/20 border border-amber-900/40 p-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                    <span>AI analyzes the note and dynamically generates as many cards as needed to cover all distinct theory concepts.</span>
                  </div>
                )}
              </div>

              {/* Difficulty */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 font-mono">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Difficulty Distribution</span>
                </label>
                <select
                  value={flashcardConfig.difficulty}
                  onChange={(e) => setFlashcardConfig((prev) => ({ ...prev, difficulty: e.target.value as any }))}
                  className="w-full bg-[#18181B] border border-[#27272A] px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-400 transition-colors"
                >
                  <option value="Balanced">Balanced (Foundations, key mechanisms, advanced theory)</option>
                  <option value="Easy">Easy (Pure definitions, terminology, axioms)</option>
                  <option value="Medium">Medium (Processes, algorithms, multi-condition rules)</option>
                  <option value="Hard">Hard (Deep edge-cases, formal proofs, architectural tradeoffs)</option>
                </select>
              </div>

              {/* Theory Depth */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 font-mono">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Theory Depth & Multi-Answer Formatting</span>
                </label>
                <select
                  value={flashcardConfig.theoryDepth}
                  onChange={(e) => setFlashcardConfig((prev) => ({ ...prev, theoryDepth: e.target.value as any }))}
                  className="w-full bg-[#18181B] border border-[#27272A] px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-400 transition-colors"
                >
                  <option value="Comprehensive & Multi-Part Concepts">Comprehensive & Multi-Part Concepts (Itemized point arrays)</option>
                  <option value="Atomic Definitions & Axioms">Atomic Definitions & Axioms (Single concise definition)</option>
                  <option value="Comparative / Differences">Comparative / Differences (Contrasting related concepts)</option>
                </select>
              </div>

              {/* Academic Level */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 font-mono">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Target Academic Level</span>
                </label>
                <select
                  value={flashcardConfig.academicLevel}
                  onChange={(e) => setFlashcardConfig((prev) => ({ ...prev, academicLevel: e.target.value as any }))}
                  className="w-full bg-[#18181B] border border-[#27272A] px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-400 transition-colors"
                >
                  <option value="Undergraduate">Undergraduate (University / College level)</option>
                  <option value="Graduate / Postgrad">Graduate / Postgrad (Master's / Research depth)</option>
                  <option value="Professional Certification">Professional Certification (Specialized accreditation)</option>
                  <option value="High School">High School (Secondary / AP level)</option>
                </select>
              </div>

              {/* Custom Directives */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 flex items-center justify-between font-mono">
                  <span>Specific Theory Focus / Chapters</span>
                  <span className="text-[10px] text-zinc-500">Optional</span>
                </label>
                <textarea
                  rows={3}
                  value={flashcardConfig.customDirectives}
                  onChange={(e) => setFlashcardConfig((prev) => ({ ...prev, customDirectives: e.target.value }))}
                  placeholder="e.g., Focus only on memory allocation theory and page replacement theorems. Provide multi-part answers as list arrays."
                  className="w-full bg-[#18181B] border border-[#27272A] p-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400 resize-none transition-colors font-mono"
                />
              </div>

              {/* Flashcard Scope & Non-duplication Guardrails */}
              <div className="space-y-2 pt-2 border-t border-[#27272A]">
                <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  Theory Scope & Non-Duplication Guardrails
                </div>
                <div className="space-y-1.5 font-mono text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-zinc-100">
                    <input
                      type="checkbox"
                      checked={flashcardConfig.onlyTheoryNotes !== false}
                      onChange={(e) => setFlashcardConfig((prev) => ({ ...prev, onlyTheoryNotes: e.target.checked }))}
                      className="w-3.5 h-3.5 accent-amber-400 bg-[#18181B] border border-[#27272A]"
                    />
                    <span>Theory Cards Only from Notes (Skip exercises, calculations & admin notes)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-zinc-100">
                    <input
                      type="checkbox"
                      checked={flashcardConfig.strictPdfScopeOnly !== false}
                      onChange={(e) => setFlashcardConfig((prev) => ({ ...prev, strictPdfScopeOnly: e.target.checked }))}
                      className="w-3.5 h-3.5 accent-amber-400 bg-[#18181B] border border-[#27272A]"
                    />
                    <span>Strict PDF Scope Only (No external theory)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-zinc-100">
                    <input
                      type="checkbox"
                      checked={flashcardConfig.preventTopicDuplicates !== false}
                      onChange={(e) => setFlashcardConfig((prev) => ({ ...prev, preventTopicDuplicates: e.target.checked }))}
                      className="w-3.5 h-3.5 accent-amber-400 bg-[#18181B] border border-[#27272A]"
                    />
                    <span>Zero Duplication (Never test same theory twice)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-zinc-100">
                    <input
                      type="checkbox"
                      checked={flashcardConfig.exhaustiveTheory !== false}
                      onChange={(e) => setFlashcardConfig((prev) => ({ ...prev, exhaustiveTheory: e.target.checked }))}
                      className="w-3.5 h-3.5 accent-amber-400 bg-[#18181B] border border-[#27272A]"
                    />
                    <span>Exhaustive Theory Extraction (Span entire PDF)</span>
                  </label>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Question Count */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 font-mono">
                    <HelpCircle className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Total Questions</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-[#10B981] bg-[#18181B] border border-[#27272A] px-2 py-0.5">
                    {mcqConfig.questionCount === 'auto' ? '⚡ Auto (AI-Determined)' : `${mcqConfig.questionCount} MCQs`}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {questionPresets.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setMcqConfig((prev) => ({ ...prev, questionCount: preset }))}
                      className={`px-3 py-1 text-xs font-mono transition-colors ${
                        mcqConfig.questionCount === preset
                          ? 'bg-[#10B981] text-[#09090B] font-bold'
                          : 'bg-[#18181B] text-zinc-400 hover:text-zinc-200 border border-[#27272A]'
                      }`}
                    >
                      {preset === 'auto' ? '⚡ Auto (AI Dynamic)' : preset}
                    </button>
                  ))}
                </div>
                {mcqConfig.questionCount === 'auto' && (
                  <div className="text-[11px] text-[#10B981]/90 font-mono bg-emerald-950/20 border border-emerald-900/40 p-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-[#10B981]" />
                    <span>AI analyzes the PDF and dynamically generates as many high-quality MCQs as needed to cover all distinct theory concepts.</span>
                  </div>
                )}
              </div>

              {/* Difficulty Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 font-mono">
                  <Layers className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Difficulty Distribution</span>
                </label>
                <select
                  value={mcqConfig.difficulty}
                  onChange={(e) => setMcqConfig((prev) => ({ ...prev, difficulty: e.target.value as any }))}
                  className="w-full bg-[#18181B] border border-[#27272A] px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#10B981] transition-colors"
                >
                  <option value="Balanced">Balanced (Standard distribution: 30% Easy, 50% Medium, 20% Hard)</option>
                  <option value="Easy">Easy (Fundamental recall, definitions, direct facts)</option>
                  <option value="Medium">Medium (Application, multi-step deduction, comprehension)</option>
                  <option value="Hard">Hard (Edge-cases, complex scenarios, synthesis)</option>
                  <option value="Progressive Adaptive">Progressive Adaptive (Gradually ramps from Easy to Hard)</option>
                </select>
              </div>

              {/* Question Archetype Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 font-mono">
                  <BookOpen className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Question Archetype & Focus</span>
                </label>
                <select
                  value={mcqConfig.archetype}
                  onChange={(e) => setMcqConfig((prev) => ({ ...prev, archetype: e.target.value as any }))}
                  className="w-full bg-[#18181B] border border-[#27272A] px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#10B981] transition-colors"
                >
                  <option value="Conceptual & Theory">Conceptual & Theory (Principles, core theorems, logic)</option>
                  <option value="Practical / Application">Practical / Application (Real-world problems, code, formulas)</option>
                  <option value="Case Study & Scenario">Case Study & Scenario (Clinical, technical or business cases)</option>
                  <option value="High-Yield Board Exam">High-Yield Board Exam (Certification/licensing standard)</option>
                  <option value="Edge Cases & Trick Questions">Edge Cases & Common Misconceptions</option>
                </select>
              </div>

              {/* Academic / Professional Level Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 font-mono">
                  <GraduationCap className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Target Level & Audience</span>
                </label>
                <select
                  value={mcqConfig.academicLevel}
                  onChange={(e) => setMcqConfig((prev) => ({ ...prev, academicLevel: e.target.value as any }))}
                  className="w-full bg-[#18181B] border border-[#27272A] px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#10B981] transition-colors"
                >
                  <option value="Undergraduate">Undergraduate (College / Bachelor's degree level)</option>
                  <option value="Graduate / Postgrad">Graduate / Postgrad (Master's / PhD / Specialized)</option>
                  <option value="Professional Certification">Professional Certification (AWS, USMLE, Bar, CompTIA)</option>
                  <option value="High School">High School (AP / A-Levels / Secondary)</option>
                  <option value="Corporate Training">Corporate Training / Executive Competency</option>
                </select>
              </div>

              {/* Explanation Depth Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 font-mono">
                  <FileText className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Explanation & Distractor Depth</span>
                </label>
                <select
                  value={mcqConfig.explanationDepth}
                  onChange={(e) => setMcqConfig((prev) => ({ ...prev, explanationDepth: e.target.value as any }))}
                  className="w-full bg-[#18181B] border border-[#27272A] px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#10B981] transition-colors"
                >
                  <option value="Didactic (Every option analyzed)">Didactic (Analyzes correct answer AND all distractors)</option>
                  <option value="Concise Rationale">Concise Rationale (Focused summary of correct principle)</option>
                  <option value="Key Takeaway Only">Key Takeaway Only (Bullet point summary)</option>
                </select>
              </div>

              {/* Custom Directives / Focus Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 flex items-center justify-between font-mono">
                  <span>Specific Directives / Focus Chapters</span>
                  <span className="text-[10px] text-zinc-500">Optional</span>
                </label>
                <textarea
                  rows={3}
                  value={mcqConfig.customDirectives}
                  onChange={(e) => setMcqConfig((prev) => ({ ...prev, customDirectives: e.target.value }))}
                  placeholder="e.g., Emphasize Chapter 4: Memory Paging. Include LaTeX formulas where appropriate. Exclude historical timelines."
                  className="w-full bg-[#18181B] border border-[#27272A] p-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#10B981] resize-none transition-colors font-mono"
                />
              </div>

              {/* MCQ Pedagogical Guardrails */}
              <div className="space-y-2 pt-2 border-t border-[#27272A]">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#10B981] font-bold">
                  Pedagogical Guardrails & Scope Invariants
                </div>
                <div className="space-y-1.5 font-mono text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-zinc-100">
                    <input
                      type="checkbox"
                      checked={mcqConfig.selfContainedQuestions !== false}
                      onChange={(e) => setMcqConfig((prev) => ({ ...prev, selfContainedQuestions: e.target.checked }))}
                      className="w-3.5 h-3.5 accent-[#10B981] bg-[#18181B] border border-[#27272A]"
                    />
                    <span>Self-Contained Questions (No slide/page refs)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-zinc-100">
                    <input
                      type="checkbox"
                      checked={mcqConfig.strictPdfScopeOnly !== false}
                      onChange={(e) => setMcqConfig((prev) => ({ ...prev, strictPdfScopeOnly: e.target.checked }))}
                      className="w-3.5 h-3.5 accent-[#10B981] bg-[#18181B] border border-[#27272A]"
                    />
                    <span>Strict PDF Scope Only (No external facts)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-zinc-100">
                    <input
                      type="checkbox"
                      checked={mcqConfig.preventTopicDuplicates !== false}
                      onChange={(e) => setMcqConfig((prev) => ({ ...prev, preventTopicDuplicates: e.target.checked }))}
                      className="w-3.5 h-3.5 accent-[#10B981] bg-[#18181B] border border-[#27272A]"
                    />
                    <span>Zero Duplication (Unique theory topic per item)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-zinc-100">
                    <input
                      type="checkbox"
                      checked={mcqConfig.exhaustiveTheory !== false}
                      onChange={(e) => setMcqConfig((prev) => ({ ...prev, exhaustiveTheory: e.target.checked }))}
                      className="w-3.5 h-3.5 accent-[#10B981] bg-[#18181B] border border-[#27272A]"
                    />
                    <span>Exhaustive Theory Elements (Maximize coverage)</span>
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Output: Real-Time Synthesized Prompt */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#121215] border border-[#27272A] p-5">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-[#10B981]" />
                <span className="text-xs font-semibold text-zinc-200 font-mono uppercase">Generated Antigravity Prompt</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#18181B] border border-[#27272A] text-zinc-400">
                  Ready to copy
                </span>
              </div>

              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold transition-colors font-mono ${
                  copied
                    ? 'bg-[#10B981] text-[#09090B]'
                    : 'bg-[#10B981] hover:bg-[#059669] text-[#09090B]'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>COPIED TO CLIPBOARD</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>COPY PROMPT</span>
                  </>
                )}
              </button>
            </div>

            {/* Prompt Preview Code Box */}
            <div className="relative">
              <pre className="w-full h-[450px] overflow-y-auto bg-[#09090B] border border-[#27272A] p-4 font-mono text-[11px] text-zinc-300 leading-relaxed whitespace-pre-wrap selection:bg-[#10B981]/30 selection:text-[#10B981]">
                {generatedPrompt}
              </pre>
            </div>

            {/* Step-by-Step Workflow Guide */}
            <div className="mt-4 pt-3 border-t border-[#27272A] grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-[#18181B] border border-[#27272A]">
                <div className="text-[10px] font-mono text-[#10B981] font-bold">STEP 1</div>
                <div className="text-[11px] text-zinc-300 font-medium mt-0.5">Copy Prompt</div>
                <div className="text-[10px] text-zinc-500 font-mono">Click button above</div>
              </div>
              <div className="p-2 bg-[#18181B] border border-[#27272A]">
                <div className="text-[10px] font-mono text-[#10B981] font-bold">STEP 2</div>
                <div className="text-[11px] text-zinc-300 font-medium mt-0.5">Run with PDF</div>
                <div className="text-[10px] text-zinc-500 font-mono">Paste in Antigravity</div>
              </div>
              <div className="p-2 bg-[#18181B] border border-[#27272A]">
                <div className="text-[10px] font-mono text-[#10B981] font-bold">STEP 3</div>
                <div className="text-[11px] text-zinc-300 font-medium mt-0.5">Ingest JSON</div>
                <div className="text-[10px] text-zinc-500 font-mono">Start instant testing</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
