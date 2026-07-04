import React from 'react';

export default function IntroScreen({ onStart }){
  return (
    <div className="intro-wrap">
      <span className="intro-emoji">🌱</span>
      <div className="intro-title">당신도 모르는 당신의 식물 습관</div>
      <div className="intro-desc">물을 자주 깜빡하나요, 아니면 너무 자주 챙기나요?<br/>당신의 습관에 꼭 맞는 식물을 찾아드릴게요.</div>
      <div className="intro-steps">
        <div className="intro-step"><span className="n">1</span><span><b>빠른 진단</b> — 25가지 질문에 3분이면 답하고 바로 추천받아요</span></div>
        <div className="intro-step"><span className="n">2</span><span><b>정밀 검사</b> — 21일간 가상 식물을 키우며 진짜 습관을 관찰해요</span></div>
        <div className="intro-step"><span className="n">3</span><span>결과에 맞는 식물과 구매·관리 방법까지 안내해드려요</span></div>
      </div>
      <div className="center"><button className="btn btn-dark" onClick={onStart}>시작할게요 🌿</button></div>
    </div>
  );
}
