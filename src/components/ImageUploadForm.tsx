import React, { useRef } from 'react';

type Props = {
  onSubmit: (file: File) => Promise<void>;
  loading?: boolean;
};

export default function ImageUploadForm({ onSubmit, loading }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) onSubmit(f);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        disabled={loading}
      />
      <p style={{ marginTop: 8 }}>
        Tip: Use your camera or pick an image from gallery.
      </p>
    </div>
  );
}
