'use client';

interface ReportToolbarProps {
    onSave: () => void;
    onReset: () => void;
    onExport: () => void;
    status: string;
}

export default function ReportToolbar({ onSave, onReset, onExport, status }: ReportToolbarProps) {
    return (
        <div style={{
            position: 'fixed',
            right: '20px',
            top: '80px',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '15px',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#374151', textAlign: 'center' }}>메뉴</h3>
            <button onClick={onSave} style={btnStyle}>💾 저장(Server)</button>
            <button onClick={onReset} style={btnStyle}>↩️ 변경취소</button>
            <button onClick={onExport} style={btnStyle}>📤 HTML 내보내기</button>
            <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', marginTop: '5px' }}>
                {status}
            </div>
        </div>
    );
}

const btnStyle = {
    padding: '10px 15px',
    cursor: 'pointer',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    background: '#f3f4f6',
    fontSize: '13px',
    fontWeight: '500',
    width: '100%',
    textAlign: 'left' as const,
    transition: 'all 0.2s'
};
