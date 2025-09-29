'use client';

export default function LoadingSpinner({ size = 40, text }: { size?: number, text?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: size + 32, width: size + 32 }}>
      <div style={{
        border: `${size / 8}px solid #e3eafc`,
        borderTop: `${size / 8}px solid #1976d2`,
        borderRadius: '50%',
        width: size,
        height: size,
        animation: 'spin 1s linear infinite'
      }} />
      {text && <div style={{ marginTop: 12, color: '#1976d2', fontWeight: 500, fontSize: 16, textAlign: 'center' }}>{text}</div>}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 