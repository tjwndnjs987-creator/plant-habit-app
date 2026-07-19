import React from 'react';

// TODO: STEP 3에서 실제 식물 기록 기능 구현 예정. 지금은 자리만 잡아둔 화면.
export default function RealPlantJournalScreen({ kit, onBack }) {
  return (
    <div className="result-card">
      <div style={{ textAlign: 'center' }}>
        <div className="display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
          🌱 실제 식물 키우기 기록
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 18, lineHeight: 1.6 }}>
          {kit ? `${kit.kitName} 기록 화면을 준비 중이에요.` : '기록 화면을 준비 중이에요.'} 곧 만나요!
        </div>
      </div>
      <div className="center">
        <button
          className="btn btn-outline"
          style={{ color: 'var(--ink)', borderColor: 'var(--line)' }}
          onClick={onBack}
        >
          돌아가기
        </button>
      </div>
    </div>
  );
}
