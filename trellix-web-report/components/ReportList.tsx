'use client';

import Link from 'next/link';
import { Report } from '@/lib/storage';
import { deleteReportAction } from '@/app/actions';
import { useTransition } from 'react';

interface ReportListProps {
    reports: Report[];
}

export default function ReportList({ reports }: ReportListProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.preventDefault(); // Prevent Link navigation
        if (confirm('정말로 이 보고서를 삭제하시겠습니까?')) {
            startTransition(async () => {
                await deleteReportAction(id);
            });
        }
    };

    if (reports.length === 0) {
        return <p style={{ color: '#6b7280', padding: '20px 0' }}>등록된 보고서가 없습니다.</p>;
    }

    return (
        <ul style={{ listStyle: 'none', padding: 0 }}>
            {reports.map(report => (
                <li key={report.id} style={{ marginBottom: '10px' }}>
                    <div
                        style={{
                            display: 'block',
                            padding: '15px 20px',
                            background: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            position: 'relative'
                        }}
                    >
                        <Link
                            href={`/reports/${report.id}`}
                            style={{
                                textDecoration: 'none',
                                color: 'inherit',
                                display: 'block'
                            }}
                        >
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '4px' }}>{report.title}</div>
                            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                                작성자: {report.inspector} | 작성일: {new Date(report.createdAt).toLocaleDateString()}
                            </div>
                        </Link>

                        <button
                            onClick={(e) => handleDelete(e, report.id)}
                            disabled={isPending}
                            style={{
                                position: 'absolute',
                                right: '20px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                padding: '8px 12px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                opacity: isPending ? 0.7 : 1
                            }}
                        >
                            {isPending ? '삭제 중...' : '삭제'}
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
}
