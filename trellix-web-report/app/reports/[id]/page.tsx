import { fetchReport } from '@/app/actions';
import ReportEditor from '@/components/ReportEditor';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ReportPage(props: PageProps) {
    const params = await props.params;
    const report = await fetchReport(params.id);

    if (!report) {
        return notFound();
    }

    return <ReportEditor initialReport={report} />;
}
