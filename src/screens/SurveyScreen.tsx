import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import {
  Button,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { rewardResultQueryKeys, submitSurvey } from '../api/rewards';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { SurveyFormValues, SurveyFieldName } from '../types/survey';
import {
  surveyDefaultValues,
  surveyFieldOptions,
  surveyQuestionCopy,
  surveySchema,
} from '../types/survey';

function getSurveySubmitErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'We could not submit your survey. Please try again.';
}

function SurveyScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const { control, clearErrors, handleSubmit, setError } =
    useForm<SurveyFormValues>({
      defaultValues: surveyDefaultValues,
    });

  const submitMutation = useMutation({
    mutationFn: submitSurvey,
    onSuccess: response => {
      queryClient.setQueryData(rewardResultQueryKeys.latest, response.result);
      queryClient.invalidateQueries({ queryKey: rewardResultQueryKeys.latest });
      navigation.navigate('RewardResult');
    },
  });

  const isSubmittingSurvey = submitMutation.isPending;
  const submitErrorMessage = submitMutation.isError
    ? getSurveySubmitErrorMessage(submitMutation.error)
    : null;

  const onSubmit = handleSubmit(values => {
    clearErrors();

    const parsedValues = surveySchema.safeParse(values);

    if (!parsedValues.success) {
      parsedValues.error.issues.forEach(issue => {
        const fieldName = issue.path[0] as SurveyFieldName;

        setError(fieldName, {
          message: issue.message,
          type: 'manual',
        });
      });
      return;
    }

    submitMutation.mutate(parsedValues.data);
  });

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      testID="screen-survey"
    >
      <Text style={styles.title} testID="screen-survey-title">
        Survey
      </Text>
      <Text style={styles.description}>
        Answer three quick multiple-choice questions, validate the inputs, and
        submit the final Day 4 reward flow.
      </Text>

      {(Object.keys(surveyQuestionCopy) as Array<keyof SurveyFormValues>).map(
        fieldName => (
          <Controller
            control={control}
            key={fieldName}
            name={fieldName}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>
                  {surveyQuestionCopy[fieldName].title}
                </Text>
                <Text style={styles.supportingText}>
                  {surveyQuestionCopy[fieldName].description}
                </Text>

                <View style={styles.optionGroup}>
                  {surveyFieldOptions[fieldName].map(option => {
                    const isSelected = value === option.value;

                    return (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected }}
                        key={option.value}
                        onPress={() => {
                          clearErrors(fieldName);
                          onChange(option.value);
                        }}
                        style={[
                          styles.optionButton,
                          isSelected && styles.optionButtonSelected,
                        ]}
                        testID={`survey-option-${fieldName}-${option.value}`}
                      >
                        <Text
                          style={[
                            styles.optionButtonLabel,
                            isSelected && styles.optionButtonLabelSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {error?.message ? (
                  <Text
                    style={styles.errorText}
                    testID={`survey-error-${fieldName}`}
                  >
                    {error.message}
                  </Text>
                ) : null}
              </View>
            )}
          />
        ),
      )}

      {submitErrorMessage ? (
        <View style={styles.errorCard} testID="survey-submit-error">
          <Text style={styles.errorCardTitle}>Submission failed</Text>
          <Text style={styles.errorCardMessage}>{submitErrorMessage}</Text>
        </View>
      ) : null}

      <View style={styles.buttonWrapper}>
        <Button
          disabled={isSubmittingSurvey}
          onPress={onSubmit}
          testID="submit-survey-button"
          title={isSubmittingSurvey ? 'Submitting Survey...' : 'Submit Survey'}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: {
    marginTop: 8,
    width: '100%',
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    padding: 20,
  },
  contentContainer: {
    padding: 24,
  },
  description: {
    color: '#4b5563',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'left',
  },
  errorCard: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    padding: 20,
  },
  errorCardMessage: {
    color: '#991b1b',
    fontSize: 14,
    lineHeight: 20,
  },
  errorCardTitle: {
    color: '#7f1d1d',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  optionButton: {
    backgroundColor: '#f9fafb',
    borderColor: '#d1d5db',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  optionButtonLabel: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
  },
  optionButtonLabelSelected: {
    color: '#1d4ed8',
  },
  optionButtonSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#60a5fa',
  },
  optionGroup: {
    gap: 10,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  supportingText: {
    color: '#4b5563',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'left',
  },
});

export default SurveyScreen;
