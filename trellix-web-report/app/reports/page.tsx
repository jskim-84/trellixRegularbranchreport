import { getReportsByGroupType, getReports } from '@/lib/storage';
import Link from 'next/link';
import ReportList from '@/components/ReportList';

interface PageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ReportsPage({ searchParams }: PageProps) {
    // Await searchParams as required in Next.js 15+ (though we are on 14, it's safe practice or might be required if strict)
    // Actually in Next 14 it's not a promise yet but let's check tsconfig or just treat as object.
    // However, the error log earlier showed "PageProps" type errors with Promise, implying we might be on a version treating params as promises or I should be careful.
    // Let's assume standard object for now, or await if it's a promise.
    // The previous file `[id]/page.tsx` used `await props.params`. Let's assume `searchParams` might also need awaiting in future or current versions.
    // Safest is to treat it as possibly a promise if the types say so, but usually in 14 it's an object. 
    // BUT `[id]/page.tsx` shows `params: Promise<{ id: string }>`. So `searchParams` is likely a Promise too.

    // Changing to async await pattern.
    const sp = await searchParams;
    const group = typeof sp?.group === 'string' ? sp.group : undefined;
    const type = typeof sp?.type === 'string' ? sp.type : undefined;

    let reports = [];
    if (group && type) {
        reports = await getReportsByGroupType(group, type);
    } else {
        reports = await getReports();
    }

    return (
        <main className="container">
            <h1 style={{ margin: '20px 0', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {group && type ? `${group} > ${type} Reports` : 'All Reports'}
            </h1>

            <ReportList reports={reports} />
        </main>
    );
}
