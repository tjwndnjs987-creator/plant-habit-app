// Score calculation for the real-plant journal (as opposed to the 7-day simulation).
// Water/consistency here are derived from real dated records instead of game slots.

export const RECOMMENDED_CYCLE_DAYS = {
  stucky: 14,
  monstera: 8,
  echeveria: 18,
  pothos: 8,
  philodendron: 7,
  zz: 16,
  sansevieria: 14,
  calathea: 10,
  orchid: 7,
  fern: 9,
  hongkong: 8,
};
export const DEFAULT_CYCLE_DAYS = 9;

export const RECOMMENDED_AMOUNT_ML = {
  stucky: 100,
  monstera: 200,
  echeveria: 70,
  pothos: 150,
  philodendron: 150,
  zz: 100,
};
export const DEFAULT_AMOUNT_ML = 150;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function daysBetween(a, b) {
  return Math.abs(new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24);
}

export function getRecommendedCycleDays(speciesId) {
  return RECOMMENDED_CYCLE_DAYS[speciesId] ?? DEFAULT_CYCLE_DAYS;
}

export function getRecommendedAmountMl(speciesId) {
  return RECOMMENDED_AMOUNT_ML[speciesId] ?? DEFAULT_AMOUNT_ML;
}

export function computeWaterAxis(waterLogs, speciesId) {
  if (!waterLogs || waterLogs.length < 2) {
    return { value: 50, insufficient: true, label: null };
  }
  const sorted = [...waterLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
  const intervals = [];
  for (let i = 1; i < sorted.length; i++) {
    intervals.push(daysBetween(sorted[i - 1].date, sorted[i].date));
  }
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const recommendedDays = getRecommendedCycleDays(speciesId);
  const intervalDeviationPct = ((recommendedDays - avgInterval) / recommendedDays) * 100;
  const value = clamp(Math.round(50 + intervalDeviationPct), 0, 100);

  const avgAmount = waterLogs.reduce((sum, w) => sum + (w.amount || 0), 0) / waterLogs.length;
  const recommendedAmount = getRecommendedAmountMl(speciesId);
  const amountDeviationPct = ((avgAmount - recommendedAmount) / recommendedAmount) * 100;

  let intervalLabel;
  if (avgInterval < recommendedDays * 0.85) {
    intervalLabel = `권장 주기(${recommendedDays}일)보다 자주 줬어요`;
  } else if (avgInterval > recommendedDays * 1.15) {
    intervalLabel = `권장 주기(${recommendedDays}일)보다 뜸하게 줬어요`;
  } else {
    intervalLabel = `권장 주기(${recommendedDays}일)와 비슷해요`;
  }

  let amountLabel;
  if (amountDeviationPct > 15) {
    amountLabel = `급수량 평균보다 ${Math.round(amountDeviationPct)}% 많음`;
  } else if (amountDeviationPct < -15) {
    amountLabel = `급수량 평균보다 ${Math.abs(Math.round(amountDeviationPct))}% 적음`;
  } else {
    amountLabel = '급수량은 적정 수준';
  }

  return {
    value,
    insufficient: false,
    label: `${intervalLabel} · ${amountLabel}`,
    avgInterval,
    recommendedDays,
    avgAmount,
    recommendedAmount,
    intervalDeviationPct,
    amountDeviationPct,
  };
}

export function computeResponseAxis(issueLogs) {
  if (!issueLogs || issueLogs.length < 1) {
    return { value: 50, insufficient: true };
  }
  const searchedCount = issueLogs.filter((l) => l.searched).length;
  const value = clamp(Math.round((searchedCount / issueLogs.length) * 100), 0, 100);
  return { value, insufficient: false };
}

export function computeConsistencyAxis(waterLogs, issueLogs) {
  const allDates = [...(waterLogs || []).map((w) => w.date), ...(issueLogs || []).map((l) => l.date)]
    .sort((a, b) => new Date(a) - new Date(b));
  if (allDates.length < 2) {
    return { value: 50, insufficient: true };
  }
  let maxGap = 0;
  for (let i = 1; i < allDates.length; i++) {
    const gap = daysBetween(allDates[i - 1], allDates[i]);
    if (gap > maxGap) maxGap = gap;
  }
  const value = clamp(Math.round(100 - maxGap * 8), 0, 100);
  return { value, insufficient: false, maxGap, recordCount: allDates.length };
}

// 목표 달성 여부 판정. axes = { water, response, consistency } (위 3개 compute* 함수의 결과)
export function isGoalAchieved(goal, axes) {
  if (goal.type === 'interval') {
    return !axes.water.insufficient && Math.abs(axes.water.intervalDeviationPct) <= 20;
  }
  if (goal.type === 'response') {
    return !axes.response.insufficient && axes.response.value >= 70;
  }
  if (goal.type === 'consistency') {
    return !axes.consistency.insufficient && axes.consistency.maxGap <= 5;
  }
  if (goal.type === 'custom') {
    return !!goal.manuallyCompleted;
  }
  return false;
}
