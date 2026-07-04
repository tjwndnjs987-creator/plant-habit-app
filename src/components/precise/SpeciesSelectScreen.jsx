import React from 'react';
import { PLANTS } from '../../data/plants';

const GAME_SPECIES_IDS = ['stucky','zz','echeveria','pothos','philodendron','monstera'];
const GAME_PLANTS = PLANTS.filter(p => GAME_SPECIES_IDS.includes(p.id));

export default function SpeciesSelectScreen({ selectedSpecies, onSelect, onNext }) {
  return (
    <div>
      <div style={{fontFamily:'Sora',fontWeight:700,fontSize:17,marginBottom:4}}>키울 식물을 골라주세요</div>
      <div style={{fontSize:12.5,color:'rgba(243,241,232,.6)',marginBottom:14}}>21일 동안 이 식물을 관찰할 거예요 (게임용 대표 6종)</div>
      <div className="plant-select-grid">
        {GAME_PLANTS.map(p => (
          <div
            key={p.id}
            className={`plant-select ${selectedSpecies === p.id ? 'sel' : ''}`}
            onClick={() => onSelect(p.id)}
          >
            <img src={`/assets/images/plant_clean/${p.id}_2.png`} alt={p.name} />
            <div className="pn">{p.name}</div>
          </div>
        ))}
      </div>
      <div className="center">
        <button className="btn btn-dark" disabled={!selectedSpecies} onClick={onNext}>다음</button>
      </div>
    </div>
  );
}
