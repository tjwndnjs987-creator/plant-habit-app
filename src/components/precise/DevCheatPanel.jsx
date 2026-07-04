import React, { useState } from 'react';

export default function DevCheatPanel({ cheatMode, onUnlock }) {
  const [inputValue, setInputValue] = useState('');
  const [message, setMessage] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const ok = onUnlock(inputValue);
    if (ok) {
      setMessage('치트모드 활성화');
      setInputValue('');
    } else {
      setMessage('비밀번호가 올바르지 않습니다.');
    }
  }

  return (
    <div className="dev-cheat-panel">
      <div className="dev-cheat-title">🛠 개발자 치트</div>
      <form className="dev-cheat-form" onSubmit={handleSubmit}>
        <input
          type="password"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="비밀번호 입력"
          className="dev-cheat-input"
        />
        <button type="submit" className="dev-cheat-btn">치트모드 전환</button>
      </form>
      <div className="dev-cheat-status">
        {cheatMode ? '현재: 치트모드' : '현재: 원래 모드'}
      </div>
      {message ? <div className="dev-cheat-message">{message}</div> : null}
    </div>
  );
}
