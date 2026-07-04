import React from 'react';
import { PLANTS, realPhoto } from '../../data/plants';
import { HABIT_QUESTIONS } from '../../data/habitQuestions';
import { saveState } from '../../utils/storage';

function calcUserScores(answers){
  const axes = { water:[], response:[], consistency:[] };
  HABIT_QUESTIONS.forEach(q=>{
    let val = answers && answers[q.id]==='yes' ? 1 : 0;
    if(q.reverse) val = 1-val;
    axes[q.axis].push(val);
  });
  const avg = arr => Math.round((arr.reduce((a,b)=>a+b,0)/arr.length)*100);
  return { water:avg(axes.water), response:avg(axes.response), consistency:avg(axes.consistency) };
}

function matchPlants(scores){
  const w = {water:.4, response:.3, consistency:.3};
  return PLANTS.map(p=>{
    const dist = Math.abs(scores.water-p.water)*w.water + Math.abs(scores.response-p.response)*w.response + Math.abs(scores.consistency-p.consistency)*w.consistency;
    return {...p, matchScore: Math.round(100-dist)};
  }).sort((a,b)=>b.matchScore-a.matchScore).slice(0,4);
}

function handleBuy(name){
  window.open(`https://www.coupang.com/np/search?q=${encodeURIComponent(name + ' 화분')}`, '_blank');
}

export default function HabitResultScreen({ answers, onRetry, onTendency, onRecommend }){
  const scores = calcUserScores(answers);
  const matched = matchPlants(scores);

  // persist summary
  saveState({ quick: { answers, completed: true, scores } });

  return (
    <div className="result-card">
      <div style={{fontFamily:'Sora', fontWeight:700, fontSize:18, marginBottom:14}}>당신의 습관 점수</div>
      <div className="axis-row">
        <div className="axis-box"><div className="lbl">물관리</div><div className="val">{scores.water}</div></div>
        <div className="axis-box"><div className="lbl">반응속도</div><div className="val">{scores.response}</div></div>
        <div className="axis-box"><div className="lbl">꾸준함</div><div className="val">{scores.consistency}</div></div>
      </div>
      <div style={{fontSize:11.5, color:'rgba(32,38,31,.6)', marginBottom:6}}>참고용 자기 진단이며, 실제 성향과 다를 수 있어요.</div>
      <div className="plant-grid">
        {matched.map(p=> (
          <div className="plant-card" key={p.id}>
            <img src={realPhoto(p.id)} alt={p.name} />
            <div className="pname">{p.name}</div>
            <div className="pmatch">매칭 {p.matchScore}%</div>
            <div className="plant-card-actions">
              <button className="btn btn-dark btn-small" onClick={() => handleBuy(p.name)}>🛒 구매</button>
            </div>
          </div>
        ))}
      </div>
      <div className="center" style={{ gap: 8, flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
          <button
            className="btn btn-outline"
            style={{ flex: 1, color: 'var(--ink)', borderColor: 'var(--line)' }}
            onClick={() => onTendency(scores)}
          >
            📊 내 성향분석
          </button>
          <button className="btn btn-dark" style={{ flex: 1 }} onClick={() => onRecommend(scores)}>
            🌿 식물 추천받기
          </button>
        </div>
        <button
          className="btn btn-outline"
          style={{ color: 'var(--ink)', borderColor: 'var(--line)', fontSize: 12, padding: '8px 16px' }}
          onClick={onRetry}
        >
          다시 하기
        </button>
      </div>
    </div>
  );
}
