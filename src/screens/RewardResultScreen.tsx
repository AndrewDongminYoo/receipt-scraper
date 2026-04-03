import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchLatestRewardResult, rewardResultQueryKeys } from '../api/rewards';
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
      testID="screen-reward-result"
    >
      <ScreenHeader
        description="Review the latest reward outcome generated from the Day 4 survey flow."
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
          <View style={styles.buttonWrapper}>
            <Button
              onPress={() => refetch()}
              testID="retry-reward-result-button"
              title="Try Again"
            />
          </View>
        </StateCard>
      ) : null}

      {!isLoading && !isError && !rewardResult ? (
        <StateCard
          message="Complete the survey to calculate your reward."
          title="No reward yet"
        >
          <View style={styles.buttonWrapper}>
            <Button
              onPress={() => navigation.navigate('Survey')}
              testID="reward-empty-go-to-survey"
              title="Go To Survey"
            />
          </View>
        </StateCard>
      ) : null}

      {!isLoading && !isError && rewardResult ? (
        <>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>{rewardResult.title}</Text>
            <Text style={styles.resultPoints}>
              {rewardResult.pointsAwarded} points
            </Text>
            <Text style={styles.resultMessage}>{rewardResult.message}</Text>
            <Text style={styles.resultTimestamp}>
              Submitted: {formatTimestamp(rewardResult.submittedAt)}
            </Text>
          </View>

          <SectionCard title="Survey summary" style={styles.answersCard}>
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
            <View style={styles.buttonWrapper}>
              <Button
                onPress={() => navigation.navigate('Survey')}
                testID="reward-retake-survey-button"
                title="Retake Survey"
              />
            </View>
            <View style={styles.buttonWrapper}>
              <Button
                onPress={() => navigation.navigate('Home')}
                testID="reward-go-home-button"
                title="Back To Home"
              />
            </View>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  actionGroup: {
    gap: 12,
  },
  answerLabel: {
    color: '#4b5563',
    fontSize: 14,
    lineHeight: 20,
  },
  answerRow: {
    borderTopColor: '#e5e7eb',
    borderTopWidth: 1,
    gap: 6,
    paddingVertical: 12,
  },
  answerValue: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  answersCard: {
    paddingBottom: 8,
  },
  buttonWrapper: {
    width: '100%',
  },
  contentContainer: {
    padding: 24,
  },
  resultCard: {
    backgroundColor: '#ecfdf5',
    borderColor: '#86efac',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    padding: 20,
  },
  resultMessage: {
    color: '#14532d',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  resultPoints: {
    color: '#166534',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
  },
  resultTimestamp: {
    color: '#15803d',
    fontSize: 13,
    lineHeight: 18,
  },
  resultTitle: {
    color: '#14532d',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
});

export default RewardResultScreen;
