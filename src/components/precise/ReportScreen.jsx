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
  if (totalSlots >= 30) return '꽤 일관됨';
  if (totalSlots >= 15) return '참고할만함';
  return '참고만';
}

export default function ReportScreen({
  points,
  responseScore,
  wateringLog,
  anomalyChecks,
  unlockedBadges,
  badgeDefinitions,
  onRestart,
  onTendency,
  onRecommend,
}) {
  const totalSlots = wateringLog.length;
  const doneSlots = wateringLog.filter((w) => !w.skipped).length;
  const avgAmountDev = wateringLog.length
    ? wateringLog.reduce((sum, item) => sum + item.amountDeviation, 0) / wateringLog.length
    : 0;
  const consistency = Math.max(0, Math.round((doneSlots / Math.max(totalSlots, 1)) * 100));
  const response = Math.max(0, Math.min(100, Math.round(responseScore)));
  const waterScore = 50 + avgAmountDev;
  const scores = {
    water: Math.round(waterScore),
    response,
    consistency,
  };
  const matched = matchPlants(scores).slice(0, 3);
  const waterTendencyLabel = getWaterTendencyLabel(avgAmountDev);
  const confidenceLabel = getConfidenceLabel(totalSlots);

  return (
    <div className="result-card">
      <div className="celebrate">🎉🌿🎉</div>
      <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 18, marginBottom: 4, textAlign: 'center' }}>
        21일 완주, 정말 수고하셨어요!
      </div>
      <div className="report-metadata">
        급수 {totalSlots}회 · 이상반응 체크 {anomalyChecks}회 관찰 기준 — {confidenceLabel}
      </div>
      <div className="report-metadata">그동안의 기록을 분석해봤어요</div>
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <span className="stat-pts">⭐ 총 {points}점 획득</span>
      </div>

      <div className="axis-row">
        <div className="axis-box">
          <div className="lbl">물관리</div>
          <div className="val" style={{ fontSize: 14 }}>{waterTendencyLabel}</div>
        </div>
        <div className="axis-box">
          <div className="lbl">반응속도</div>
          <div className="val">{response}</div>
        </div>
        <div className="axis-box">
          <div className="lbl">꾸준함</div>
          <div className="val">{consistency}</div>
        </div>
      </div>

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

      <div className="report-summary">
        이 결과는 확정된 진단이 아니라, 21일간의 선택을 돌아보는 참고 자료예요.
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
        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
          <button
            className="btn btn-outline"
            style={{ flex: 1, color: 'var(--ink)', borderColor: 'var(--line)' }}
            onClick={() => onTendency(scores)}
          >
            📊 내 성향분석
          </button>
          <button className="btn btn-dark" style={{ flex: 1 }} onClick={() => onRecommend(scores)}>
            🌿 식물 추천받기
          </button>
        </div>
        <button
          className="btn btn-outline"
          style={{ color: 'var(--ink)', borderColor: 'var(--line)', fontSize: 12, padding: '8px 16px' }}
          onClick={onRestart}
        >
          다시 해보기
        </button>
      </div>
    </div>
  );
}
