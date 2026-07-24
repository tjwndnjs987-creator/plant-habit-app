import React, { useState, useEffect } from 'react';
import IntroScreen from './components/quick/IntroScreen';
import HabitQuestionScreen from './components/quick/HabitQuestionScreen';
import HabitResultScreen from './components/quick/HabitResultScreen';
import SpeciesSelectScreen from './components/precise/SpeciesSelectScreen';
import PlanSetupScreen from './components/precise/PlanSetupScreen';
import DayScreen from './components/precise/DayScreen';
import ReportScreen from './components/precise/ReportScreen';
import TendencyScreen from './components/precise/TendencyScreen';
import RecommendationQuestionScreen from './components/precise/RecommendationQuestionScreen';
import RecommendationResultScreen from './components/precise/RecommendationResultScreen';
import StarterKitScreen from './components/precise/StarterKitScreen';
import PreciseModeSelectScreen from './components/precise/PreciseModeSelectScreen';
import JournalIntroScreen from './components/precise/JournalIntroScreen';
import RealPlantJournalScreen from './components/precise/RealPlantJournalScreen';
import { loadState, saveState, clearPreciseState, clearJournalState } from './utils/storage';

const CHEAT_PASSWORD = 'plantcheat';
const BADGE_DEFINITIONS = [
  { id: 'first_water', label: '🌊 첫 물주기' },
  { id: 'combo3', label: '🔥 3연속 정답' },
  { id: 'combo5', label: '⚡ 5연속 정답' },
  { id: 'sharp_eye', label: '🔍 탐정의 눈썰미' },
  { id: 'perfect_water', label: '🎯 완벽한 물주기' },
  { id: 'day4', label: '📅 4일 돌파' },
  { id: 'graduate', label: '🎓 7일 완주' },
];

const DEFAULT_PLAN = { amount: 150, slotsPerDay: 2 };

