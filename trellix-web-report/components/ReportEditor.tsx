'use client';

import { useState } from 'react';
import { Report, Section, InspectionItem } from '@/lib/storage';
import { updateReport } from '@/app/actions';
import ReportToolbar from './ReportToolbar';
import EditableCell from './EditableCell';
import { generateHtmlReport } from '@/lib/generator';
import CustomReportHeader from './CustomReportHeader';

interface ReportEditorProps {
    initialReport: Report;
}

export default function ReportEditor({ initialReport }: ReportEditorProps) {
    const [report, setReport] = useState<Report>(initialReport);
    const [status, setStatus] = useState('준비됨');

    const handleUpdateItem = (sectionId: string, itemId: string, field: keyof InspectionItem, value: any) => {
        setReport(prev => ({
            ...prev,
            sections: prev.sections.map(sec =>
                sec.id === sectionId
                    ? {
                        ...sec,
                        items: sec.items.map(item =>
                            item.id === itemId ? { ...item, [field]: value } : item
                        )
                    }
                    : sec
            )
        }));
        setStatus('수정됨 (저장 필요)');
    };

    const handleDeleteItem = (sectionId: string, itemId: string) => {
        if (!confirm('이 행을 삭제하시겠습니까?')) return;
        handleUpdateItem(sectionId, itemId, 'isDeleted', true);
    };

    const handleSave = async () => {
        setStatus('저장 중...');
        try {
            await updateReport(report);
            setStatus('저장 완료');
        } catch (e) {
            console.error(e);
            setStatus('저장 실패');
        }
    };

    const handleReset = () => {
        if (confirm('변경사항을 취소하고 마지막 저장 상태로 되돌리시겠습니까?')) {
            setReport(initialReport);
            setStatus('초기화 완료');
        }
    };

    const handleExport = () => {
        const html = generateHtmlReport(report);
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${report.id}.html`;
        a.click();
        setStatus('내보내기 완료 (Clean HTML)');
    };

    return (
        <main className="container">
            <ReportToolbar
                onSave={handleSave}
                onReset={handleReset}
                onExport={handleExport}
                status={status}
            />

            <header style={{ textAlign: 'center', padding: '20px' }}>
                <h1 style={{ fontSize: '22px', color: 'var(--header-bg)', margin: '10px 0' }}>
                    <EditableCell value={report.title} onChange={(v) => setReport({ ...report, title: v })} />
                </h1>
                <div style={{ fontSize: '1.1em', color: '#9ca3af' }}>
                    <EditableCell value={report.inspector} onChange={(v) => setReport({ ...report, inspector: v })} />
                </div>
            </header>

            {/* Custom Header for HX and CM and EX */}
            {(report.type === 'HX' || report.type === 'CM' || report.type === 'EX') && report.customInfo && (
                <CustomReportHeader
                    info={report.customInfo}
                    reportType={report.type || 'HX'}
                    onUpdate={(field, value) => {
                        setReport(prev => ({
                            ...prev,
                            customInfo: {
                                ...prev.customInfo!,
                                [field]: value
                            }
                        }));
                        setStatus('수정됨 (저장 필요)');
                    }}
                />
            )}

            <section>
                <table>
                    <thead>
                        <tr>
                            <th className="col-ab" colSpan={2} style={{ width: '28%', backgroundColor: '#3b82f6', color: 'white' }}>점 검 항 목</th>
                            <th className="col-c" style={{ width: '24%', backgroundColor: '#3b82f6', color: 'white' }}>판단 기준</th>
                            <th className="col-d" style={{ width: '33%', backgroundColor: '#3b82f6', color: 'white' }}>점검 결과</th>
                            <th className="col-e" style={{ width: '10%', backgroundColor: '#3b82f6', color: 'white' }}>점검 의견</th>
                            <th style={{ width: '5%', minWidth: '60px', backgroundColor: '#3b82f6', color: 'white' }}>삭제</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.sections.map(section => {
                            const visibleItems = section.items.filter(i => !i.isDeleted);
                            if (visibleItems.length === 0) return null;

                            return visibleItems.map((item, idx) => {
                                // Determine if we should show the Category cell
                                const prevItem = visibleItems[idx - 1];
                                const isSameCategoryAsPrev = prevItem && prevItem.category === item.category;

                                let categoryRowSpan = 0;
                                if (!isSameCategoryAsPrev) {
                                    let count = 1;
                                    for (let k = idx + 1; k < visibleItems.length; k++) {
                                        if (visibleItems[k].category === item.category) {
                                            count++;
                                        } else {
                                            break;
                                        }
                                    }
                                    categoryRowSpan = count;
                                }

                                return (
                                    <tr key={item.id}>
                                        {/* Section Title Cell - Only for first row */}
                                        {idx === 0 && (
                                            <td rowSpan={visibleItems.length} style={{ fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle' }}>
                                                {section.title}
                                            </td>
                                        )}

                                        {/* Category Name - Render only if it's the start of a group */}
                                        {!isSameCategoryAsPrev && (
                                            <td rowSpan={categoryRowSpan} style={{ verticalAlign: 'middle' }}>{item.category}</td>
                                        )}

                                        {/* Criteria */}
                                        <td style={{ whiteSpace: 'pre-wrap' }}>{item.criteria}</td>

                                        {/* Result */}
                                        <td data-editable="1">
                                            <EditableCell
                                                value={item.result ?? ''}
                                                onChange={(v) => handleUpdateItem(section.id, item.id, 'result', v)}
                                                multiline
                                            />
                                        </td>

                                        {/* Opinion */}
                                        <td data-editable="1">
                                            <EditableCell
                                                value={item.opinion ?? ''}
                                                onChange={(v) => handleUpdateItem(section.id, item.id, 'opinion', v)}
                                                multiline
                                            />
                                        </td>

                                        {/* Delete Button */}
                                        <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                            <button
                                                onClick={() => handleDeleteItem(section.id, item.id)}
                                                style={{
                                                    padding: '4px 8px',
                                                    background: '#fff',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    color: 'red'
                                                }}
                                            >
                                                삭제
                                            </button>
                                        </td>
                                    </tr>
                                );
                            });
                        })}
                    </tbody>
                </table>
            </section>
        </main >
    );
}
