export enum QuestionType {
  SINGLE = 'SINGLE',
  MULTI = 'MULTI',
  LIKERT = 'LIKERT',
  TEXT = 'TEXT',
  LONGTEXT = 'LONGTEXT',
  NPS = 'NPS',
  NUMBER = 'NUMBER',
}

export enum BranchAction {
  SHOW_QUESTION = 'SHOW_QUESTION',
  SKIP_TO_SECTION = 'SKIP_TO_SECTION',
  SKIP_TO_END = 'SKIP_TO_END',
}

export interface BranchingRule {
  id: string;
  optionId: string;
  action: BranchAction;
  targetQuestionId?: string;
  targetSectionId?: string;
  skipToEnd: boolean;
}

export interface ShowIfCondition {
  questionId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number;
}

export interface Option {
  id: string;
  questionId: string;
  label: string;
  value: string;
  order: number;
  branchingRule?: BranchingRule;
}

export interface Question {
  id: string;
  sectionId: string;
  type: QuestionType;
  prompt: string;
  helpText?: string;
  required: boolean;
  order: number;
  showIf?: string; // JSON string of ShowIfCondition
  options: Option[];
}

export interface Section {
  id: string;
  surveyId: string;
  title: string;
  order: number;
  questions: Question[];
}

export interface Survey {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sections: Section[];
}

export interface Answer {
  questionId: string;
  choiceValues?: string[];
  textValue?: string;
  numberValue?: number;
}

export interface Submission {
  id: string;
  surveyId: string;
  eventSlug: string;
  createdAt: string;
  completedAt?: string;
}

export interface Contact {
  id: string;
  eventSlug: string;
  name?: string;
  email?: string;
  company?: string;
  role?: string;
  consent: boolean;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
}

export interface MetricsOverview {
  totalSubmissions: number;
  completedSubmissions: number;
  completionRate: number;
  avgCompletionTimeSeconds: number;
}

export interface QuestionMetrics {
  questionId: string;
  questionType: QuestionType;
  totalResponses: number;
  distribution?: Record<string, number>;
  average?: number;
  median?: number;
  min?: number;
  max?: number;
  responses?: string[];
  wordCount?: number;
}
