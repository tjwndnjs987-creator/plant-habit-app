import React, { useState } from 'react';
import { getTendencyType } from './TendencyScreen';

const GOAL_TEMPLATES = [
  { id: 'interval', type: 'interval', label: '물 주기 간격 일정하게 유지하기' },
  { id: 'response', type: 'response', label: '이상 발견하면 바로 확인하기(검색해보기)' },
  { id: 'consistency', type: 'consistency', label: '꾸준히 기록하기(공백 없이)' },
];

export default function GoalSettingScreen({ scores, onStart }) {
  const [selected, setSelected] = useState({});
  const [customEnabled, setCustomEnabled] = useState(false);
  const [customText, setCustomText] = useState('');

  const safeScores = scores || { water: 50, response: 50, consistency: 50 };
  const type = getTendencyType(safeScores);

  function toggle(id) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleStart() {
    const goals = GOAL_TEMPLATES.filter((g) => selected[g.id]).map((g) => ({
      id: g.id,
      type: g.type,
      label: g.label,
      manuallyCompleted: false,
    }));
    if (customEnabled && customText.trim()) {
      goals.push({
        id: `custom-${Date.now()}`,
        type: 'custom',
        label: customText.trim(),
        manuallyCompleted: false,
      });
    }
    onStart(goals);
  }

  return (
    <div className="result-card">
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 15, color: 'var(--ink-soft)', marginBottom: 6 }}>당신은</div>
        <div className="display" style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>{type.label}</div>
        <div
          style={{
            fontSize: 12.5,
            color: 'var(--ink)',
            lineHeight: 1.6,
            background: 'var(--surface2)',
            borderRadius: 10,
            padding: '10px 12px',
            textAlign: 'left',
          }}
        >
          🌱 {type.careTip}
        </div>
      </div>

      <div className="section-title">이번엔 어떤 목표를 세울까요?</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
        {GOAL_TEMPLATES.map((g) => (
          <label
            key={g.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'var(--surface2)',
              borderRadius: 10,
              padding: '10px 12px',
              cursor: 'pointer',
              fontSize: 13,
              color: 'var(--ink)',
            }}
          >
            <input type="checkbox" checked={!!selected[g.id]} onChange={() => toggle(g.id)} />
            {g.label}
          </label>
        ))}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--surface2)',
            borderRadius: 10,
            padding: '10px 12px',
            cursor: 'pointer',
            fontSize: 13,
            color: 'var(--ink)',
          }}
        >
          <input type="checkbox" checked={customEnabled} onChange={(e) => setCustomEnabled(e.target.checked)} />
          직접 목표 만들기
        </label>
        {customEnabled && (
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="나만의 목표를 입력해주세요"
            className="dev-cheat-input"
            style={{ width: '100%' }}
          />
        )}
      </div>

      <div className="center">
        <button className="btn btn-dark" style={{ width: '100%' }} onClick={handleStart}>
          시작하기
        </button>
      </div>
    </div>
  );
}
