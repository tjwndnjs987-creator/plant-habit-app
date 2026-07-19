import React from 'react';

export default function PreciseModeSelectScreen({ onSelectGame, onSelectJournal }) {
  return (
    <div>
      <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 17, marginBottom: 4 }}>어떻게 시작할까요?</div>
      <div style={{ fontSize: 12.5, color: 'rgba(243,241,232,.6)', marginBottom: 18 }}>
        가상으로 미리 체험해보거나, 실제로 키우는 식물을 기록할 수 있어요.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button className="btn btn-dark" style={{ padding: '18px 16px', fontSize: 14 }} onClick={onSelectGame}>
          🎮 가상으로 체험하기 (7일 게임)
        </button>
        <button
          className="btn btn-outline"
          style={{ padding: '18px 16px', fontSize: 14, color: 'var(--surface)' }}
          onClick={onSelectJournal}
        >
          🌱 실제로 키우며 기록하기
        </button>
      </div>
    </div>
  );
}
