'use client';

import { useState } from 'react';
import { Report, Section, InspectionItem } from '@/lib/storage';
import { updateReport } from '@/app/actions';
import ReportToolbar from './ReportToolbar';
import EditableCell from './EditableCell';
import { generateHtmlReport } from '@/lib/generator';
import CustomReportHeader from './CustomReportHeader';
import { THEME_COLORS } from '@/lib/constants';
import { getResultStatus, formatResultText, parseCriteriaText } from '@/lib/reportUtils';

interface ReportEditorProps {
    initialReport: Report;
}

export default function ReportEditor({ initialReport }: ReportEditorProps) {
    const [report, setReport] = useState<Report>(initialReport);
    const [status, setStatus] = useState('준비됨');

    const defaultTheme = THEME_COLORS;
    const currentTheme = report.themeConfig || defaultTheme;

    const handleThemeChange = (newTheme: { primary: string; secondary: string }) => {
        setReport(prev => ({ ...prev, themeConfig: newTheme }));
        setStatus('수정됨 (저장 필요)');
    };

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
                themeConfig={currentTheme}
                onThemeChange={handleThemeChange}
            />

            <header style={{
                textAlign: 'center',
                padding: '30px',
                backgroundColor: currentTheme.primary,
                color: 'white',
                borderBottom: `3px solid ${currentTheme.border}`,
                marginBottom: '30px'
            }}>
                <h1 style={{ fontSize: '28px', fontWeight: 600, margin: 0 }}>
                    <EditableCell value={report.title} onChange={(v) => setReport({ ...report, title: v })} />
                </h1>
                <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '8px' }}>
                    <EditableCell value={report.inspector} onChange={(v) => setReport({ ...report, inspector: v })} />
                </div>
            </header>

            {(report.type === 'HX' || report.type === 'CM' || report.type === 'EX') && report.customInfo && (
                <CustomReportHeader
                    info={report.customInfo}
                    reportType={report.type || 'HX'}
                    themeOverride={currentTheme}
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
                            <th style={{ width: '15%', backgroundColor: currentTheme.secondary, color: 'white' }}>항목</th>
                            <th style={{ width: '15%', backgroundColor: currentTheme.secondary, color: 'white' }}>점검 항목</th>
                            <th style={{ width: '25%', backgroundColor: currentTheme.secondary, color: 'white' }}>판단 기준</th>
                            <th style={{ width: '20%', backgroundColor: currentTheme.secondary, color: 'white' }}>점검 결과</th>
                            <th style={{ width: '20%', backgroundColor: currentTheme.secondary, color: 'white' }}>점검 결과 및 의견</th>
                            <th style={{ width: '5%', minWidth: '60px', backgroundColor: currentTheme.secondary, color: 'white' }}>삭제</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.sections.map(section => {
                            const visibleItems = section.items.filter(i => !i.isDeleted);
                            if (visibleItems.length === 0) return null;

                            return visibleItems.map((item, idx) => {
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
                                        {idx === 0 && (
                                            <td rowSpan={visibleItems.length} style={{
                                                verticalAlign: 'middle',
                                                fontWeight: 'bold',
                                                textAlign: 'center',
                                                backgroundColor: currentTheme.primary,
                                                color: 'white'
                                            }}>
                                                {section.title}
                                            </td>
                                        )}

                                        {!isSameCategoryAsPrev && (
                                            <td rowSpan={categoryRowSpan} style={{
                                                verticalAlign: 'middle',
                                                backgroundColor: report.type === 'EX' ? currentTheme.primary : '#f8fafc',
                                                color: report.type === 'EX' ? 'white' : 'inherit',
                                                fontWeight: report.type === 'EX' ? 'bold' : 'normal',
                                                textAlign: 'center'
                                            }}>
                                                {item.category}
                                            </td>
                                        )}

                                        <td style={{ verticalAlign: 'middle' }}>
                                            {(() => {
                                                const { main, command } = parseCriteriaText(item.criteria || '');
                                                return (
                                                    <>
                                                        <div style={{ whiteSpace: 'pre-wrap' }}>{main}</div>
                                                        {command && (
                                                            <div style={{
                                                                fontFamily: 'monospace',
                                                                fontSize: '11px',
                                                                color: '#94a3b8',
                                                                marginTop: '4px',
                                                                paddingTop: '2px',
                                                                borderTop: '1px dashed #e2e8f0'
                                                            }}>
                                                                {command}
                                                            </div>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </td>

                                        <td data-editable="1" style={
                                            report.type === 'EX'
                                                ? { backgroundColor: currentTheme.tertiary, color: currentTheme.text }
                                                : getResultStatus(item.result || '') === 'issue'
                                                    ? { backgroundColor: '#fff4e6', color: '#000000ff' }
                                                    : { backgroundColor: '#fff4e6', color: '#000000ff' }
                                        }>
                                            <div style={{ fontWeight: '500' }}>
                                                <EditableCell
                                                    value={formatResultText(item.result || '')}
                                                    onChange={(v) => handleUpdateItem(section.id, item.id, 'result', v)}
                                                    multiline
                                                    renderDisplay={(val) => (
                                                        <div>
                                                            {val.split('\n').map((line, i) => {
                                                                const trimmed = line.trim();
                                                                const isOverall = trimmed.toLowerCase().startsWith('overall');
                                                                return (
                                                                    <div key={i} style={isOverall ? { fontWeight: 'bold' } : {}}>
                                                                        {trimmed}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                />
                                            </div>
                                        </td>

                                        <td data-editable="1">
                                            <EditableCell
                                                value={item.opinion ?? ''}
                                                onChange={(v) => handleUpdateItem(section.id, item.id, 'opinion', v)}
                                                multiline
                                            />
                                        </td>

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
