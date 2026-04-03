import type { SurveyFormValues } from './survey';

export interface RewardResult {
  answers: SurveyFormValues;
  message: string;
  pointsAwarded: number;
  submittedAt: string;
  title: string;
}

export interface SurveySubmissionResponse {
  message: string;
  result: RewardResult;
}
