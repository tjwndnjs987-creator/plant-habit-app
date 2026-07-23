import React, { useEffect, useRef, useState } from 'react';
import { PLANTS, realPhoto } from '../../data/plants';
import ReportScreen from './ReportScreen';
import GoalSettingScreen from './GoalSettingScreen';
import { loadJournalState, saveJournalState, clearJournalState } from '../../utils/storage';
import { computeWaterAxis, computeResponseAxis, computeConsistencyAxis, isGoalAchieved } from '../../utils/journalScoring';

const SYMPTOM_OPTIONS = [
  { id: 'spot', label: '반점' },
  { id: 'yellow_spot', label: '노란 반점' },
  { id: 'bug', label: '벌레' },
  { id: 'wilt', label: '마름' },
];
const CAUSE_OPTIONS = ['과습', '물부족', '고온', '저온', '광부족', '광과다'];
const SOLUTION_OPTIONS = ['약 구매', '물 줄이기', '물 늘리기', '장소 바꾸기'];
const SYMPTOM_DRUG_QUERY = {
  spot: '식물 살균제',
  yellow_spot: '식물 살균제',
  bug: '식물 살충제',
  wilt: '식물 영양제',
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function symptomLabel(id) {
  const found = SYMPTOM_OPTIONS.find((s) => s.id === id);
  return found ? found.label : id;
}

function resizeImageFile(file, maxDim = 480, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width >= height && width > maxDim) {
          height = Math.round(height * (maxDim / width));
          width = maxDim;
        } else if (height > width && height > maxDim) {
          width = Math.round(width * (maxDim / height));
          height = maxDim;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('이미지를 불러오지 못했어요'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('파일을 읽지 못했어요'));
    reader.readAsDataURL(file);
  });
}

function createEmptyJournal(speciesId) {
  return {
    speciesId: speciesId || null,
    photo: null,
    waterLogs: [],
    issueLogs: [],
    goals: null, // null = 아직 목표 설정 전, [] 이상 = 설정 완료
    startedAt: new Date().toISOString(),
    ended: false,
    endReason: null,
  };
}

function deriveView(journal) {
  if (!journal.speciesId) return 'select-species';
  if (journal.goals === null || journal.goals === undefined) return 'goal-setting';
  return 'main';
}

