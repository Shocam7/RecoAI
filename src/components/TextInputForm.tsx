import React, { useState } from 'react';

type Props = {
  onSubmit: (text: string) => Promise<void>;
  loading?: boolean;
};

export default function TextInputForm({ onSubmit, loading }: Props) {
  const [text, setText] = useState('');

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!text.trim()) return;
    await onSubmit(text.trim());
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your prompt here..."
        rows={6}
        style={{ width: '100%', padding: 8 }}
      />
      <div style={{ marginTop: 8 }}>
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Generate Playlist'}
        </button>
      </div>
    </form>
  );
}
