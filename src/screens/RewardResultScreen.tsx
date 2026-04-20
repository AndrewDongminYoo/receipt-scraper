import * as React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { fetchLatestRewardResult, rewardResultQueryKeys } from '../api/rewards';
import AppButton from '../components/AppButton';
import ScreenHeader from '../components/ScreenHeader';
import SectionCard from '../components/SectionCard';
import StateCard from '../components/StateCard';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { SurveyFieldName } from '../types/survey';
import { surveyFieldLabels, surveyOptionLabelByValue } from '../types/survey';
import { formatTimestamp } from '../utils/formatTimestamp';

function getRewardResultErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unable to load the latest reward result right now.';
}

function RewardResultScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    data: rewardResult,
    error,
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryFn: fetchLatestRewardResult,
    queryKey: rewardResultQueryKeys.latest,
  });

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      style={styles.scrollView}
      testID="screen-reward-result"
    >
      <ScreenHeader
        description="Review the latest reward outcome generated from the survey flow."
        title="Reward Result"
        titleTestID="screen-reward-result-title"
      />

      {isLoading ? (
        <StateCard
          message="Pulling the latest submission result from the mock reward store."
          showsActivityIndicator
          title="Loading reward..."
        />
      ) : null}

      {!isLoading && isError ? (
        <StateCard
          message={getRewardResultErrorMessage(error)}
          testID="reward-result-error"
          title="Unable to load reward"
          variant="error"
        >
          <AppButton
            onPress={() => refetch()}
            testID="retry-reward-result-button"
            variant="ghost"
          >
            Try Again
          </AppButton>
        </StateCard>
      ) : null}

      {!isLoading && !isError && !rewardResult ? (
        <StateCard
          message="Complete the survey to calculate your reward."
          title="No reward yet"
        >
          <AppButton
            onPress={() => navigation.navigate('Survey')}
            testID="reward-empty-go-to-survey"
            variant="primary"
          >
            Go To Survey
          </AppButton>
        </StateCard>
      ) : null}

      {!isLoading && !isError && rewardResult ? (
        <>
          {/* Success celebration card */}
          <View style={styles.resultCard}>
            <Text style={styles.resultStar}>⭐</Text>
            <Text style={styles.resultTitle}>{rewardResult.title}</Text>
            <Text style={styles.resultPoints}>
              {rewardResult.pointsAwarded} points
            </Text>
            <Text style={styles.resultMessage}>{rewardResult.message}</Text>
            <Text style={styles.resultTimestamp}>
              Submitted: {formatTimestamp(rewardResult.submittedAt)}
            </Text>
          </View>

          {/* Survey summary */}
          <SectionCard style={styles.answersCard} title="Survey summary">
            {(Object.keys(surveyFieldLabels) as Array<SurveyFieldName>).map(
              fieldName => (
                <View key={fieldName} style={styles.answerRow}>
                  <Text style={styles.answerLabel}>
                    {surveyFieldLabels[fieldName]}
                  </Text>
                  <Text style={styles.answerValue}>
                    {surveyOptionLabelByValue[fieldName][
                      rewardResult.answers[fieldName]
                    ] || rewardResult.answers[fieldName]}
                  </Text>
                </View>
              ),
            )}
          </SectionCard>

          <View style={styles.actionGroup}>
            <AppButton
              onPress={() => navigation.navigate('Survey')}
              testID="reward-retake-survey-button"
              variant="ghost"
            >
              Retake Survey
            </AppButton>
            <AppButton
              onPress={() => navigation.navigate('Home')}
              testID="reward-go-home-button"
              variant="surface"
            >
              Back To Home
            </AppButton>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  actionGroup: {
    gap: 10,
  },
  answerLabel: {
    color: '#5f5f5d',
    fontSize: 14,
    lineHeight: 20,
  },
  answerRow: {
    borderTopColor: '#eceae4',
    borderTopWidth: 1,
    gap: 4,
    paddingVertical: 12,
  },
  answerValue: {
    color: '#1c1c1c',
    fontSize: 15,
    fontWeight: '600',
  },
  answersCard: {
    paddingBottom: 8,
  },
  contentContainer: {
    padding: 24,
  },
  resultCard: {
    backgroundColor: '#fcfbf8',
    borderColor: '#eceae4',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    padding: 20,
  },
  resultMessage: {
    color: '#5f5f5d',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  resultPoints: {
    color: '#92400e',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  resultStar: {
    fontSize: 40,
    marginBottom: 8,
    textAlign: 'center',
  },
  resultTimestamp: {
    color: 'rgba(28, 28, 28, 0.4)',
    fontSize: 13,
    lineHeight: 18,
  },
  resultTitle: {
    color: '#1c1c1c',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginBottom: 8,
    textAlign: 'center',
  },
  scrollView: {
    backgroundColor: '#f7f4ed',
  },
});

export default RewardResultScreen;
