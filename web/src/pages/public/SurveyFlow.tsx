import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { surveyAPI, submissionAPI } from '../../services/api';
import type { Answer, BranchAction, Question, QuestionType, Section, ShowIfCondition, Survey } from '../../types';

const DEFAULT_EVENT_SLUG = 'fall-summit-2025';

type AnswersMap = Record<string, Answer>;

export default function SurveyFlow() {
  const { surveyId } = useParams();
  const navigate = useNavigate();

  // Redirect if surveyId is literally 'undefined'
  useEffect(() => {
    if (surveyId === 'undefined') {
      navigate('/', { replace: true });
    }
  }, [surveyId, navigate]);

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [submissionId, setSubmissionId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');

  const sections: Section[] = useMemo(() => survey?.sections ?? [], [survey]);
  const currentSection: Section | undefined = sections[currentSectionIndex];
  const totalSections = sections.length;

  // Evaluate if a question should be shown based on showIf condition
  const shouldShowQuestion = (question: Question): boolean => {
    if (!question.showIf) return true;
    
    try {
      const condition: ShowIfCondition = JSON.parse(question.showIf);
      const answer = answers[condition.questionId];
      
      if (!answer) return false;
      
      switch (condition.operator) {
        case 'equals':
          if (answer.choiceValues && answer.choiceValues.length > 0) {
            return answer.choiceValues.includes(String(condition.value));
          }
          if (answer.textValue !== undefined) {
            return answer.textValue === condition.value;
          }
          if (answer.numberValue !== undefined) {
            return answer.numberValue === Number(condition.value);
          }
          return false;
          
        case 'not_equals':
          if (answer.choiceValues && answer.choiceValues.length > 0) {
            return !answer.choiceValues.includes(String(condition.value));
          }
          if (answer.textValue !== undefined) {
            return answer.textValue !== condition.value;
          }
          if (answer.numberValue !== undefined) {
            return answer.numberValue !== Number(condition.value);
          }
          return false;
          
        case 'contains':
          if (answer.choiceValues && answer.choiceValues.length > 0) {
            return answer.choiceValues.some(v => v.includes(String(condition.value)));
          }
          if (answer.textValue !== undefined) {
            return answer.textValue.includes(String(condition.value));
          }
          return false;
          
        case 'greater_than':
          if (answer.numberValue !== undefined) {
            return answer.numberValue > Number(condition.value);
          }
          return false;
          
        case 'less_than':
          if (answer.numberValue !== undefined) {
            return answer.numberValue < Number(condition.value);
          }
          return false;
          
        default:
          return true;
      }
    } catch (e) {
      console.error('Error evaluating showIf condition:', e);
      return true;
    }
  };

  // Get visible questions for current section
  const visibleQuestions = useMemo(() => {
    if (!currentSection) return [];
    return currentSection.questions.filter(q => shouldShowQuestion(q));
  }, [currentSection, answers]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError('');
      try {
        // If surveyId is provided in URL, use it. Otherwise load active survey
        let surveyData;
        if (surveyId && surveyId !== 'undefined') {
          surveyData = await surveyAPI.getById(surveyId);
        } else {
          surveyData = await surveyAPI.getActive(DEFAULT_EVENT_SLUG);
        }
        setSurvey(surveyData.data);
        const sub = await submissionAPI.create({ 
          surveyId: surveyData.data.id, 
          eventSlug: DEFAULT_EVENT_SLUG 
        });
        setSubmissionId(sub.data.submissionId);
      } catch (e: any) {
        console.error('Survey loading error:', e);
        setError(e?.response?.data?.error || e?.message || 'Failed to load survey');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [surveyId]);

  const handleAnswerChange = (q: Question, value: any) => {
    setAnswers((prev) => {
      const next = { ...prev } as AnswersMap;
      if (q.type === 'MULTI') {
        const current = (prev[q.id]?.choiceValues ?? []) as string[];
        const exists = current.includes(value);
        next[q.id] = {
          questionId: q.id,
          choiceValues: exists ? current.filter((v) => v !== value) : [...current, value],
        };
      } else if (q.type === 'SINGLE') {
        next[q.id] = { questionId: q.id, choiceValues: [value] };
      } else if (q.type === 'TEXT' || q.type === 'LONGTEXT') {
        next[q.id] = { questionId: q.id, textValue: value };
      } else if (q.type === 'LIKERT' || q.type === 'NPS' || q.type === 'NUMBER') {
        next[q.id] = { questionId: q.id, numberValue: Number(value) };
      }
      return next;
    });
  };

  // Evaluate branching rules based on current answers
  const evaluateBranchingRules = (): { action?: BranchAction; targetSectionId?: string; skipToEnd?: boolean } => {
    if (!currentSection) return {};
    
    // Check all answered questions in the current section for branching rules
    for (const question of currentSection.questions) {
      const answer = answers[question.id];
      if (!answer || !answer.choiceValues) continue;
      
      // Check each selected option for branching rules
      for (const selectedValue of answer.choiceValues) {
        const option = question.options.find(opt => opt.value === selectedValue);
        if (option?.branchingRule) {
          const rule = option.branchingRule;
          if (rule.action === 'SKIP_TO_END' || rule.skipToEnd) {
            return { action: 'SKIP_TO_END' as BranchAction, skipToEnd: true };
          }
          if (rule.action === 'SKIP_TO_SECTION' && rule.targetSectionId) {
            return { action: 'SKIP_TO_SECTION' as BranchAction, targetSectionId: rule.targetSectionId };
          }
        }
      }
    }
    
    return {};
  };

  const saveCurrentSection = async () => {
    if (!submissionId || !currentSection) return;
    setSaving(true);
    try {
      const sectionQuestionIds = new Set(currentSection.questions.map((q) => q.id));
      const sectionAnswers = Object.values(answers).filter((a) => sectionQuestionIds.has(a.questionId));
      if (sectionAnswers.length > 0) {
        await submissionAPI.submitAnswers(submissionId, sectionAnswers);
      }
    } finally {
      setSaving(false);
    }
  };

  const goNext = async () => {
    await saveCurrentSection();
    
    // Evaluate branching rules
    const branchResult = evaluateBranchingRules();
    
    if (branchResult.skipToEnd) {
      // Complete survey immediately
      await submissionAPI.complete(submissionId);
      navigate('/contact');
      return;
    }
    
    if (branchResult.targetSectionId) {
      // Find the target section index
      const targetIndex = sections.findIndex(s => s.id === branchResult.targetSectionId);
      if (targetIndex !== -1 && targetIndex > currentSectionIndex) {
        setCurrentSectionIndex(targetIndex);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    
    // Default behavior: go to next section
    if (currentSectionIndex < totalSections - 1) {
      setCurrentSectionIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Complete survey
      await submissionAPI.complete(submissionId);
      navigate('/contact');
    }
  };

  const goPrev = async () => {
    await saveCurrentSection();
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((i) => i - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderQuestion = (q: Question) => {
    const value = answers[q.id];
    const help = q.helpText ? <p className="mt-1 text-sm text-gray-500">{q.helpText}</p> : null;

    switch (q.type as QuestionType) {
      case 'TEXT':
        return (
          <div key={q.id} className="mb-6">
            <label className="label">{q.prompt}{q.required ? ' *' : ''}</label>
            <input
              className="input"
              value={value?.textValue || ''}
              onChange={(e) => handleAnswerChange(q, e.target.value)}
            />
            {help}
          </div>
        );
      case 'LONGTEXT':
        return (
          <div key={q.id} className="mb-6">
            <label className="label">{q.prompt}{q.required ? ' *' : ''}</label>
            <textarea
              className="input min-h-[120px]"
              value={value?.textValue || ''}
              onChange={(e) => handleAnswerChange(q, e.target.value)}
            />
            {help}
          </div>
        );
      case 'SINGLE':
        return (
          <div key={q.id} className="mb-6">
            <div className="label">{q.prompt}{q.required ? ' *' : ''}</div>
            <div className="space-y-2">
              {q.options.map((opt) => (
                <label key={opt.id} className="flex items-center gap-3">
                  <input
                    type="radio"
                    className="h-4 w-4"
                    name={q.id}
                    checked={(value?.choiceValues || [])[0] === opt.value}
                    onChange={() => handleAnswerChange(q, opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            {help}
          </div>
        );
      case 'MULTI':
        return (
          <div key={q.id} className="mb-6">
            <div className="label">{q.prompt}{q.required ? ' *' : ''}</div>
            <div className="space-y-2">
              {q.options.map((opt) => (
                <label key={opt.id} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={(value?.choiceValues || []).includes(opt.value)}
                    onChange={() => handleAnswerChange(q, opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            {help}
          </div>
        );
      case 'LIKERT': {
        const v = value?.numberValue ?? 3;
        return (
          <div key={q.id} className="mb-6">
            <label className="label">{q.prompt}{q.required ? ' *' : ''}</label>
            <input
              type="range"
              min={1}
              max={5}
              value={v}
              onChange={(e) => handleAnswerChange(q, e.target.value)}
              className="w-full"
            />
            <div className="mt-1 text-sm text-gray-600">Selected: {v}</div>
            {help}
          </div>
        );
      }
      case 'NPS': {
        const v = value?.numberValue ?? 7;
        return (
          <div key={q.id} className="mb-6">
            <label className="label">{q.prompt}{q.required ? ' *' : ''}</label>
            <input
              type="range"
              min={0}
              max={10}
              value={v}
              onChange={(e) => handleAnswerChange(q, e.target.value)}
              className="w-full"
            />
            <div className="mt-1 text-sm text-gray-600">Selected: {v}</div>
            {help}
          </div>
        );
      }
      case 'NUMBER':
        return (
          <div key={q.id} className="mb-6">
            <label className="label">{q.prompt}{q.required ? ' *' : ''}</label>
            <input
              type="number"
              className="input"
              value={value?.numberValue ?? ''}
              onChange={(e) => handleAnswerChange(q, e.target.value)}
            />
            {help}
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="card">
            <h1>Survey Unavailable</h1>
            <p className="mt-2 text-gray-600">{error || 'Survey not found or inactive.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const progress = totalSections > 0 ? Math.round(((currentSectionIndex + 1) / totalSections) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="card">
          <div className="mb-6">
            <h1 className="mb-2">{survey.title}</h1>
            {survey.description && <p className="text-gray-600">{survey.description}</p>}
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Section {currentSectionIndex + 1} of {totalSections}</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-2 h-2 w-full rounded bg-gray-200">
              <div className="h-2 rounded bg-primary-600" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {currentSection && (
            <div>
              <h2 className="mb-4">{currentSection.title}</h2>
              {visibleQuestions.map((q) => renderQuestion(q))}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={goPrev}
              className="btn-secondary"
              disabled={currentSectionIndex === 0 || saving}
            >
              Previous
            </button>
            <div className="flex items-center gap-3">
              {saving && <span className="text-sm text-gray-500">Saving...</span>}
              <button
                onClick={goNext}
                className="btn-primary"
                disabled={saving}
              >
                {currentSectionIndex === totalSections - 1 ? 'Submit' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
