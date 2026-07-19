import React from 'react';
import { PLANTS, realPhoto } from '../../data/plants';

function matchPlants(scores) {
  const weights = { water: 0.4, response: 0.3, consistency: 0.3 };
  return PLANTS.map((plant) => {
    const distance =
      Math.abs(scores.water - plant.water) * weights.water +
      Math.abs(scores.response - plant.response) * weights.response +
      Math.abs(scores.consistency - plant.consistency) * weights.consistency;
    return { ...plant, matchScore: Math.round(100 - distance) };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

function getWaterTendencyLabel(avgAmountDev) {
  if (avgAmountDev > 15) {
    return `계획보다 ${Math.round(avgAmountDev)}% 많이 줌`;
  }
  if (avgAmountDev < -15) {
    return `계획보다 ${Math.abs(Math.round(avgAmountDev))}% 적게 줌`;
  }
  return '적정';
}

function getConfidenceLabel(totalSlots) {
  if (totalSlots >= 12) return '꽤 일관된 패턴이에요';
  if (totalSlots >= 6) return '어느 정도 참고할 만해요';
  return '아직 참고 정도로만 봐주세요';
}

export default function ReportScreen({
  points,
  responseScore,
  wateringLog,
  anomalyChecks,
  unlockedBadges = [],
  badgeDefinitions = [],
  onRestart,
  onTendency,
  onRecommend,
  onStarterKit,
  precomputedScores,
  axisLabels,
  title = '7일 완주, 정말 수고하셨어요!',
  summaryText = '이 결과는 확정된 진단이 아니라, 7일간의 선택을 돌아보는 참고 자료예요.',
  restartLabel = '다시 해보기',
  showCelebrate = true,
}) {
  const totalSlots = wateringLog.length;
  const doneSlots = wateringLog.filter((w) => !w.skipped).length;
  const avgAmountDev = wateringLog.length
    ? wateringLog.reduce((sum, item) => sum + (item.amountDeviation || 0), 0) / wateringLog.length
    : 0;
  const consistency = Math.max(0, Math.round((doneSlots / Math.max(totalSlots, 1)) * 100));
  const response = Math.max(0, Math.min(100, Math.round(responseScore || 0)));
  const waterScore = 50 + avgAmountDev;
  const scores = precomputedScores || {
    water: Math.round(waterScore),
    response,
    consistency,
  };
  const matched = matchPlants(scores).slice(0, 3);
  const waterTendencyLabel = (axisLabels && axisLabels.water) || getWaterTendencyLabel(avgAmountDev);
  const responseLabel = axisLabels && axisLabels.response;
  const consistencyLabel = axisLabels && axisLabels.consistency;
  const confidenceLabel = getConfidenceLabel(totalSlots);

  return (
    <div className="result-card">
      {showCelebrate && <div className="celebrate">🎉🌿🎉</div>}
      <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 18, marginBottom: 4, textAlign: 'center' }}>
        {title}
      </div>
      <div className="report-metadata">
        급수 {totalSlots}회 · 이상반응 체크 {anomalyChecks}회 관찰 기준 — {confidenceLabel}
      </div>
      <div className="report-metadata">그동안의 기록을 분석해봤어요</div>
      {typeof points === 'number' && (
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <span className="stat-pts">⭐ 총 {points}점 획득</span>
        </div>
      )}

      <div className="axis-row">
        <div className="axis-box">
          <div className="lbl">물관리</div>
          <div className="val" style={{ fontSize: 14 }}>{waterTendencyLabel}</div>
        </div>
        <div className="axis-box">
          <div className="lbl">반응속도</div>
          <div className="val" style={{ fontSize: responseLabel ? 14 : 22 }}>{responseLabel || scores.response}</div>
        </div>
        <div className="axis-box">
          <div className="lbl">꾸준함</div>
          <div className="val" style={{ fontSize: consistencyLabel ? 14 : 22 }}>{consistencyLabel || scores.consistency}</div>
        </div>
      </div>

      {badgeDefinitions.length > 0 && (
        <>
          <div className="section-title">획득한 업적 ({unlockedBadges.length}/{badgeDefinitions.length})</div>
          <div className="badge-grid">
            {badgeDefinitions.map((badge) => {
              const unlocked = unlockedBadges.includes(badge.id);
              return (
                <div key={badge.id} className={`badge-chip ${unlocked ? 'unlocked' : ''}`}>
                  {unlocked ? badge.label : '🔒 ???'}
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="report-summary">
        {summaryText}
      </div>

      <div className="plant-grid">
        {matched.map((plant) => (
          <div key={plant.id} className="plant-card">
            <img src={realPhoto(plant.id)} alt={plant.name} />
            <div className="pname">{plant.name}</div>
            <div className="pmatch">매칭 {plant.matchScore}%</div>
          </div>
        ))}
      </div>

      <div className="center" style={{ gap: 8, flexDirection: 'column' }}>
        {(onTendency || onRecommend) && (
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            {onTendency && (
              <button
                className="btn btn-outline"
                style={{ flex: 1, color: 'var(--ink)', borderColor: 'var(--line)' }}
                onClick={() => onTendency(scores)}
              >
                📊 내 성향분석
              </button>
            )}
            {onRecommend && (
              <button className="btn btn-dark" style={{ flex: 1 }} onClick={() => onRecommend(scores)}>
                🌿 식물 추천받기
              </button>
            )}
          </div>
        )}
        {onStarterKit && (
          <button className="btn btn-dark" style={{ width: '100%' }} onClick={() => onStarterKit(scores)}>
            🎁 Starter Kit 추천받기
          </button>
        )}
        {onRestart && (
          <button
            className="btn btn-outline"
            style={{ color: 'var(--ink)', borderColor: 'var(--line)', fontSize: 12, padding: '8px 16px' }}
            onClick={onRestart}
          >
            {restartLabel}
          </button>
        )}
      </div>
    </div>
  );
}
