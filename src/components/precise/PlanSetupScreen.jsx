import React from 'react';

export default function PlanSetupScreen({ plan, onChangePlan, onStart }) {
  return (
    <div>
      <div style={{fontFamily:'Sora',fontWeight:700,fontSize:17,marginBottom:4}}>물주기 계획을 직접 세워보세요</div>
      <div style={{fontSize:12.5,color:'rgba(243,241,232,.6)',marginBottom:14}}>정답을 알려드리지 않아요. 매일 최소 2번(아침·저녁) 급수 타이밍이 주어져요 — 스스로 얼마나 지키는지가 관찰 포인트예요.</div>
      <div className="plan-form">
        <div className="form-row">
          <span>하루에 몇 번 줄까요? (최소 2번)</span>
          <div className="stepper">
            <button onClick={() => onChangePlan('slotsPerDay', -1)} disabled={plan.slotsPerDay <= 2}>−</button>
            <span className="num">{plan.slotsPerDay}회</span>
            <button onClick={() => onChangePlan('slotsPerDay', 1)}>+</button>
          </div>
        </div>
        <div className="form-row">
          <span>한 번에 몇 ml를 줄까요?</span>
          <div className="stepper">
            <button onClick={() => onChangePlan('amount', -10)} disabled={plan.amount <= 1}>−</button>
            <span className="num">{plan.amount}ml</span>
            <button onClick={() => onChangePlan('amount', 10)}>+</button>
          </div>
        </div>
      </div>
      <div className="center">
        <button className="btn btn-dark" onClick={onStart}>7일 시작하기</button>
      </div>
    </div>
  );
}
