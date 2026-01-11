import React from 'react';
import { CustomReportInfo } from '@/lib/storage';
import EditableCell from './EditableCell';

import { THEME_COLORS } from '@/lib/constants';

interface CustomReportHeaderProps {
    info: CustomReportInfo;
    reportType: string;
    onUpdate: (field: keyof CustomReportInfo, value: any) => void;
    themeOverride?: { primary: string; secondary: string };
}

export default function CustomReportHeader({ info, reportType, onUpdate, themeOverride }: CustomReportHeaderProps) {
    const handleNestedUpdate = (section: keyof CustomReportInfo, key: string, value: string, index?: number) => {
        if (index !== undefined && Array.isArray(info[section])) {
            const newArray = [...(info[section] as any[])];
            newArray[index] = { ...newArray[index], [key]: value };
            onUpdate(section, newArray);
        } else {
            onUpdate(section, {
                ...(info[section] as any),
                [key]: value
            });
        }
    };

    // Style constants based on report type
    // All types now base off THEME_COLORS, but we keep logic if needed for future divergence
    const getTheme = (type: string) => {
        const base = THEME_COLORS;

        if (themeOverride) {
            return {
                ...base,
                ...themeOverride
            };
        }
        return base;
    };

    const theme = getTheme(reportType);

    // Helper to normalize data to arrays for rendering
    const systems = Array.isArray(info.system) ? info.system : [info.system];
    const licenses = Array.isArray(info.license) ? info.license : [info.license];

    // ✅ 빈 feature 제거 + 최소 1행 보장(데이터가 정말 없을 때 표 형태 유지)
    const normalizeFeatures = (features?: string[]) => {
        const cleaned = (Array.isArray(features) ? features : [])
            .map(f => (f ?? '').trim())
            .filter(f => f.length > 0);

        return cleaned.length > 0 ? cleaned : [''];
    };

    // ✅ "라이선스 정보" 좌측 TH rowSpan 계산 (헤더 1행 + 전체 feature 행 수)
    const totalLicenseRows = licenses.reduce((sum, lic) => sum + normalizeFeatures((lic as any)?.features).length, 0);

    return (
        <div style={{ marginBottom: '30px' }}>
            {/* Confirmation Title */}
            <div style={{
                textAlign: 'center',
                fontSize: '20px',
                fontWeight: 600,
                margin: '0 0 25px 0',
                padding: '15px',
                backgroundColor: theme.secondary,
                color: 'white',
                borderRadius: '6px',
                borderLeft: `4px solid ${theme.border}`
            }}>
                정기점검 확인서
            </div>

            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '30px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                overflow: 'hidden',
                fontSize: '14px',
                tableLayout: 'fixed'
            }}>
                <colgroup>
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '30%' }} />
                </colgroup>
                <tbody>
                    {/* Customer Info */}
                    <tr>
                        <th rowSpan={4} style={{ backgroundColor: theme.primary, color: 'white', width: '100px', padding: '12px', border: '1px solid #cbd5e1' }}>고객사</th>
                        <th style={{ backgroundColor: theme.tertiary, color: theme.text, padding: '12px', border: '1px solid #cbd5e1' }}>고객사명</th>
                        <td colSpan={2} style={{ padding: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                            <EditableCell value={info.customer.name} onChange={(v) => handleNestedUpdate('customer', 'name', v)} />
                        </td>
                        <th style={{ backgroundColor: theme.tertiary, color: theme.text, padding: '12px', border: '1px solid #cbd5e1' }}>확인자</th>
                        <td style={{ padding: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}></td>
                    </tr>
                    <tr>
                        <th style={{ backgroundColor: theme.tertiary, color: theme.text, padding: '12px', border: '1px solid #cbd5e1' }}>지원회사명</th>
                        <td colSpan={2} style={{ padding: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                            <EditableCell value={info.customer.support} onChange={(v) => handleNestedUpdate('customer', 'support', v)} />
                        </td>
                        <th style={{ backgroundColor: theme.tertiary, color: theme.text, padding: '12px', border: '1px solid #cbd5e1' }}>점검자</th>
                        <td style={{ padding: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                            <EditableCell value={info.customer.inspector} onChange={(v) => handleNestedUpdate('customer', 'inspector', v)} />
                        </td>
                    </tr>
                    <tr>
                        <th style={{ backgroundColor: theme.tertiary, color: theme.text, padding: '12px', border: '1px solid #cbd5e1' }}>점검일자</th>
                        <td colSpan={2} style={{ padding: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                            <EditableCell value={info.customer.date} onChange={(v) => handleNestedUpdate('customer', 'date', v)} />
                        </td>
                        <th style={{ backgroundColor: theme.tertiary, color: theme.text, padding: '12px', border: '1px solid #cbd5e1' }}>TEL</th>
                        <td style={{ padding: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                            <EditableCell value={info.customer.phone} onChange={(v) => handleNestedUpdate('customer', 'phone', v)} />
                        </td>
                    </tr>
                    <tr>
                        <th style={{ backgroundColor: theme.tertiary, color: theme.text, padding: '12px', border: '1px solid #cbd5e1' }}>점검구분</th>
                        <td colSpan={2} style={{ padding: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                            <EditableCell value={info.customer.type} onChange={(v) => handleNestedUpdate('customer', 'type', v)} multiline />
                        </td>
                        <th style={{ backgroundColor: theme.tertiary, color: theme.text, padding: '12px', border: '1px solid #cbd5e1' }}>추가 사항</th>
                        <td style={{ padding: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                            <EditableCell value={info.customer.note} onChange={(v) => handleNestedUpdate('customer', 'note', v)} />
                        </td>
                    </tr>

                    {/* System Info */}
                    <tr>
                        <th rowSpan={systems.length + 1} style={{ backgroundColor: theme.primary, color: 'white', padding: '12px', border: '1px solid #cbd5e1' }}>시스템<br />정보</th>
                        <th style={{ backgroundColor: theme.tertiary, color: theme.text, padding: '12px', border: '1px solid #cbd5e1' }}>제품명</th>
                        <th style={{ backgroundColor: theme.tertiary, color: theme.text, padding: '12px', border: '1px solid #cbd5e1' }}>장비명</th>
                        <th style={{ backgroundColor: theme.tertiary, color: theme.text, padding: '12px', border: '1px solid #cbd5e1' }}>버전정보</th>
                        <th style={{ backgroundColor: theme.tertiary, color: theme.text, padding: '12px', border: '1px solid #cbd5e1' }}>고객사</th>
                        <th style={{ backgroundColor: theme.tertiary, color: theme.text, padding: '12px', border: '1px solid #cbd5e1' }}>용도</th>
                    </tr>
                    {systems.map((sys, idx) => (
                        <tr key={`sys-${idx}`}>
                            <td style={{ padding: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                                <EditableCell value={sys.product} onChange={(v) => handleNestedUpdate('system', 'product', v, idx)} />
                            </td>
                            <td style={{ padding: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                                <EditableCell value={sys.equipment} onChange={(v) => handleNestedUpdate('system', 'equipment', v, idx)} />
                            </td>
                            <td style={{ padding: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                                <EditableCell value={sys.version} onChange={(v) => handleNestedUpdate('system', 'version', v, idx)} />
                            </td>
                            <td style={{ padding: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                                <EditableCell value={sys.customer} onChange={(v) => handleNestedUpdate('system', 'customer', v, idx)} />
                            </td>
                            <td style={{ padding: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                                <EditableCell value={sys.usage} onChange={(v) => handleNestedUpdate('system', 'usage', v, idx)} />
                            </td>
                        </tr>
                    ))}

                    {/* License Info */}
                    <tr>
                        {/* ✅ 동적 rowSpan */}
                        <th rowSpan={totalLicenseRows + 1} style={{ backgroundColor: theme.primary, color: 'white', padding: '12px', border: '1px solid #cbd5e1' }}>
                            라이선스<br />정보
                        </th>
                        <th style={{ backgroundColor: theme.tertiary, color: theme.text, padding: '12px', border: '1px solid #cbd5e1' }}>Appliance</th>
                        <th style={{ backgroundColor: theme.tertiary, color: theme.text, padding: '12px', border: '1px solid #cbd5e1' }}>Serial Number</th>
                        <th style={{ backgroundColor: theme.tertiary, color: theme.text, padding: '12px', border: '1px solid #cbd5e1' }}>
                            {reportType === 'HX' ? 'Appliance ID' : 'MAC ID'}
                        </th>
                        <th style={{ backgroundColor: theme.tertiary, color: theme.text, padding: '12px', border: '1px solid #cbd5e1' }}>End Date</th>
                        <th style={{ backgroundColor: theme.tertiary, color: theme.text, padding: '12px', border: '1px solid #cbd5e1' }}>Feature</th>
                    </tr>

                    {/* ✅ features 길이만큼만 렌더링 (빈 줄 삭제됨) */}
                    {licenses.map((lic, idx) => {
                        const features = normalizeFeatures((lic as any)?.features);

                        return (
                            <React.Fragment key={`lic-${idx}`}>
                                {features.map((feature, fIdx) => (
                                    <tr key={`lic-${idx}-f-${fIdx}`}>
                                        {fIdx === 0 && (
                                            <>
                                                <td
                                                    rowSpan={features.length}
                                                    style={{ padding: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff', verticalAlign: 'middle', textAlign: 'center' }}
                                                >
                                                    <EditableCell value={(lic as any).appliance} onChange={(v) => handleNestedUpdate('license', 'appliance', v, idx)} />
                                                </td>
                                                <td
                                                    rowSpan={features.length}
                                                    style={{ padding: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff', verticalAlign: 'middle', textAlign: 'center' }}
                                                >
                                                    <EditableCell value={(lic as any).serial} onChange={(v) => handleNestedUpdate('license', 'serial', v, idx)} />
                                                </td>
                                                <td
                                                    rowSpan={features.length}
                                                    style={{ padding: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff', verticalAlign: 'middle', textAlign: 'center' }}
                                                >
                                                    <EditableCell value={(lic as any).id} onChange={(v) => handleNestedUpdate('license', 'id', v, idx)} />
                                                </td>
                                            </>
                                        )}

                                        <td style={{ padding: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                                            {fIdx === 0 ? (
                                                <EditableCell value={(lic as any).endDate} onChange={(v) => handleNestedUpdate('license', 'endDate', v, idx)} />
                                            ) : (
                                                (lic as any).endDate
                                            )}
                                        </td>

                                        <td style={{ padding: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                                            {feature}
                                        </td>
                                    </tr>
                                ))}

                                {/* Separator row if multiple devices */}
                                {idx < licenses.length - 1 && (
                                    <tr>
                                        <td colSpan={5} style={{ height: '10px', backgroundColor: '#f1f5f9' }}></td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}

                    {/* Summary */}
                    <tr>
                        <th style={{ backgroundColor: theme.primary, color: 'white', padding: '12px', border: '1px solid #cbd5e1' }}>점검 종합의견</th>
                        <td colSpan={5} style={{ padding: '15px', border: '1px solid #cbd5e1', backgroundColor: '#fff', lineHeight: '1.7', textAlign: 'left' }}>
                            <EditableCell value={info.summary.result} onChange={(v) => handleNestedUpdate('summary', 'result', v)} multiline />
                            <br />
                            <EditableCell value={info.summary.note} onChange={(v) => handleNestedUpdate('summary', 'note', v)} multiline />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
