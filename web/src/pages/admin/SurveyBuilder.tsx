import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import type { BranchAction, Option, Question, Section, Survey } from '../../types';
import { QuestionType } from '../../types';

const QUESTION_TYPES = [
  QuestionType.TEXT,
  QuestionType.LONGTEXT,
  QuestionType.SINGLE,
  QuestionType.MULTI,
  QuestionType.LIKERT,
  QuestionType.NPS,
  QuestionType.NUMBER,
];

export default function SurveyBuilder() {
  const { id } = useParams();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Edit fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(false);

  // New section
  const [newSectionTitle, setNewSectionTitle] = useState('');

  // New question form
  const [targetSectionId, setTargetSectionId] = useState<string>('');
  const [qType, setQType] = useState<QuestionType>(QuestionType.TEXT);
  const [qPrompt, setQPrompt] = useState('');
  const [qRequired, setQRequired] = useState(false);
  const [qOptionsCsv, setQOptionsCsv] = useState('');

  // Branching configuration
  const [showBranchingFor, setShowBranchingFor] = useState<string | null>(null);
  const [branchAction, setBranchAction] = useState<BranchAction>('SHOW_QUESTION' as BranchAction);
  const [branchTargetSectionId, setBranchTargetSectionId] = useState<string>('');
  const [branchTargetQuestionId, setBranchTargetQuestionId] = useState<string>('');

  const addBranchingRule = async (optionId: string) => {
    setSaving(true);
    try {
      const payload: any = {
        branchAction: branchAction,
        skipToEnd: branchAction === 'SKIP_TO_END',
      };
      if (branchAction === 'SKIP_TO_SECTION' && branchTargetSectionId) {
        payload.targetSectionId = branchTargetSectionId;
      }
      if (branchAction === 'SHOW_QUESTION' && branchTargetQuestionId) {
        payload.targetQuestionId = branchTargetQuestionId;
      }
      await adminAPI.options.update(optionId, payload);
      setShowBranchingFor(null);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to add branching rule');
    } finally {
      setSaving(false);
    }
  };

  const deleteBranchingRule = async (optionId: string) => {
    if (!confirm('Delete this branching rule?')) return;
    setSaving(true);
    try {
      await adminAPI.options.update(optionId, { branchAction: null, targetQuestionId: null, targetSectionId: null, skipToEnd: false });
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to delete branching rule');
    } finally {
      setSaving(false);
    }
  };

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.surveys.get(id);
      const data = res.data as Survey;
      setSurvey(data);
      setTitle(data.title);
      setDescription(data.description || '');
      setIsActive(data.isActive);
      setTargetSectionId(data.sections[0]?.id || '');
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load survey');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const sortedSections: Section[] = useMemo(
    () => (survey?.sections || []).slice().sort((a, b) => a.order - b.order),
    [survey]
  );

  const saveSurveyMeta = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const res = await adminAPI.surveys.update(id, { title, description: description || undefined, isActive });
      setSurvey(res.data as Survey);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to save survey');
    } finally {
      setSaving(false);
    }
  };

  const addSection = async () => {
    if (!id || !newSectionTitle.trim()) return;
    setSaving(true);
    try {
      const order = (survey?.sections.length || 0) + 1;
      await adminAPI.sections.create({ surveyId: id, title: newSectionTitle.trim(), order });
      setNewSectionTitle('');
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to add section');
    } finally {
      setSaving(false);
    }
  };

  const deleteSection = async (sectionId: string) => {
    if (!confirm('Delete this section and all its questions?')) return;
    setSaving(true);
    try {
      await adminAPI.sections.delete(sectionId);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to delete section');
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = async () => {
    if (!targetSectionId || !qPrompt.trim()) return;
    setSaving(true);
    try {
      const section = survey?.sections.find((s) => s.id === targetSectionId);
      const order = (section?.questions.length || 0) + 1;
      const payload: any = {
        sectionId: targetSectionId,
        type: qType,
        prompt: qPrompt.trim(),
        required: qRequired,
        order,
      };
      if (qType === 'SINGLE' || qType === 'MULTI') {
        const opts = qOptionsCsv
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .map((label, idx) => ({ label, value: label.toLowerCase().replace(/\s+/g, '-'), order: idx + 1 }));
        payload.options = opts;
      }
      await adminAPI.questions.create(payload);
      setQPrompt('');
      setQOptionsCsv('');
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to add question');
    } finally {
      setSaving(false);
    }
  };

  const deleteQuestion = async (q: Question) => {
    if (!confirm('Delete this question?')) return;
    setSaving(true);
    try {
      await adminAPI.questions.delete(q.id);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to delete question');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="card">Failed to load survey.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4">Survey Builder</h1>
        {error && <div className="mb-4 rounded bg-red-50 p-3 text-red-800">{error}</div>}

        <div className="card mb-6">
          <h2 className="mb-3">Details</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
            <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> Active</label>
              <button className="btn-primary" onClick={saveSurveyMeta} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="card">
              <div className="mb-4 flex items-center justify-between">
                <h2>Sections & Questions</h2>
              </div>

              {sortedSections.map((sec) => (
                <div key={sec.id} className="mb-6 rounded border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-semibold">{sec.title}</div>
                    <button className="btn-danger" onClick={() => deleteSection(sec.id)} disabled={saving}>Delete Section</button>
                  </div>

                  <ul className="space-y-3">
                    {sec.questions.sort((a, b) => a.order - b.order).map((q) => (
                      <li key={q.id} className="rounded bg-gray-50 p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm text-gray-600">{q.type}</div>
                            <div className="font-medium">{q.prompt}</div>
                            
                            {/* Show options with branching rules */}
                            {(q.type === 'SINGLE' || q.type === 'MULTI') && q.options && q.options.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {q.options.sort((a, b) => a.order - b.order).map((opt: Option) => (
                                  <div key={opt.id} className="text-sm pl-3 border-l-2 border-gray-300">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-gray-700">• {opt.label}</span>
                                      <div className="flex items-center gap-2">
                                        {opt.branchAction ? (
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                              {opt.branchAction === 'SKIP_TO_END' ? '→ End Survey' :
                                               opt.branchAction === 'SKIP_TO_SECTION' ? '→ Skip to Section' :
                                               '→ Show Question'}
                                            </span>
                                            <button 
                                              className="text-xs text-red-600 hover:underline" 
                                              onClick={() => deleteBranchingRule(opt.id)}
                                              disabled={saving}
                                            >
                                              Remove
                                            </button>
                                          </div>
                                        ) : (
                                          <button 
                                            className="text-xs text-blue-600 hover:underline" 
                                            onClick={() => setShowBranchingFor(opt.id)}
                                            disabled={saving}
                                          >
                                            + Add Branch
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Branching configuration form */}
                                    {showBranchingFor === opt.id && (
                                      <div className="mt-2 p-2 bg-white rounded border space-y-2">
                                        <div>
                                          <label className="block text-xs font-medium mb-1">Action</label>
                                          <select 
                                            className="input text-xs" 
                                            value={branchAction}
                                            onChange={(e) => setBranchAction(e.target.value as BranchAction)}
                                          >
                                            <option value="SKIP_TO_SECTION">Skip to Section</option>
                                            <option value="SKIP_TO_END">End Survey</option>
                                          </select>
                                        </div>
                                        
                                        {branchAction === 'SKIP_TO_SECTION' && (
                                          <div>
                                            <label className="block text-xs font-medium mb-1">Target Section</label>
                                            <select 
                                              className="input text-xs"
                                              value={branchTargetSectionId}
                                              onChange={(e) => setBranchTargetSectionId(e.target.value)}
                                            >
                                              <option value="">Select section...</option>
                                              {sortedSections.map(s => (
                                                <option key={s.id} value={s.id}>{s.title}</option>
                                              ))}
                                            </select>
                                          </div>
                                        )}
                                        
                                        <div className="flex gap-2">
                                          <button 
                                            className="btn-primary text-xs"
                                            onClick={() => addBranchingRule(opt.id)}
                                            disabled={saving || (branchAction === 'SKIP_TO_SECTION' && !branchTargetSectionId)}
                                          >
                                            Save
                                          </button>
                                          <button 
                                            className="btn-secondary text-xs"
                                            onClick={() => setShowBranchingFor(null)}
                                            disabled={saving}
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <button className="btn-danger" onClick={() => deleteQuestion(q)} disabled={saving}>Delete</button>
                        </div>
                      </li>
                    ))}
                    {sec.questions.length === 0 && (
                      <li className="text-sm text-gray-600">No questions yet</li>
                    )}
                  </ul>
                </div>
              ))}

              {sortedSections.length === 0 && (
                <div className="text-sm text-gray-600">No sections yet</div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h2 className="mb-3">Add Section</h2>
              <div className="flex items-center gap-3">
                <input className="input" placeholder="Section title" value={newSectionTitle} onChange={(e) => setNewSectionTitle(e.target.value)} />
                <button className="btn-primary" onClick={addSection} disabled={saving || !newSectionTitle.trim()}>{saving ? 'Adding...' : 'Add'}</button>
              </div>
            </div>

            <div className="card">
              <h2 className="mb-3">Add Question</h2>
              <div className="mb-3">
                <label className="label">Target Section</label>
                <select className="input" value={targetSectionId} onChange={(e) => setTargetSectionId(e.target.value)}>
                  {sortedSections.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3">
                <div>
                  <label className="label">Type</label>
                  <select className="input" value={qType} onChange={(e) => setQType(e.target.value as QuestionType)}>
                    {QUESTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Prompt</label>
                  <input className="input" value={qPrompt} onChange={(e) => setQPrompt(e.target.value)} />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={qRequired} onChange={(e) => setQRequired(e.target.checked)} /> Required
                </label>

                {(qType === 'SINGLE' || qType === 'MULTI') && (
                  <div>
                    <label className="label">Options (comma separated)</label>
                    <input className="input" value={qOptionsCsv} onChange={(e) => setQOptionsCsv(e.target.value)} placeholder="e.g. Yes, No, Maybe" />
                  </div>
                )}

                <button className="btn-primary" onClick={addQuestion} disabled={saving || !qPrompt.trim()}>{saving ? 'Adding...' : 'Add Question'}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
