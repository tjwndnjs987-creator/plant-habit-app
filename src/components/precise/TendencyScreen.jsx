import React from 'react';

const LOW = 34;
const HIGH = 66;

const TENDENCY_TYPES = [
  { id: 'neglect',
    match: (s) => s.water <= LOW && s.consistency <= LOW,
    label: '느긋한 방치형 🌵',
    desc: `물관리 ${LOW}점 이하 + 꾸준함 ${LOW}점 이하: 물 주는 걸 자주 잊고 루틴도 잘 안 지키는 편이에요. 방치형 식물과 찰떡궁합이에요.`,
    careTip: '물 주기를 완전히 잊기 쉬우니, 휴대폰 캘린더 알림을 꼭 설정해두세요.' },
  { id: 'overcare',
    match: (s) => s.water >= HIGH && s.consistency >= HIGH,
    label: '다정한 과보호형 💧',
    desc: `물관리 ${HIGH}점 이상 + 꾸준함 ${HIGH}점 이상: 자주, 꾸준히 챙기는 편이에요. 다소 손이 가는 식물도 잘 키울 수 있어요.`,
    careTip: '물을 너무 자주 줘서 뿌리가 썩을 수 있어요, 흙이 마른 걸 확인하고 주는 습관을 들이세요.' },
  { id: 'observer',
    match: (s) => s.response >= HIGH,
    label: '예민한 관찰형 🔍',
    desc: `반응속도 ${HIGH}점 이상: 작은 변화도 빠르게 알아채는 편이에요. 예민한 식물도 문제없어요.`,
    careTip: '장점이 확실하니, 그 관찰력을 살려 병충해 초기 징후를 놓치지 마세요.' },
  { id: 'routine',
    match: (s) => s.consistency >= HIGH,
    label: '꾸준한 루틴형 📅',
    desc: `꾸준함 ${HIGH}점 이상: 정해둔 루틴을 잘 지키는 편이에요. 정기 관리가 필요한 식물이 잘 맞아요.`,
    careTip: '루틴이 깨졌을 때 스트레스받지 말고, 하루 이틀 늦어도 괜찮다는 걸 기억하세요.' },
  { id: 'balanced',
    match: () => true,
    label: '균형잡힌 무난형 🌿',
    desc: '세 축 모두 뚜렷하게 치우치지 않는 편이에요. 웬만한 식물과 무난하게 잘 맞아요.',
    careTip: '특별히 조심할 건 없지만, 새 식물을 들일 때마다 그 식물만의 특성은 한 번씩 확인해보세요.' },
];

function getTendencyType(scores) {
  return TENDENCY_TYPES.find((t) => t.match(scores));
}

const RECOMMENDED_PRODUCTS = [
  { id: 'auto-timer', name: '자동 물주기 타이머', url: 'https://www.coupang.com/vp/products/8316139235?itemId=24000164859&vendorItemId=91021031552' },
  { id: 'self-watering-pot', name: '저수형 스마트 화분', url: 'https://www.coupang.com/vp/products/7548498562?itemId=19859887890&vendorItemId=88343428797' },
  { id: 'overwater-guard-pot', name: '과습방지 화분', url: 'https://www.coupang.com/vp/products/8609200129?itemId=24968681304&vendorItemId=91974298566' },
];

export default function TendencyScreen({ scores, onBack, source = 'precise', onGoToPrecise }) {
  const type = getTendencyType(scores);

  return (
    <div className="result-card">
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 15, color: 'var(--ink-soft)', marginBottom: 6 }}>당신의 타입은</div>
        <div className="display" style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>{type.label}</div>
        <div style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 12 }}>{type.desc}</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink)', lineHeight: 1.6, marginBottom: 18, background: 'var(--surface2)', borderRadius: 10, padding: '10px 12px' }}>
          🌱 {type.careTip}
        </div>
      </div>
      <div className="axis-row">
        <div className="axis-box"><div className="lbl">물관리</div><div className="val">{Math.round(scores.water)}</div></div>
        <div className="axis-box"><div className="lbl">반응속도</div><div className="val">{Math.round(scores.response)}</div></div>
        <div className="axis-box"><div className="lbl">꾸준함</div><div className="val">{Math.round(scores.consistency)}</div></div>
      </div>

      {source === 'quick' ? (
        <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginBottom: 16, lineHeight: 1.6 }}>
          이 결과는 25문항에 스스로 답한 자기진단이에요. 실제 행동은 다를 수 있어요. 7일 정밀검사를 해보면 진짜 습관을 더 정확히 알 수 있어요.
        </div>
      ) : (
        <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginBottom: 16 }}>7일간의 관찰을 바탕으로 한 참고용 분석이에요.</div>
      )}

      <div className="center" style={{ gap: 8, flexDirection: 'column' }}>
        {source === 'quick' && (
          <button className="btn btn-dark" onClick={onGoToPrecise}>정밀검사 해보기</button>
        )}
        <button
          className={source === 'quick' ? 'btn btn-outline' : 'btn btn-dark'}
          style={source === 'quick' ? { color: 'var(--ink)', borderColor: 'var(--line)' } : undefined}
          onClick={onBack}
        >
          {source === 'quick' ? '결과로 돌아가기' : '리포트로 돌아가기'}
        </button>
      </div>

      <div className="section-title" style={{ marginTop: 20 }}>🛒 이런 용품도 도움이 돼요</div>
      <div className="plant-grid">
        {RECOMMENDED_PRODUCTS.map((product) => (
          <div key={product.id} className="plant-card">
            <div className="pname">{product.name}</div>
            <button
              className="btn btn-dark btn-small"
              style={{ width: '100%', marginTop: 8 }}
              onClick={() => window.open(product.url, '_blank')}
            >
              구매하기
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
