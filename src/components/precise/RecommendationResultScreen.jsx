import React, { useRef, useState } from 'react';
import { PLANTS, realPhoto } from '../../data/plants';

function rankByHabit(list, scores, recAnswers) {
  return list.map((plant) => {
    const habitDist =
      Math.abs(scores.water - plant.water) * 0.4 +
      Math.abs(scores.response - plant.response) * 0.3 +
      Math.abs(scores.consistency - plant.consistency) * 0.3;
    let bonus = 0;
    if (recAnswers.space && plant.space.includes(recAnswers.space)) bonus += 10;
    if (recAnswers.purpose && plant.purpose.includes(recAnswers.purpose)) bonus += 10;
    return { ...plant, matchScore: Math.max(0, Math.round(100 - habitDist + bonus)) };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

function scorePlants(scores, recAnswers) {
  // 1단계: 빛 조건은 필수 — 안 맞으면 후보에서 제외
  const lightFiltered = recAnswers.light
    ? PLANTS.filter((plant) => plant.light.includes(recAnswers.light))
    : PLANTS;

  // 2단계: 남은 후보를 습관 거리 + 공간/목적 보너스로 순위 매기기
  const ranked = rankByHabit(lightFiltered, scores, recAnswers);
  if (ranked.length >= 3) {
    return ranked.slice(0, 3);
  }

  // 필터링 후 3개 미만이면, 필터 없이 전체에서 채워서 최소 3개는 보여주기
  const rankedIds = new Set(ranked.map((plant) => plant.id));
  const fallback = rankByHabit(PLANTS, scores, recAnswers).filter((plant) => !rankedIds.has(plant.id));
  return [...ranked, ...fallback].slice(0, 3);
}

export default function RecommendationResultScreen({ scores, recAnswers = {}, onBack, source = 'precise' }) {
  const [toast, setToast] = useState('');
  const toastTimerRef = useRef(null);

  const matched = scorePlants(scores, recAnswers);

  function handleBuy(name) {
    // 쿠팡 검색 링크로 이동하는 게 최종 사양 (제휴 API 승인 전까지는 상품 상세 페이지 직결 불가)
    window.open(`https://www.coupang.com/np/search?q=${encodeURIComponent(name + ' 화분')}`, '_blank');
  }

  function handleCare() {
    setToast('관리 앱(그루우 등)으로 연동 예정이에요 🌱');
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(''), 1800);
  }

  return (
    <div className="result-card">
      <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 17, marginBottom: 12 }}>
        습관 + 조건을 합친 추천이에요
      </div>

      <div className="plant-grid">
        {matched.map((plant) => (
          <div key={plant.id} className="plant-card">
            <img src={realPhoto(plant.id)} alt={plant.name} />
            <div className="pname">{plant.name}</div>
            <div className="pmatch">매칭 {plant.matchScore}%</div>
            <div className="plant-card-actions">
              <button className="btn btn-dark btn-small" onClick={() => handleBuy(plant.name)}>🛒 구매</button>
              <button
                className="btn btn-outline btn-small"
                style={{ color: 'var(--ink)', borderColor: 'var(--line)' }}
                onClick={handleCare}
              >
                🌱 관리앱
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="center">
        <button
          className="btn btn-outline"
          style={{ color: 'var(--ink)', borderColor: 'var(--line)' }}
          onClick={() => onBack && onBack()}
        >
          {source === 'quick' ? '결과로 돌아가기' : '리포트로 돌아가기'}
        </button>
      </div>

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}
