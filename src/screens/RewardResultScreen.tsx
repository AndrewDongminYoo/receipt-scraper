import * as React from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { fetchLatestRewardResult, rewardResultQueryKeys } from '../api/rewards';
import AppButton from '../components/AppButton';
import SectionCard from '../components/SectionCard';
import StateCard from '../components/StateCard';
import { colors, fontSizes, fontWeights, radii, space } from '../theme/tokens';
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

/** Counting-up points number */
function CountUpPoints({ target }: { target: number }) {
  const [display, setDisplay] = React.useState(0);
  const scale = React.useRef(new Animated.Value(0.7)).current;

  React.useEffect(() => {
    setDisplay(0);
    const step = Math.max(1, Math.ceil(target / 60));
    const timer = setInterval(() => {
      setDisplay(prev => {
        const next = prev + step;
        if (next >= target) {
          clearInterval(timer);
          return target;
        }
        return next;
      });
    }, 30);

    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      damping: 7,
      stiffness: 160,
    }).start();

    return () => clearInterval(timer);
  }, [target, scale]);

  return (
    <Animated.Text
      style={[styles.pointsNumber, { transform: [{ scale }] }]}
    >
      {display}
    </Animated.Text>
  );
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
      style={styles.scroll}
      testID="screen-reward-result"
    >
      {/* Loading */}
      {isLoading ? (
        <StateCard
          message="최신 리워드 결과를 불러오는 중이에요."
          showsActivityIndicator
          title="불러오는 중..."
          variant="loading"
        />
      ) : null}

      {/* Error */}
      {!isLoading && isError ? (
        <StateCard
          message={getRewardResultErrorMessage(error)}
          testID="reward-result-error"
          title="리워드를 불러올 수 없어요"
          variant="error"
        >
          <AppButton
            onPress={() => refetch()}
            size="md"
            testID="retry-reward-result-button"
            title="다시 시도"
            variant="secondary"
          />
        </StateCard>
      ) : null}

      {/* Empty */}
      {!isLoading && !isError && !rewardResult ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>아직 설문 결과가 없어요</Text>
          <Text style={styles.emptyDescription}>
            설문을 완료하면 결과가 나타나요
          </Text>
          <AppButton
            onPress={() => navigation.navigate('Survey')}
            size="lg"
            testID="reward-empty-go-to-survey"
            title="설문 하러 가기"
            variant="primary"
          />
        </View>
      ) : null}

      {/* Success state */}
      {!isLoading && !isError && rewardResult ? (
        <>
          {/* Celebration hero */}
          <View style={styles.celebrationHero}>
            <Text style={styles.starIcon}>⭐</Text>
            <Text style={styles.congratsTitle}>축하해요!</Text>
            <CountUpPoints target={rewardResult.pointsAwarded} />
            <Text style={styles.pointsLabel}>포인트 획득</Text>
            <Text style={styles.rewardMessage} testID="screen-reward-result-title">
              {rewardResult.message}
            </Text>
            <Text style={styles.submittedAt}>
              {formatTimestamp(rewardResult.submittedAt)}
            </Text>
          </View>

          {/* Survey summary */}
          <SectionCard style={styles.summaryCard} title="설문 요약">
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

          {/* Action buttons */}
          <View style={styles.actionGroup}>
            <AppButton
              onPress={() => navigation.navigate('Survey')}
              size="lg"
              testID="reward-retake-survey-button"
              title="다시 설문하기"
              variant="secondary"
            />
            <AppButton
              onPress={() => navigation.navigate('Home')}
              size="lg"
              testID="reward-go-home-button"
              title="홈으로"
              variant="ghost"
            />
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  actionGroup: {
    gap: space.md,
  },
  answerLabel: {
    color: colors.ink500,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  answerRow: {
    borderTopColor: colors.ink300,
    borderTopWidth: 1,
    gap: space.xs,
    paddingVertical: space.md,
  },
  answerValue: {
    color: colors.ink900,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
  },
  celebrationHero: {
    alignItems: 'center',
    backgroundColor: colors.gold400,
    borderRadius: radii.xl,
    marginBottom: space.lg,
    paddingHorizontal: space.xl,
    paddingVertical: space['2xl'],
  },
  congratsTitle: {
    color: colors.surface,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.extrabold,
    marginTop: space.sm,
  },
  contentContainer: {
    padding: space.xl,
    paddingBottom: space['3xl'],
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: space['2xl'],
  },
  emptyDescription: {
    color: colors.ink500,
    fontSize: fontSizes.sm,
    marginBottom: space.xl,
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: space.lg,
  },
  emptyTitle: {
    color: colors.ink700,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    marginBottom: space.sm,
    textAlign: 'center',
  },
  pointsLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: fontSizes.md,
    marginTop: space.xs,
  },
  pointsNumber: {
    color: colors.surface,
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.black,
    lineHeight: 48,
    marginTop: space.sm,
  },
  rewardMessage: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: fontSizes.sm,
    lineHeight: 22,
    marginTop: space.md,
    textAlign: 'center',
  },
  scroll: {
    backgroundColor: colors.canvas,
  },
  starIcon: {
    fontSize: 56,
  },
  submittedAt: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSizes.xs,
    marginTop: space.sm,
  },
  summaryCard: {
    marginBottom: space.lg,
    paddingBottom: space.sm,
  },
});

export default RewardResultScreen;
