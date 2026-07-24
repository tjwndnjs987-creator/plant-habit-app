import React from 'react';

export default function JournalIntroScreen({ onGoToQuick, onGoToStarterKit }) {
  return (
    <div>
      <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 17, marginBottom: 4 }}>
        실제로 식물을 키우기 전에
      </div>
      <div style={{ fontSize: 12.5, color: 'rgba(243,241,232,.6)', marginBottom: 18, lineHeight: 1.6 }}>
        실제로 식물을 키우려면 먼저 나에게 맞는 식물을 추천받아보세요.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button className="btn btn-dark" style={{ padding: '18px 16px', fontSize: 14 }} onClick={onGoToQuick}>
          📊 빠른진단 하러 가기
        </button>
        <button
          className="btn btn-outline"
          style={{ padding: '18px 16px', fontSize: 14, color: 'var(--surface)', borderColor: 'var(--line-dark)' }}
          onClick={onGoToStarterKit}
        >
          🎁 이미 리포트가 있다면 Starter Kit 보기
        </button>
      </div>
    </div>
  );
}
