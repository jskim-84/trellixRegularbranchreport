'use server';

import { getReport, saveReport, Report } from '@/lib/storage';
import { revalidatePath } from 'next/cache';

export async function fetchReport(id: string) {
    return await getReport(id);
}

export async function updateReport(report: Report) {
    await saveReport(report);
    revalidatePath(`/reports/${report.id}`);
}

export async function deleteReportAction(id: string) {
    await import('@/lib/storage').then(m => m.deleteReport(id));
    revalidatePath('/reports');
}
