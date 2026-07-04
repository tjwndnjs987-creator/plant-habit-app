import React, { useState, useEffect } from 'react';
import { HABIT_QUESTIONS } from '../../data/habitQuestions';
import { saveState, loadState } from '../../utils/storage';

export default function HabitQuestionScreen({ onComplete }){
  const saved = loadState();
  const initIndex = saved && saved.quick && typeof saved.quick.qIndex === 'number' ? saved.quick.qIndex : 0;
  const initAnswers = saved && saved.quick && saved.quick.answers ? saved.quick.answers : {};

  const [qIndex, setQIndex] = useState(initIndex);
  const [answers, setAnswers] = useState(initAnswers);

  useEffect(()=>{
    // persist quick part
    saveState({ quick: { answers, qIndex } });
  }, [answers, qIndex]);

  const q = HABIT_QUESTIONS[qIndex];
  if(!q) return onComplete && onComplete(answers);

  function answerYes(){
    const next = { ...answers, [q.id]: 'yes' };
    setAnswers(next);
    setQIndex(qIndex+1);
  }
  function answerNo(){
    const next = { ...answers, [q.id]: 'no' };
    setAnswers(next);
    setQIndex(qIndex+1);
  }

  return (
    <div>
      <div className="progress-wrap">
        <div className="progress-bar"><div className="progress-fill" style={{width: Math.max(8, Math.round((qIndex/HABIT_QUESTIONS.length)*100)) + '%'}}></div></div>
        <div className="progress-label">{qIndex+1} / {HABIT_QUESTIONS.length} · 약 {Math.max(1, Math.round((HABIT_QUESTIONS.length-qIndex)*2))}초 남았어요</div>
      </div>
      <div className="q-card">
        <div className="q-text">{q.text}</div>
        <div className="yn-row">
          <button className="yn-btn yes" onClick={answerYes}>그렇다</button>
          <button className="yn-btn no" onClick={answerNo}>아니다</button>
        </div>
      </div>
    </div>
  );
}
