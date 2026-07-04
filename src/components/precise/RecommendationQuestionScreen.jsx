import React, { useState } from 'react';

const REC_QUESTIONS = [
  { key: 'light', q: '빛이 얼마나 들어오나요?', opts: [
    { v: 'sun', t: '해가 잘 들어요' }, { v: 'semi', t: '밝은 간접광' }, { v: 'shade', t: '빛이 부족해요' }] },
  { key: 'space', q: '어디에 두실 건가요?', opts: [
    { v: 'small', t: '책상·선반' }, { v: 'living', t: '거실' }] },
  { key: 'purpose', q: '가장 중요한 목적은요?', opts: [
    { v: 'air', t: '공기정화' }, { v: 'deco', t: '인테리어' }, { v: 'pet', t: '반려동물 안전' }, { v: 'succulent', t: '다육 수집' }] },
];

export default function RecommendationQuestionScreen({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const q = REC_QUESTIONS[step];
  const pct = Math.max(10, Math.round((step / REC_QUESTIONS.length) * 100));

  function handleAnswer(value) {
    const next = { ...answers, [q.key]: value };
    setAnswers(next);
    if (step + 1 >= REC_QUESTIONS.length) {
      onComplete(next);
    } else {
      setStep(step + 1);
    }
  }

  return (
    <div>
      <div className="progress-wrap">
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }}></div></div>
        <div className="progress-label">{step + 1} / {REC_QUESTIONS.length}</div>
      </div>
      <div className="q-card">
        <div className="q-text">{q.q}</div>
        <div className="yn-row" style={{ flexWrap: 'wrap' }}>
          {q.opts.map((o) => (
            <button
              key={o.v}
              className="yn-btn"
              style={{ color: 'var(--ink)', flex: '1 1 40%' }}
              onClick={() => handleAnswer(o.v)}
            >
              {o.t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
