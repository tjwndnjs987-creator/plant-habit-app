import React from 'react';
import { realPhoto } from '../../data/plants';
import { getTendencyType } from './TendencyScreen';

const STARTER_KITS = {
  neglect: {
    plantId: 'sansevieria',
    plantName: '산세베리아',
    kitName: '산세베리아 세트',
    items: ['식물', '화분', '배양토', '물뿌리개', '관리카드'],
  },
  overcare: {
    plantId: 'calathea',
    plantName: '칼라데아',
    kitName: '칼라데아 세트',
    items: ['식물', '화분', '배양토', '분무기', '습도계', '관리카드'],
  },
  observer: {
    plantId: 'orchid',
    plantName: '호접란',
    kitName: '호접란 세트',
    items: ['식물', '화분', '배양토', '영양제', '정밀관리가이드'],
  },
  routine: {
    plantId: 'fern',
    plantName: '보스턴고사리',
    kitName: '보스턴고사리 세트',
    items: ['식물', '화분', '배양토', '분무기', '관리카드'],
  },
  balanced: {
    plantId: 'hongkong',
    plantName: '홍콩야자',
    kitName: '홍콩야자 세트',
    items: ['식물', '화분', '배양토', '기본관리카드'],
  },
};

export default function StarterKitScreen({ scores, onBack, onStartJournal }) {
  const safeScores = scores || { water: 50, response: 50, consistency: 50 };
  const type = getTendencyType(safeScores);
  const kit = STARTER_KITS[type.id];

  function handleBuy() {
    window.open(`https://www.coupang.com/np/search?q=${encodeURIComponent(kit.plantName + ' 화분 세트')}`, '_blank');
  }

  return (
    <div className="result-card">
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <div style={{ fontSize: 15, color: 'var(--ink-soft)', marginBottom: 6 }}>당신의 타입({type.label})에 맞는</div>
        <div className="display" style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>🎁 Starter Kit 추천</div>
      </div>

      <div className="plant-grid">
        <div className="plant-card">
          <img src={realPhoto(kit.plantId)} alt={kit.plantName} />
          <div className="pname">{kit.kitName}</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 6, lineHeight: 1.5 }}>
            {kit.items.join(' · ')}
          </div>
        </div>
      </div>

      <div className="center" style={{ gap: 8, flexDirection: 'column' }}>
        <button className="btn btn-dark" style={{ width: '100%' }} onClick={handleBuy}>
          🛒 이 키트 구매하기
        </button>
        <button
          className="btn btn-outline"
          style={{ width: '100%', color: 'var(--ink)', borderColor: 'var(--line)' }}
          onClick={() => onStartJournal && onStartJournal(kit)}
        >
          🌱 이 식물, 실제로 키우기 시작
        </button>
        <button
          className="btn btn-outline"
          style={{ color: 'var(--ink)', borderColor: 'var(--line)', fontSize: 12, padding: '8px 16px' }}
          onClick={onBack}
        >
          리포트로 돌아가기
        </button>
      </div>
    </div>
  );
}
