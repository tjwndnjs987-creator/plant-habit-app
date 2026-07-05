import React, { useState, useEffect, useRef } from 'react';
import { PLANTS } from '../../data/plants';
import DevCheatPanel from './DevCheatPanel';
import { getLastDayAdvanceTime, setLastDayAdvanceTime } from '../../utils/storage';

const DAY_ADVANCE_COOLDOWN_MS = 24 * 60 * 60 * 1000;

const MOOD_LINES = {
  1: ['이제 막 흙을 뚫고 나왔어요', '아직은 여리여리해요'],
  2: ['조금씩 잎이 늘고 있어요', '자라는 재미가 있죠?'],
  3: ['제법 풍성해졌어요', '뿌리도 든든히 자리잡았어요'],
  4: ['이제 다 자란 것 같아요', '정말 멋지게 자랐어요 🌿'],
};

const SLOT_NAMES = ['아침', '저녁', '밤'];
const SLOT_FILL_RATE_BASE = 300;
const SLOT_FILL_MS = 3600;

function getGrowthStage(day) {
  if (day <= 5) return 1;
  if (day <= 11) return 2;
  if (day <= 17) return 3;
  return 4;
}

function stateFolder(anomaly) {
  if (anomaly === 'spot') return 'spotted';
  if (anomaly === 'bug') return 'bugs';
  if (anomaly === 'edge') return 'edge';
  return 'clean';
}

function getMoodLine(stage) {
  const arr = MOOD_LINES[stage] || MOOD_LINES[1];
  return arr[Math.floor(Math.random() * arr.length)];
}

function SlotCard({ slotIndex, slotName, planAmount, wateringLog, day, onSlotComplete, cheatMode, currentHour, slotStartHour, slotEndHour }) {
  const [fillAmount, setFillAmount] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const fillIntervalRef = useRef(null);
  const canRef = useRef(null);

  const isDone = wateringLog.some(w => w.day === day && w.slot === slotIndex && !w.skipped);
  const doneRecord = wateringLog.find(w => w.day === day && w.slot === slotIndex && !w.skipped);
  const isOpen = cheatMode || day === 1 || (currentHour >= slotStartHour && currentHour < slotEndHour);
  const lockMessage = !cheatMode && day !== 1 && !isOpen ? `${slotStartHour}시부터 가능해요` : null;

  const startFill = (e) => {
    e.preventDefault();
    setIsHolding(true);
    setFillAmount(0);
    if (canRef.current) {
      canRef.current.classList.add('holding');
    }

    const stepMs = 30;
    const stepAmt = SLOT_FILL_RATE_BASE / (SLOT_FILL_MS / stepMs);

    fillIntervalRef.current = setInterval(() => {
      setFillAmount(prev => prev + stepAmt);
    }, stepMs);
  };

  const stopFill = () => {
    if (fillIntervalRef.current) {
      clearInterval(fillIntervalRef.current);
      fillIntervalRef.current = null;
    }
    setIsHolding(false);
    if (canRef.current) {
      canRef.current.classList.remove('holding');
    }

    if (fillAmount > 3) {
      onSlotComplete(slotIndex, fillAmount);
      setFillAmount(0);
    }
  };

  const handleMouseDown = startFill;
  const handleMouseUp = stopFill;
  const handleMouseLeave = () => {
    if (isHolding) {
      stopFill();
    }
  };
  const handleTouchStart = startFill;
  const handleTouchEnd = stopFill;

  if (isDone) {
    return (
      <div className="slot-card done">
        ✅ {slotName} · {Math.round(doneRecord.amount)}ml
      </div>
    );
  }

  const visualMax = planAmount * 1.5;
  const gaugeWidth = Math.min(100, (fillAmount / visualMax) * 100);
  const markerLeft = Math.min(96, (planAmount / visualMax) * 100);

  return (
    <div className={`slot-card ${!isOpen ? 'disabled' : ''}`}>
      <div className="slot-label">{slotName} 급수</div>
      <div className="fill-wrap">
        <div className="fill-can" ref={canRef}>
          🪣
        </div>
        <div className="fill-gauge-track">
          <div className="fill-marker" style={{ left: `${markerLeft}%` }}></div>
          <div className="fill-gauge-fill" style={{ width: `${gaugeWidth}%` }}></div>
        </div>
        <div className="fill-amount">{Math.round(fillAmount)}ml</div>
        <button
          className="fill-btn"
          disabled={!isOpen}
          onMouseDown={isOpen ? handleMouseDown : undefined}
          onMouseUp={isOpen ? handleMouseUp : undefined}
          onMouseLeave={isOpen ? handleMouseLeave : undefined}
          onTouchStart={isOpen ? handleTouchStart : undefined}
          onTouchEnd={isOpen ? handleTouchEnd : undefined}
        >
          {isOpen ? '누르고 있으면 물이 채워져요' : `${slotStartHour}시부터 가능해요`}
        </button>
        {lockMessage ? <div className="dev-cheat-message">{lockMessage}</div> : null}
      </div>
    </div>
  );
}