export default function App(){
  const saved = loadState();
  const initCompleted = saved && saved.quick && saved.quick.completed;
  const initAnswers = saved && saved.quick && saved.quick.answers ? saved.quick.answers : {};
  const savedPrecise = saved && saved.precise ? saved.precise : null;

  const [activeTab, setActiveTab] = useState(saved && saved.activeTab ? saved.activeTab : 'quick');
  const [quickStage, setQuickStage] = useState(initCompleted ? 'result' : (Object.keys(initAnswers||{}).length ? 'question' : 'intro'));
  const [answers, setAnswers] = useState(initAnswers);
  const [preciseStage, setPreciseStage] = useState(savedPrecise && savedPrecise.preciseStage ? savedPrecise.preciseStage : 'mode-select');
  const [selectedSpecies, setSelectedSpecies] = useState(savedPrecise ? (savedPrecise.selectedSpecies ?? null) : null);
  const [plan, setPlan] = useState(savedPrecise && savedPrecise.plan ? savedPrecise.plan : DEFAULT_PLAN);
  const [day, setDay] = useState(savedPrecise && typeof savedPrecise.day === 'number' ? savedPrecise.day : 1);
  const [anomaly, setAnomaly] = useState(savedPrecise ? (savedPrecise.anomaly ?? null) : null);
  const [anomalyStartDay, setAnomalyStartDay] = useState(savedPrecise ? (savedPrecise.anomalyStartDay ?? null) : null);
  const [responseScore, setResponseScore] = useState(savedPrecise && typeof savedPrecise.responseScore === 'number' ? savedPrecise.responseScore : 100);
  const [points, setPoints] = useState(savedPrecise && typeof savedPrecise.points === 'number' ? savedPrecise.points : 0);
  const [combo, setCombo] = useState(savedPrecise && typeof savedPrecise.combo === 'number' ? savedPrecise.combo : 0);
  const [wateringLog, setWateringLog] = useState(savedPrecise && Array.isArray(savedPrecise.wateringLog) ? savedPrecise.wateringLog : []);
  const [statusCheckedToday, setStatusCheckedToday] = useState(savedPrecise ? !!savedPrecise.statusCheckedToday : false);
  const [cheatMode, setCheatMode] = useState(false); // 치트모드는 절대 저장/복원하지 않음 — 항상 일반 모드로 시작
  const [unlockedBadges, setUnlockedBadges] = useState(savedPrecise && Array.isArray(savedPrecise.unlockedBadges) ? savedPrecise.unlockedBadges : []);
  const [anomalyChecks, setAnomalyChecks] = useState(savedPrecise && typeof savedPrecise.anomalyChecks === 'number' ? savedPrecise.anomalyChecks : 0);
  const [tendencyScores, setTendencyScores] = useState(savedPrecise ? (savedPrecise.tendencyScores ?? null) : null);
  const [recAnswers, setRecAnswers] = useState(savedPrecise && savedPrecise.recAnswers ? savedPrecise.recAnswers : {});
  const [journalKit, setJournalKit] = useState(savedPrecise ? (savedPrecise.journalKit ?? null) : null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  // mode-select/journal-intro/journal은 게임 화면이 아니므로 여기 포함 안 됨 — "다른 모드
  // 보기"로 나갔다가 다시 게임을 고르면 여기 저장된 지점으로 돌아가기 위한 값.
  const [lastGameStage, setLastGameStage] = useState(savedPrecise && savedPrecise.lastGameStage ? savedPrecise.lastGameStage : 'select');

  useEffect(() => {
    if (preciseStage !== 'mode-select' && preciseStage !== 'journal-intro' && preciseStage !== 'journal') {
      setLastGameStage(preciseStage);
    }
  }, [preciseStage]);

  useEffect(() => {
    saveState({
      activeTab,
      precise: {
        preciseStage,
        lastGameStage,
        selectedSpecies,
        plan,
        day,
        anomaly,
        anomalyStartDay,
        responseScore,
        points,
        combo,
        wateringLog,
        statusCheckedToday,
        unlockedBadges,
        anomalyChecks,
        tendencyScores,
        recAnswers,
        journalKit,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab, preciseStage, lastGameStage, selectedSpecies, plan, day, anomaly, anomalyStartDay,
    responseScore, points, combo, wateringLog, statusCheckedToday, unlockedBadges,
    anomalyChecks, tendencyScores, recAnswers, journalKit,
  ]);

  function handleStart(){ setQuickStage('question'); }
  function handleComplete(givenAnswers){ setAnswers(givenAnswers); setQuickStage('result'); }
  function handleRetry(){ setAnswers({}); setQuickStage('intro'); }
  function handleSelectSpecies(id){ setSelectedSpecies(id); }
  function handleChangePlan(field, delta){
    setPlan(prev => ({
      ...prev,
      [field]: field === 'slotsPerDay' ? Math.max(2, prev[field] + delta) : Math.max(1, prev[field] + delta),
    }));
  }
  function handleNextToPlan(){ setPreciseStage('plan'); }

  function handleUnlockCheat(value){
    if(value === CHEAT_PASSWORD){
      setCheatMode(true);
      return true;
    }
    return false;
  }
  
  function maybeSpawnAnomaly(currentDay){
    if(anomaly === null && Math.random() < 0.6){
      const choices = ['spot', 'bug', 'edge'];
      const newAnomaly = choices[Math.floor(Math.random() * choices.length)];
      setAnomaly(newAnomaly);
      setAnomalyStartDay(currentDay);
    }
  }

  function handleStartGame(){
    setDay(1);
    setAnomaly(null);
    setAnomalyStartDay(null);
    setResponseScore(100);
    setPoints(0);
    setCombo(0);
    setWateringLog([]);
    setStatusCheckedToday(false);
    setUnlockedBadges([]);
    setAnomalyChecks(0);
    maybeSpawnAnomaly(1);
    setPreciseStage('playing');
  }

  function handleCheckStatus(guess){
    setStatusCheckedToday(true);
    const actual = anomaly || 'none';
    setAnomalyChecks(prev => prev + 1);
    const correct = guess === actual;
    let newPoints = points;
    let newCombo = combo;
    let newResponseScore = responseScore;

    if(correct && actual !== 'none'){
      const reactionDays = day - anomalyStartDay;
      newResponseScore = Math.max(0, responseScore - Math.max(0, reactionDays - 1) * 10);
      setAnomaly(null);
      newCombo = combo + 1;
      newPoints = points + (10 * Math.min(newCombo, 3));
    } else if(!correct){
      newResponseScore = responseScore - 15;
      newCombo = 0;
      newPoints = points - 5;
    }

    setPoints(newPoints);
    setCombo(newCombo);
    setResponseScore(newResponseScore);
  }

  function handleSlotComplete(slotIndex, amount){
    const amountDeviation = ((amount - plan.amount) / plan.amount) * 100;
    setWateringLog(prev => [...prev, {
      day,
      slot: slotIndex,
      amount,
      amountDeviation,
      skipped: false
    }]);

    // Add points based on accuracy
    const accuracy = Math.abs(amountDeviation);
    let pts = 5;
    if(accuracy <= 5) pts = 20;
    else if(accuracy <= 20) pts = 12;
    setPoints(prev => prev + pts);

    if (accuracy <= 5) {
      setUnlockedBadges(prev => prev.includes('perfect_water') ? prev : [...prev, 'perfect_water']);
    }
  }

  function handleNextDay(){
    let newResponseScore = responseScore;
    if(!statusCheckedToday && anomaly){
      newResponseScore = responseScore - 15;
      setCombo(0);
    }
    setStatusCheckedToday(false);

    // Record skipped slots
    const newLog = [...wateringLog];
    for(let i = 0; i < plan.slotsPerDay; i++){
      const slotDone = wateringLog.some(w => w.day === day && w.slot === i && !w.skipped);
      if(!slotDone){
        newLog.push({
          day,
          slot: i,
          amount: 0,
          amountDeviation: ((0 - plan.amount) / plan.amount) * 100,
          skipped: true
        });
      }
    }
    setWateringLog(newLog);
    
    const newDay = day + 1;
    setDay(newDay);
    setResponseScore(newResponseScore);

    if(newDay > 7){
      const badgeSet = new Set(unlockedBadges);
      if (day >= 7) badgeSet.add('graduate');
      if (combo >= 3) badgeSet.add('combo3');
      if (combo >= 5) badgeSet.add('combo5');
      if (anomalyChecks >= 3) badgeSet.add('sharp_eye');
      if (day >= 4) badgeSet.add('day4');
      if (wateringLog.some((w) => !w.skipped)) badgeSet.add('first_water');
      setUnlockedBadges(Array.from(badgeSet));
      setPreciseStage('report');
      return;
    }
    maybeSpawnAnomaly(newDay);
  }

  function handleShowTendency(scores){
    setTendencyScores(scores);
    setPreciseStage('tendency');
  }

  function handleStartRecommend(scores){
    setTendencyScores(scores);
    setRecAnswers({});
    setPreciseStage('recq');
  }

  function handleRecommendComplete(answers){
    setRecAnswers(answers);
    setPreciseStage('recommend');
  }

  function handleBackToReport(){
    setPreciseStage('report');
  }

  function handleShowQuickTendency(scores){
    setTendencyScores(scores);
    setQuickStage('tendency');
  }

  function handleBackToQuickResult(){
    setQuickStage('result');
  }

  function handleGoToPreciseFromQuick(){
    setActiveTab('precise');
    setPreciseStage('select');
  }

  function handleStartQuickRecommend(scores){
    setTendencyScores(scores);
    setRecAnswers({});
    setQuickStage('recq');
  }

  function handleQuickRecommendComplete(answers){
    setRecAnswers(answers);
    setQuickStage('recommend');
  }

  function handleBackToQuickResultFromRecommend(){
    setQuickStage('result');
  }

  function handleStartStarterKit(scores){
    setTendencyScores(scores);
    setPreciseStage('starterkit');
  }

  function handleGoToJournal(kit){
    setJournalKit(kit);
    setPreciseStage('journal');
  }

  function handleSelectGameMode(){
    setPreciseStage(lastGameStage);
  }

  function handleSelectJournalMode(){
    setJournalKit(null);
    setPreciseStage('journal-intro');
  }

  function handleBackToModeSelect(){
    setPreciseStage('mode-select');
  }

  function handleGoToQuickFromJournalIntro(){
    setActiveTab('quick');
  }

  function handleGoToStarterKitFromJournalIntro(){
    setPreciseStage('starterkit');
  }

  function handleNeedNewPlant(){
    setJournalKit(null);
    setPreciseStage('journal-intro');
  }

  function handleResetClick(){
    setResetConfirmOpen(true);
  }

  function handleCancelReset(){
    setResetConfirmOpen(false);
  }

  function handleConfirmReset(){
    if (preciseStage === 'journal') {
      // 식물 선택은 이제 StarterKit을 통해서만 가능하므로, 리셋 후에는 컴포넌트를
      // 그 자리에서 재마운트하는 대신 journal-intro로 내보내 새 추천을 받게 함.
      clearJournalState();
      setJournalKit(null);
      setPreciseStage('journal-intro');
    } else {
      setPreciseStage('select');
      setSelectedSpecies(null);
      setPlan(DEFAULT_PLAN);
      setDay(1);
      setAnomaly(null);
      setAnomalyStartDay(null);
      setResponseScore(100);
      setPoints(0);
      setCombo(0);
      setWateringLog([]);
      setStatusCheckedToday(false);
      setCheatMode(false);
      setUnlockedBadges([]);
      setAnomalyChecks(0);
      setTendencyScores(null);
      setRecAnswers({});
      setJournalKit(null);
      clearPreciseState();
    }
    setResetConfirmOpen(false);
  }

  return (
    <div className="app">
      <div className="hero">
        <span className="eyebrow">습관 분석 · 반려식물 매칭</span>
        <h1 className="display">나에게 맞는 식물, 습관으로 찾기</h1>
        <div className="tabs">
          <button className={`tab ${activeTab === 'quick' ? 'active' : ''}`} onClick={() => setActiveTab('quick')}>빠른 진단</button>
          <button className={`tab ${activeTab === 'precise' ? 'active' : ''}`} onClick={() => setActiveTab('precise')}>정밀 검사</button>
          {activeTab === 'precise' && preciseStage !== 'mode-select' && preciseStage !== 'journal-intro' && (
            <button className="guide-btn" style={{ marginLeft: 'auto' }} onClick={handleResetClick}>
              🔄 {preciseStage === 'journal' ? '저널 리셋하기' : '게임 리셋하기'}
            </button>
          )}
        </div>
      </div>
      <div className="body-wrap">
        {activeTab === 'quick' ? (
          <>
            {quickStage === 'intro' && <IntroScreen onStart={handleStart} />}
            {quickStage === 'question' && <HabitQuestionScreen onComplete={handleComplete} />}
            {quickStage === 'result' && (
              <HabitResultScreen
                answers={answers}
                onRetry={handleRetry}
                onTendency={handleShowQuickTendency}
                onRecommend={handleStartQuickRecommend}
              />
            )}
            {quickStage === 'tendency' && (
              <TendencyScreen
                scores={tendencyScores}
                source="quick"
                onBack={handleBackToQuickResult}
                onGoToPrecise={handleGoToPreciseFromQuick}
              />
            )}
            {quickStage === 'recq' && (
              <RecommendationQuestionScreen onComplete={handleQuickRecommendComplete} />
            )}
            {quickStage === 'recommend' && (
              <RecommendationResultScreen
                scores={tendencyScores}
                recAnswers={recAnswers}
                onBack={handleBackToQuickResultFromRecommend}
                source="quick"
              />
            )}
          </>
        ) : (
          <>
            {preciseStage === 'mode-select' && (
              <PreciseModeSelectScreen
                onSelectGame={handleSelectGameMode}
                onSelectJournal={handleSelectJournalMode}
              />
            )}
            {preciseStage === 'journal-intro' && (
              <JournalIntroScreen
                onGoToQuick={handleGoToQuickFromJournalIntro}
                onGoToStarterKit={handleGoToStarterKitFromJournalIntro}
              />
            )}
            {preciseStage === 'select' && (
              <SpeciesSelectScreen
                selectedSpecies={selectedSpecies}
                onSelect={handleSelectSpecies}
                onNext={handleNextToPlan}
              />
            )}
            {preciseStage === 'plan' && (
              <PlanSetupScreen
                plan={plan}
                onChangePlan={handleChangePlan}
                onStart={handleStartGame}
              />
            )}
            {preciseStage === 'playing' && (
              <DayScreen
                day={day}
                speciesId={selectedSpecies}
                anomaly={anomaly}
                points={points}
                combo={combo}
                plan={plan}
                wateringLog={wateringLog}
                cheatMode={cheatMode}
                onUnlockCheat={handleUnlockCheat}
                onCheckStatus={handleCheckStatus}
                onNextDay={handleNextDay}
                onSlotComplete={handleSlotComplete}
                onBackToModeSelect={handleBackToModeSelect}
              />
            )}
            {preciseStage === 'report' && (
              <ReportScreen
                points={points}
                responseScore={responseScore}
                wateringLog={wateringLog}
                anomalyChecks={anomalyChecks}
                unlockedBadges={unlockedBadges}
                badgeDefinitions={BADGE_DEFINITIONS}
                onTendency={handleShowTendency}
                onRecommend={handleStartRecommend}
                onStarterKit={handleStartStarterKit}
                onRestart={() => {
                  setPreciseStage('select');
                  setSelectedSpecies(null);
                  setPlan({ amount: 150, slotsPerDay: 2 });
                  setDay(1);
                  setAnomaly(null);
                  setAnomalyStartDay(null);
                  setResponseScore(100);
                  setPoints(0);
                  setCombo(0);
                  setWateringLog([]);
                  setStatusCheckedToday(false);
                  setCheatMode(false);
                  setUnlockedBadges([]);
                  setAnomalyChecks(0);
                  setTendencyScores(null);
                  setRecAnswers({});
                  setJournalKit(null);
                }}
              />
            )}
            {preciseStage === 'tendency' && (
              <TendencyScreen scores={tendencyScores} source="precise" onBack={handleBackToReport} />
            )}
            {preciseStage === 'recq' && (
              <RecommendationQuestionScreen onComplete={handleRecommendComplete} />
            )}
            {preciseStage === 'starterkit' && (
              <StarterKitScreen
                scores={tendencyScores}
                onBack={handleBackToReport}
                onStartJournal={handleGoToJournal}
              />
            )}
            {preciseStage === 'journal' && (
              <RealPlantJournalScreen
                presetSpeciesId={journalKit ? journalKit.plantId : null}
                scores={tendencyScores}
                onBackToModeSelect={handleBackToModeSelect}
                onNeedNewPlant={handleNeedNewPlant}
              />
            )}
            {preciseStage === 'recommend' && (
              <RecommendationResultScreen
                scores={tendencyScores}
                recAnswers={recAnswers}
                onBack={handleBackToReport}
              />
            )}
          </>
        )}
      </div>

      {resetConfirmOpen && (
        <div className="modal-overlay" onClick={handleCancelReset}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">정말 처음부터 다시 시작하시겠어요?</div>
            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 16 }}>
              지금까지 기록이 모두 사라져요.
            </div>
            <div className="center" style={{ gap: 8 }}>
              <button className="btn btn-outline" style={{ color: 'var(--ink)', borderColor: 'var(--line)' }} onClick={handleCancelReset}>
                취소
              </button>
              <button className="btn btn-dark" onClick={handleConfirmReset}>
                리셋하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
