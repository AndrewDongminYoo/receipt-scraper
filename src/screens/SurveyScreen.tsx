import * as React from 'react';
import {
  Button,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';

import { rewardResultQueryKeys, submitSurvey } from '../api/rewards';
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
      testID="screen-survey"
    >
      <ScreenHeader
        description="Answer three quick multiple-choice questions, validate the inputs, and submit the final Day 4 reward flow."
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
  contentContainer: {
    padding: 24,
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
});

export default SurveyScreen;
