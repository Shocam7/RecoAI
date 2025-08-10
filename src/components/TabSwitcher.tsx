import React from 'react';

type Props = {
  active: 'text' | 'visual';
  onChange: (v: 'text' | 'visual') => void;
};

export default function TabSwitcher({ active, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        onClick={() => onChange('text')}
        style={{
          padding: '8px 12px',
          borderRadius: 6,
          border: active === 'text' ? '2px solid #111' : '1px solid #ccc',
          background: active === 'text' ? '#f3f3f3' : 'white'
        }}
      >
        Text
      </button>
      <button
        onClick={() => onChange('visual')}
        style={{
          padding: '8px 12px',
          borderRadius: 6,
          border: active === 'visual' ? '2px solid #111' : '1px solid #ccc',
          background: active === 'visual' ? '#f3f3f3' : 'white'
        }}
      >
        Visual
      </button>
    </div>
  );
}
