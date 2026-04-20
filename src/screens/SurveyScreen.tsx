import * as React from 'react';
import {
  Animated,
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
import AppButton from '../components/AppButton';
import SectionCard from '../components/SectionCard';
import StateCard from '../components/StateCard';
import { colors, fontSizes, fontWeights, radii, space } from '../theme/tokens';
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

/** Animated selection option button */
function OptionButton({
  isSelected,
  label,
  onPress,
  testID,
}: {
  isSelected: boolean;
  label: string;
  onPress: () => void;
  testID?: string;
}) {
  const scale = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isSelected) {
      Animated.spring(scale, {
        toValue: 1.02,
        useNativeDriver: true,
        damping: 10,
        stiffness: 300,
      }).start(() =>
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          damping: 10,
          stiffness: 300,
        }).start(),
      );
    }
  }, [isSelected, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        onPress={onPress}
        style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
        testID={testID}
      >
        {isSelected ? (
          <Text style={styles.checkmark}>✓</Text>
        ) : (
          <View style={styles.checkmarkPlaceholder} />
        )}
        <Text
          style={[
            styles.optionButtonLabel,
            isSelected && styles.optionButtonLabelSelected,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

/** Progress bar showing how many questions are answered */
function ProgressBar({
  answered,
  total,
}: {
  answered: number;
  total: number;
}) {
  const pct = answered / total;

  return (
    <View style={progressStyles.track}>
      <View style={[progressStyles.fill, { flex: pct }]} />
      <View style={{ flex: 1 - pct }} />
    </View>
  );
}

const progressStyles = StyleSheet.create({
  fill: {
    backgroundColor: colors.mint500,
    borderRadius: radii.full,
    height: '100%',
  },
  track: {
    backgroundColor: colors.ink100,
    borderRadius: radii.full,
    flexDirection: 'row',
    height: 6,
    marginBottom: space.xl,
    overflow: 'hidden',
  },
});

function SurveyScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const { control, clearErrors, handleSubmit, setError, watch } =
    useForm<SurveyFormValues>({
      defaultValues: surveyDefaultValues,
    });

  const watchedValues = watch();
  const answeredCount = Object.values(watchedValues).filter(v => v !== '').length;
  const totalQuestions = Object.keys(surveyQuestionCopy).length;

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

  const fields = Object.keys(surveyQuestionCopy) as Array<keyof SurveyFormValues>;

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      style={styles.scroll}
      testID="screen-survey"
    >
      {/* Header */}
      <Text style={styles.title} testID="screen-survey-title">
        설문에 답하고{'\n'}포인트를 받아요 📝
      </Text>

      {/* Progress bar */}
      <ProgressBar answered={answeredCount} total={totalQuestions} />

      {/* Question cards */}
      {fields.map((fieldName, idx) => (
        <Controller
          control={control}
          key={fieldName}
          name={fieldName}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <SectionCard>
              {/* Question number badge + title */}
              <View style={styles.questionHeader}>
                <View style={styles.questionNumberBadge}>
                  <Text style={styles.questionNumberText}>{idx + 1}</Text>
                </View>
                <Text style={styles.questionTitle}>
                  {surveyQuestionCopy[fieldName].title}
                </Text>
              </View>
              <Text style={styles.questionDescription}>
                {surveyQuestionCopy[fieldName].description}
              </Text>

              <View style={styles.optionGroup}>
                {surveyFieldOptions[fieldName].map(option => (
                  <OptionButton
                    isSelected={value === option.value}
                    key={option.value}
                    label={option.label}
                    onPress={() => {
                      clearErrors(fieldName);
                      onChange(option.value);
                    }}
                    testID={`survey-option-${fieldName}-${option.value}`}
                  />
                ))}
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
      ))}

      {/* Submitting state */}
      {isSubmittingSurvey ? (
        <StateCard
          message="잠시만 기다려 주세요..."
          showsActivityIndicator
          testID="survey-submitting"
          title="제출 중"
          variant="loading"
        />
      ) : null}

      {/* Error state */}
      {submitErrorMessage ? (
        <StateCard
          message={submitErrorMessage}
          testID="survey-submit-error"
          title="제출 실패"
          variant="error"
        />
      ) : null}

      {/* Submit button */}
      <AppButton
        disabled={isSubmittingSurvey || answeredCount < totalQuestions}
        loading={isSubmittingSurvey}
        onPress={onSubmit}
        size="lg"
        testID="submit-survey-button"
        title={isSubmittingSurvey ? '제출 중...' : '설문 제출하기'}
        variant="primary"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  checkmark: {
    color: colors.lavender600,
    fontSize: 16,
    fontWeight: fontWeights.bold,
    marginRight: space.sm,
    width: 20,
  },
  checkmarkPlaceholder: {
    marginRight: space.sm,
    width: 20,
  },
  contentContainer: {
    padding: space.xl,
    paddingBottom: space['3xl'],
  },
  errorText: {
    color: colors.errorText,
    fontSize: fontSizes.sm,
    lineHeight: 20,
    marginTop: space.md,
  },
  optionButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.ink300,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  optionButtonLabel: {
    color: colors.ink900,
    flex: 1,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
  },
  optionButtonLabelSelected: {
    color: colors.lavender700,
    fontWeight: fontWeights.semibold,
  },
  optionButtonSelected: {
    backgroundColor: colors.lavender200,
    borderColor: colors.lavender600,
    borderWidth: 2,
  },
  optionGroup: {
    gap: space.sm,
  },
  questionDescription: {
    color: colors.ink500,
    fontSize: fontSizes.sm,
    lineHeight: 20,
    marginBottom: space.lg,
    marginTop: space.xs,
  },
  questionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space.md,
    marginBottom: space.xs,
  },
  questionNumberBadge: {
    alignItems: 'center',
    backgroundColor: colors.primary500,
    borderRadius: radii.full,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  questionNumberText: {
    color: colors.surface,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
  },
  questionTitle: {
    color: colors.ink900,
    flex: 1,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
  },
  scroll: {
    backgroundColor: colors.canvas,
  },
  title: {
    color: colors.ink900,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.extrabold,
    lineHeight: 38,
    marginBottom: space.lg,
  },
});

export default SurveyScreen;
