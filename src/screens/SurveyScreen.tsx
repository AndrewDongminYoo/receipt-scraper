import * as React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';

import { rewardResultQueryKeys, submitSurvey } from '../api/rewards';
import AppButton from '../components/AppButton';
import ScreenHeader from '../components/ScreenHeader';
import SectionCard from '../components/SectionCard';
import StateCard from '../components/StateCard';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { SurveyFieldName, SurveyFormValues } from '../types/survey';
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
      style={styles.scrollView}
      testID="screen-survey"
    >
      <ScreenHeader
        description="Answer three quick multiple-choice questions and earn your reward."
        title="Survey"
        titleTestID="screen-survey-title"
      />

      {(Object.keys(surveyQuestionCopy) as Array<keyof SurveyFormValues>).map(
        fieldName => (
          <Controller
            control={control}
            key={fieldName}
            name={fieldName}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <SectionCard
                description={surveyQuestionCopy[fieldName].description}
                title={surveyQuestionCopy[fieldName].title}
              >
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
                        {isSelected ? (
                          <Text style={styles.checkMark}>✓</Text>
                        ) : null}
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
              </SectionCard>
            )}
          />
        ),
      )}

      {isSubmittingSurvey ? (
        <StateCard
          message="Submitting your answers..."
          showsActivityIndicator
          testID="survey-submitting"
          title="Submitting"
        />
      ) : null}

      {submitErrorMessage ? (
        <StateCard
          message={submitErrorMessage}
          testID="survey-submit-error"
          title="Submission failed"
          variant="error"
        />
      ) : null}

      <AppButton
        disabled={isSubmittingSurvey}
        isLoading={isSubmittingSurvey}
        onPress={onSubmit}
        size="lg"
        style={styles.submitButton}
        testID="submit-survey-button"
        variant="primary"
      >
        {isSubmittingSurvey ? 'Submitting Survey...' : 'Submit Survey'}
      </AppButton>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  checkMark: {
    color: 'rgba(28, 28, 28, 0.7)',
    fontSize: 15,
    marginRight: 8,
  },
  contentContainer: {
    padding: 24,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  optionButton: {
    alignItems: 'center',
    backgroundColor: '#fcfbf8',
    borderColor: '#eceae4',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  optionButtonLabel: {
    color: '#1c1c1c',
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  optionButtonLabelSelected: {
    color: '#1c1c1c',
    fontWeight: '600',
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(28, 28, 28, 0.04)',
    borderColor: 'rgba(28, 28, 28, 0.4)',
    borderWidth: 1.5,
  },
  optionGroup: {
    gap: 10,
  },
  scrollView: {
    backgroundColor: '#f7f4ed',
  },
  submitButton: {
    marginTop: 8,
    width: '100%',
  },
});

export default SurveyScreen;