export default function RealPlantJournalScreen({ presetSpeciesId, scores, onBackToModeSelect }) {
  const [journal, setJournal] = useState(() => {
    const saved = loadJournalState();
    if (saved && !saved.ended) {
      const hasRecords = (saved.waterLogs && saved.waterLogs.length > 0) || (saved.issueLogs && saved.issueLogs.length > 0);
      // 아직 아무 기록도 없는 빈 저널이면 StarterKit에서 고른 식물로 덮어써도 안전함.
      // 실제 기록이 있는 저널은 절대 조용히 버리지 않고 그대로 이어감.
      if (hasRecords || !presetSpeciesId || saved.speciesId === presetSpeciesId) {
        return saved;
      }
      return createEmptyJournal(presetSpeciesId);
    }
    return createEmptyJournal(presetSpeciesId || null);
  });
  const [view, setView] = useState(() => deriveView(journal));
  const [reportMode, setReportMode] = useState(null); // null | 'preview' | 'final'
  const [waterModalOpen, setWaterModalOpen] = useState(false);
  const [waterAmount, setWaterAmount] = useState(150);
  const [issueStep, setIssueStep] = useState(null); // null | 'symptom' | 'search' | 'cause' | 'solution'
  const [issueDraft, setIssueDraft] = useState(null);
  const [endModalOpen, setEndModalOpen] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    saveJournalState(journal);
  }, [journal]);

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(''), 1800);
  }

  const species = PLANTS.find((p) => p.id === journal.speciesId);

  function handleSelectSpecies(id) {
    setJournal((prev) => ({ ...prev, speciesId: id }));
    setView('goal-setting');
  }

  function handleStartGoals(goals) {
    setJournal((prev) => ({ ...prev, goals }));
    setView('main');
  }

  function handleToggleCustomGoal(goalId) {
    setJournal((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === goalId ? { ...g, manuallyCompleted: !g.manuallyCompleted } : g)),
    }));
  }

  async function handlePhotoChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImageFile(file);
      setJournal((prev) => ({ ...prev, photo: dataUrl }));
      showToast('사진을 저장했어요 🌿');
    } catch (err) {
      showToast('사진을 저장하지 못했어요');
    }
    e.target.value = '';
  }

  function openWaterModal() {
    setWaterAmount(150);
    setWaterModalOpen(true);
  }
  function confirmWater() {
    setJournal((prev) => ({
      ...prev,
      waterLogs: [...prev.waterLogs, { date: todayStr(), amount: waterAmount }],
    }));
    setWaterModalOpen(false);
    showToast('물주기를 기록했어요 💧');
  }

  function startIssueFlow() {
    setIssueDraft({ symptom: null, searched: false, cause: null, solution: null });
    setIssueStep('symptom');
  }
  function chooseSymptom(id) {
    setIssueDraft((prev) => ({ ...prev, symptom: id }));
    setIssueStep('search');
  }
  function handleSearchClick() {
    const query = `식물 ${symptomLabel(issueDraft.symptom)} 원인 및 해결방안`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    setIssueDraft((prev) => ({ ...prev, searched: true }));
  }
  function chooseCause(cause) {
    setIssueDraft((prev) => ({ ...prev, cause }));
    setIssueStep('solution');
  }
  function chooseSolution(solution) {
    const finalDraft = { ...issueDraft, solution };
    setJournal((prev) => ({
      ...prev,
      issueLogs: [...prev.issueLogs, { date: todayStr(), ...finalDraft }],
    }));
    if (solution === '약 구매') {
      const query = SYMPTOM_DRUG_QUERY[finalDraft.symptom] || '식물 영양제';
      window.open(`https://www.coupang.com/np/search?q=${encodeURIComponent(query)}`, '_blank');
    }
    setIssueStep(null);
    setIssueDraft(null);
    showToast('이상 발견 기록을 저장했어요 🔍');
  }
  function cancelIssueFlow() {
    setIssueStep(null);
    setIssueDraft(null);
  }

  function computeScores() {
    const water = computeWaterAxis(journal.waterLogs, journal.speciesId);
    const response = computeResponseAxis(journal.issueLogs);
    const consistency = computeConsistencyAxis(journal.waterLogs, journal.issueLogs);
    return { water, response, consistency };
  }

  function finishJournal(reason) {
    setJournal((prev) => ({ ...prev, ended: true, endReason: reason }));
    setEndModalOpen(false);
    setReportMode('final');
  }

  function handleStartNewPlant() {
    clearJournalState();
    setJournal(createEmptyJournal(null));
    setReportMode(null);
    setView('select-species');
  }

  // ---- 식물 선택 ----
  if (view === 'select-species') {
    return (
      <div>
        <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 17, marginBottom: 4 }}>
          실제로 키우는 식물을 선택해주세요
        </div>
        <div style={{ fontSize: 12.5, color: 'rgba(243,241,232,.6)', marginBottom: 14 }}>
          21종 중에서 골라주세요.
        </div>
        <div className="plant-grid">
          {PLANTS.map((p) => (
            <div key={p.id} className="plant-card" style={{ cursor: 'pointer' }} onClick={() => handleSelectSpecies(p.id)}>
              <img src={realPhoto(p.id)} alt={p.name} />
              <div className="pname" style={{ color: 'var(--ink)' }}>{p.name}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---- 목표 설정 ----
  if (view === 'goal-setting') {
    return <GoalSettingScreen scores={scores} onStart={handleStartGoals} />;
  }

  // ---- 리포트 (미리보기 또는 종료 결과) ----
  if (reportMode) {
    const { water, response, consistency } = computeScores();
    const precomputedScores = { water: water.value, response: response.value, consistency: consistency.value };
    const axisLabels = {
      water: water.insufficient ? '아직 계산할 데이터가 부족해요' : water.label,
      response: response.insufficient ? '아직 계산할 데이터가 부족해요' : undefined,
      consistency: consistency.insufficient ? '아직 계산할 데이터가 부족해요' : undefined,
    };
    const isFinal = reportMode === 'final';
    const outcomeTitleMap = {
      thrived: `${species ? species.name : '식물'}, 정말 잘 키우셨어요! 🎉`,
      died: '여기까지의 기록을 정리했어요',
      other: '여기까지의 기록을 정리했어요',
    };
    const title = isFinal ? (outcomeTitleMap[journal.endReason] || '지금까지의 기록이에요') : '지금까지의 기록이에요';

    return (
      <ReportScreen
        wateringLog={journal.waterLogs}
        anomalyChecks={journal.issueLogs.length}
        precomputedScores={precomputedScores}
        axisLabels={axisLabels}
        title={title}
        summaryText="이 결과는 확정된 진단이 아니라, 실제 기록을 바탕으로 한 참고 자료예요."
        showCelebrate={isFinal && journal.endReason === 'thrived'}
        restartLabel={isFinal ? '🌱 새 식물 시작하기' : '저널로 돌아가기'}
        onRestart={isFinal ? handleStartNewPlant : () => setReportMode(null)}
      />
    );
  }

  // ---- 메인 저널 화면 ----
  const totalRecords = journal.waterLogs.length + journal.issueLogs.length;
  const records = [
    ...journal.waterLogs.map((w) => ({ ...w, type: 'water' })),
    ...journal.issueLogs.map((l) => ({ ...l, type: 'issue' })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));
  const goalAxes = computeScores();
  const goals = journal.goals || [];

  return (
    <div>
      <div className="day-head" style={{ marginBottom: 10 }}>
        <div className="dnum">{species ? species.name : '내 식물'}</div>
        <button className="guide-btn" onClick={onBackToModeSelect}>🔄 다른 모드 보기</button>
      </div>

      <div className="journal-photo-wrap">
        {journal.photo ? (
          <img
            src={journal.photo}
            alt={species ? species.name : '내 식물'}
            className="journal-photo"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          />
        ) : (
          <div className="journal-photo-placeholder" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
            📷 탭해서 화분 사진 올리기
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
      </div>
      {journal.photo && (
        <div className="center" style={{ marginTop: -8, marginBottom: 8 }}>
          <button className="guide-btn" onClick={() => fileInputRef.current && fileInputRef.current.click()}>📷 사진 바꾸기</button>
        </div>
      )}

      <div className="status-row">
        <button className="status-btn" style={{ color: 'var(--ink)' }} onClick={openWaterModal}>💧 물주기 완료</button>
        <button className="status-btn" style={{ color: 'var(--ink)' }} onClick={startIssueFlow}>🔍 이상 발견</button>
      </div>

      {goals.length > 0 && (
        <>
          <div className="section-title" style={{ color: 'rgba(243,241,232,.85)' }}>내 목표</div>
          <div className="journal-record-list">
            {goals.map((g) => {
              const achieved = isGoalAchieved(g, goalAxes);
              return (
                <div className="journal-record-item" key={g.id}>
                  <span>{achieved ? '✅' : '⬜'} {g.label}</span>
                  {g.type === 'custom' && (
                    <button className="guide-btn" onClick={() => handleToggleCustomGoal(g.id)}>
                      {achieved ? '취소' : '달성했어요'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {journal.waterLogs.length >= 2 && (
        <div className="center" style={{ marginBottom: 8 }}>
          <button
            className="btn btn-outline"
            style={{ color: 'var(--surface)', borderColor: 'var(--line-dark)', width: '100%' }}
            onClick={() => setReportMode('preview')}
          >
            📊 리포트 보기
          </button>
        </div>
      )}

      <div className="section-title" style={{ marginTop: 16, color: 'rgba(243,241,232,.85)' }}>기록 ({totalRecords})</div>
      <div className="journal-record-list">
        {records.map((r, i) => (
          <div className="journal-record-item" key={i}>
            <span className="rdate">{r.date}</span>
            {r.type === 'water' ? (
              <span>💧 물주기 {r.amount}ml</span>
            ) : (
              <span>🔍 {symptomLabel(r.symptom)} · {r.cause || '원인 미상'} · {r.solution || '-'} {r.searched ? '(검색함)' : ''}</span>
            )}
          </div>
        ))}
        {totalRecords === 0 && (
          <div style={{ fontSize: 12, color: 'rgba(243,241,232,.6)', textAlign: 'center', padding: '10px 0' }}>
            아직 기록이 없어요. 물을 주거나 이상을 발견하면 기록해주세요.
          </div>
        )}
      </div>

      <div className="center">
        <button
          className="btn btn-outline"
          style={{ color: 'var(--surface)', borderColor: 'var(--line-dark)', fontSize: 12, padding: '8px 16px' }}
          onClick={() => setEndModalOpen(true)}
        >
          이 식물 키우기 종료
        </button>
      </div>

      {waterModalOpen && (
        <div className="modal-overlay" onClick={() => setWaterModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">얼마나 줬나요?</div>
            <div className="center" style={{ marginTop: 0, marginBottom: 16 }}>
              <div className="stepper">
                <button onClick={() => setWaterAmount((v) => Math.max(10, v - 10))}>−</button>
                <span className="num">{waterAmount}ml</span>
                <button onClick={() => setWaterAmount((v) => v + 10)}>+</button>
              </div>
            </div>
            <div style={{ textAlign: 'center', fontSize: 13.5, marginBottom: 16 }}>{waterAmount}ml 물주기를 기록할까요?</div>
            <div className="center" style={{ gap: 8 }}>
              <button className="btn btn-outline" style={{ color: 'var(--ink)', borderColor: 'var(--line)' }} onClick={() => setWaterModalOpen(false)}>취소</button>
              <button className="btn btn-dark" onClick={confirmWater}>완료</button>
            </div>
          </div>
        </div>
      )}

      {issueStep && (
        <div className="modal-overlay" onClick={cancelIssueFlow}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            {issueStep === 'symptom' && (
              <>
                <div className="modal-title">어떤 증상인가요?</div>
                <div className="yn-row" style={{ flexWrap: 'wrap' }}>
                  {SYMPTOM_OPTIONS.map((s) => (
                    <button key={s.id} className="yn-btn" style={{ color: 'var(--ink)', flex: '1 1 40%' }} onClick={() => chooseSymptom(s.id)}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </>
            )}
            {issueStep === 'search' && (
              <>
                <div className="modal-title">원인을 찾아볼까요?</div>
                <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 14 }}>
                  "식물 {symptomLabel(issueDraft.symptom)} 원인 및 해결방안"을 검색해보세요.
                </div>
                <div className="center" style={{ marginTop: 0, flexDirection: 'column', gap: 8 }}>
                  <button className="btn btn-dark" style={{ width: '100%' }} onClick={handleSearchClick}>
                    🔎 '식물 {symptomLabel(issueDraft.symptom)} 원인 및 해결방안' 구글에 검색하기
                  </button>
                  <button className="btn btn-outline" style={{ color: 'var(--ink)', borderColor: 'var(--line)', width: '100%' }} onClick={() => setIssueStep('cause')}>
                    다음
                  </button>
                </div>
              </>
            )}
            {issueStep === 'cause' && (
              <>
                <div className="modal-title">원인이 뭐라고 생각하세요?</div>
                <div className="yn-row" style={{ flexWrap: 'wrap' }}>
                  {CAUSE_OPTIONS.map((c) => (
                    <button key={c} className="yn-btn" style={{ color: 'var(--ink)', flex: '1 1 40%' }} onClick={() => chooseCause(c)}>
                      {c}
                    </button>
                  ))}
                </div>
              </>
            )}
            {issueStep === 'solution' && (
              <>
                <div className="modal-title">어떻게 해결할까요?</div>
                <div className="yn-row" style={{ flexWrap: 'wrap' }}>
                  {SOLUTION_OPTIONS.map((s) => (
                    <button key={s} className="yn-btn" style={{ color: 'var(--ink)', flex: '1 1 40%' }} onClick={() => chooseSolution(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}
            <div className="center">
              <button className="btn btn-outline" style={{ color: 'var(--ink)', borderColor: 'var(--line)', fontSize: 12 }} onClick={cancelIssueFlow}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {endModalOpen && (
        <div className="modal-overlay" onClick={() => setEndModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">어떻게 되셨나요?</div>
            <div className="yn-row" style={{ flexWrap: 'wrap' }}>
              <button className="yn-btn" style={{ color: 'var(--ink)', flex: '1 1 40%' }} onClick={() => finishJournal('thrived')}>🌿 잘 자람</button>
              <button className="yn-btn" style={{ color: 'var(--ink)', flex: '1 1 40%' }} onClick={() => finishJournal('died')}>💀 죽음</button>
              <button className="yn-btn" style={{ color: 'var(--ink)', flex: '1 1 40%' }} onClick={() => finishJournal('other')}>🤷 다른 이유로 그만둠</button>
            </div>
            <div className="center">
              <button className="btn btn-outline" style={{ color: 'var(--ink)', borderColor: 'var(--line)', fontSize: 12 }} onClick={() => setEndModalOpen(false)}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}
