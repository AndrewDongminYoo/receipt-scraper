import type { RewardResult, SurveySubmissionResponse } from '../types/reward';
import type { SurveyFormValues } from '../types/survey';
import { wait } from '../utils/wait';

const REWARD_FETCH_DELAY_MS = 250;
const SURVEY_SUBMIT_DELAY_MS = 700;

let latestRewardResult: RewardResult | null = null;

export const rewardResultQueryKeys = {
  latest: ['reward-result'] as const,
};

function calculateRewardPoints(answers: SurveyFormValues) {
  let points = 20;

  if (answers.visitPurpose === 'groceries') {
    points += 10;
  }

  if (answers.purchaseFor === 'household') {
    points += 5;
  }

  if (answers.paymentMethod === 'card') {
    points += 5;
  }

  return points;
}

export async function fetchLatestRewardResult(): Promise<RewardResult | null> {
  await wait(REWARD_FETCH_DELAY_MS);

  if (!latestRewardResult) {
    return null;
  }

  return { ...latestRewardResult };
}

export async function submitSurvey(
  answers: SurveyFormValues,
): Promise<SurveySubmissionResponse> {
  await wait(SURVEY_SUBMIT_DELAY_MS);

  const pointsAwarded = calculateRewardPoints(answers);
  const result: RewardResult = {
    answers,
    message: 'Thanks for sharing your receipt context. Your bonus is ready.',
    pointsAwarded,
    submittedAt: new Date().toISOString(),
    title: `${pointsAwarded} points earned`,
  };

  latestRewardResult = result;

  return {
    message: result.message,
    result,
  };
}
