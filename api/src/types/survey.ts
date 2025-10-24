export interface Section {
  id: string;
  title: string;
  surveyId: string;
  order: number;
  questions?: Question[];
}

export interface Question {
  id: string;
  sectionId: string;
  type: string;
  prompt: string;
  helpText?: string;
  required: boolean;
  order: number;
  showIf?: string;
}