export default function DayScreen({
  day,
  speciesId,
  anomaly,
  points,
  combo,
  plan,
  wateringLog,
  cheatMode,
  onUnlockCheat,
  onCheckStatus,
  onNextDay,
  onSlotComplete,
}) {
  const [stageChanged, setStageChanged] = useState(false);
  const [moodLine, setMoodLine] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [toast, setToast] = useState('');
  const toastTimerRef = useRef(null);

  useEffect(() => {
    setMoodLine(getMoodLine(getGrowthStage(day)));
  }, [day]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30 * 1000);
    return () => clearInterval(timer);
  }, []);

  const stage = getGrowthStage(day);
  const folder = stateFolder(anomaly);
  const plant = PLANTS.find(p => p.id === speciesId);
  const imageSrc = `/assets/images/plant_${folder}/${speciesId}_${stage}.png`;
  const currentHour = new Date().getHours();
  const slotCount = plan.slotsPerDay || 2;
  const slotWindow = 12 / slotCount;
  const startHour = 10;

  const lastDayAdvanceTime = getLastDayAdvanceTime();
  const msUntilNextDay = lastDayAdvanceTime ? Math.max(0, lastDayAdvanceTime + DAY_ADVANCE_COOLDOWN_MS - now) : 0;
  const canAdvanceDay = cheatMode || msUntilNextDay <= 0;
  const remainingHours = Math.floor(msUntilNextDay / (60 * 60 * 1000));
  const remainingMinutes = Math.floor((msUntilNextDay % (60 * 60 * 1000)) / (60 * 1000));

  function handleNextDayClick(){
    setLastDayAdvanceTime(Date.now());
    onNextDay();
  }

  function handleStatusCheck(guess){
    const actual = anomaly || 'none';
    const correct = guess === actual;
    let message;
    if (correct && actual !== 'none') {
      message = '✓ 회복됐어요';
    } else if (!correct) {
      message = '✗ 아닌 것 같아요';
    } else {
      message = '정상이에요';
    }
    setToast(message);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(''), 1800);
    onCheckStatus(guess);
  }

  return (
    <div className="day-screen">
      <div className="day-head">
        <div className="dnum">Day {day} / 21</div>
        <div style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>
          {plant?.name}
        </div>
      </div>

      <div className="stat-bar">
        <span className="stat-pts">⭐ {points}점</span>
        {combo >= 2 ? <span className="stat-combo">🔥 {combo}콤보</span> : <span></span>}
      </div>

      {day === 1 && (
        <div className="hint-line">
          💡 매일 화분을 살펴보고 상태를 체크해주세요. 이상이 없으면 "이상없음"을 눌러도 돼요. 급수는 하루 {plan.slotsPerDay}번, 각 타이밍마다 따로 챙겨야 해요.
        </div>
      )}

      <div className="plant-stage">
        <svg
          className="water-drop-anim"
          id="dropAnim"
          viewBox="0 0 20 24"
        >
          <path
            d="M10 0 C10 8 2 10 2 16 A8 8 0 0 0 18 16 C18 10 10 8 10 0Z"
            fill="#5EC8E8"
          />
        </svg>
        <img
          id="plantImg"
          src={imageSrc}
          alt={plant?.name}
          className={stageChanged ? 'pop' : ''}
          style={{ maxWidth: '150px', maxHeight: '150px' }}
        />
      </div>

      <div className="mood-line">"{moodLine}"</div>

      <div className="section-title-row">
        <div className="section-title" style={{ marginBottom: 0 }}>🔍 오늘 상태를 살펴보고 체크해주세요</div>
        <button type="button" className="guide-btn" onClick={() => setShowGuide(true)}>❓ 구분법 보기</button>
      </div>
      <div className="status-row">
        <button
          className="status-btn"
          onClick={() => handleStatusCheck('none')}
        >
          이상없음
        </button>
        <button
          className="status-btn"
          onClick={() => handleStatusCheck('spot')}
        >
          반점
        </button>
        <button
          className="status-btn"
          onClick={() => handleStatusCheck('edge')}
        >
          마름
        </button>
        <button
          className="status-btn"
          onClick={() => handleStatusCheck('bug')}
        >
          벌레
        </button>
      </div>

      <div className="section-title">💧 오늘의 급수 (하루 {plan.slotsPerDay}번)</div>
      <div id="slotsWrap">
        {Array.from({ length: plan.slotsPerDay }, (_, i) => {
          const slotStartHour = Math.floor(startHour + i * slotWindow);
          const slotEndHour = Math.floor(startHour + (i + 1) * slotWindow);
          return (
            <SlotCard
              key={i}
              slotIndex={i}
              slotName={SLOT_NAMES[i] || `추가${i + 1}`}
              planAmount={plan.amount}
              wateringLog={wateringLog}
              day={day}
              cheatMode={cheatMode}
              currentHour={currentHour}
              slotStartHour={slotStartHour}
              slotEndHour={slotEndHour}
              onSlotComplete={onSlotComplete}
            />
          );
        })}
      </div>

      <DevCheatPanel cheatMode={cheatMode} onUnlock={onUnlockCheat} />

      {!canAdvanceDay && (
        <div className="hint-line">
          🌙 내일 다시 와주세요 ({remainingHours}시간 {remainingMinutes}분 남음)
        </div>
      )}
      <div className="center">
        <button
          className="btn btn-outline"
          style={{ color: 'var(--ink)', borderColor: 'var(--line)' }}
          onClick={handleNextDayClick}
          disabled={!canAdvanceDay}
        >
          다음 날 →
        </button>
      </div>

      {showGuide && (
        <div className="modal-overlay" onClick={() => setShowGuide(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">이상 증상 구분법 (참고용 예시)</div>
            <div className="guide-grid">
              <div className="guide-item">
                <img src="/assets/images/plant_spotted/monstera_3.png" alt="반점 예시" />
                <div className="guide-label">반점</div>
                <div className="guide-desc">잎에 둥근 갈색 얼룩 하나가 생겨요</div>
              </div>
              <div className="guide-item">
                <img src="/assets/images/plant_bugs/monstera_3.png" alt="벌레 예시" />
                <div className="guide-label">벌레</div>
                <div className="guide-desc">작은 검은 점 여러 개가 뭉쳐서 나타나요</div>
              </div>
              <div className="guide-item">
                <img src="/assets/images/plant_edge/monstera_3.png" alt="마름 예시" />
                <div className="guide-label">마름</div>
                <div className="guide-desc">잎 가장자리 테두리가 갈색으로 변해요</div>
              </div>
            </div>
            <div className="modal-note">오늘 이 화분의 정답이 아니라, 세 증상이 일반적으로 어떻게 다르게 생겼는지 보여주는 참고 예시예요.</div>
            <div className="center"><button className="btn btn-dark" onClick={() => setShowGuide(false)}>닫기</button></div>
          </div>
        </div>
      )}

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}
