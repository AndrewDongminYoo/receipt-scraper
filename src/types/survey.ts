import { z } from 'zod';

export const surveySchema = z.object({
  paymentMethod: z.string().min(1, 'Choose one option for payment method.'),
  purchaseFor: z
    .string()
    .min(1, 'Choose one option for who the purchase was for.'),
  visitPurpose: z.string().min(1, 'Choose one option for visit purpose.'),
});

export type SurveyFormValues = z.infer<typeof surveySchema>;

export type SurveyFieldName = keyof SurveyFormValues;

export interface SurveyOption {
  label: string;
  value: string;
}

export const surveyFieldLabels: Record<SurveyFieldName, string> = {
  paymentMethod: 'Payment method',
  purchaseFor: 'Purchase for',
  visitPurpose: 'Visit purpose',
};

export const surveyQuestionCopy: Record<
  SurveyFieldName,
  {
    description: string;
    title: string;
  }
> = {
  paymentMethod: {
    description: 'Tell us which tender you used for this receipt.',
    title: '3. How did you pay?',
  },
  purchaseFor: {
    description: 'This keeps the practice reward logic slightly product-like.',
    title: '2. Who was this purchase for?',
  },
  visitPurpose: {
    description: 'Pick the option that best matches this receipt trip.',
    title: '1. What best describes this visit?',
  },
};

export const surveyFieldOptions: Record<SurveyFieldName, SurveyOption[]> = {
  paymentMethod: [
    { label: 'Card', value: 'card' },
    { label: 'Cash', value: 'cash' },
    { label: 'Mobile wallet', value: 'mobileWallet' },
  ],
  purchaseFor: [
    { label: 'Myself', value: 'myself' },
    { label: 'Household', value: 'household' },
    { label: 'Work', value: 'work' },
  ],
  visitPurpose: [
    { label: 'Groceries', value: 'groceries' },
    { label: 'Home essentials', value: 'household' },
    { label: 'Dining out', value: 'dining' },
  ],
};

export const surveyOptionLabelByValue = Object.fromEntries(
  (Object.keys(surveyFieldOptions) as Array<SurveyFieldName>).map(field => [
    field,
    Object.fromEntries(surveyFieldOptions[field].map(o => [o.value, o.label])),
  ]),
) as Record<SurveyFieldName, Record<string, string>>;

export const surveyDefaultValues: SurveyFormValues = {
  paymentMethod: '',
  purchaseFor: '',
  visitPurpose: '',
};
