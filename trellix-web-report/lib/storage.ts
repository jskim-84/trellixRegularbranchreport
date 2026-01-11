import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

export interface InspectionItem {
    id: string;
    category: string;
    criteria: string;
    result: string;
    opinion: string;
    isDeleted: boolean;
    sortOrder: number;
}

export interface Section {
    id: string;
    title: string;
    items: InspectionItem[];
    sortOrder: number;
}

export interface CustomReportInfo {
    customer: {
        name: string;
        support: string;
        inspector: string;
        date: string;
        phone: string;
        type: string; // 월/분기/특별
        note: string;
    };
    system: {
        product: string;
        equipment: string;
        version: string;
        customer: string;
        usage: string;
    } | {
        product: string;
        equipment: string;
        version: string;
        customer: string;
        usage: string;
    }[];
    license: {
        appliance: string;
        serial: string;
        id: string; // Appliance ID (HX) or MAC ID (CM)
        endDate: string;
        features: string[]; // e.g. ["FIREEYE_SUPPORT", "HX_ADVANCED"]
    } | {
        appliance: string;
        serial: string;
        id: string;
        endDate: string;
        features: string[];
    }[];
    summary: {
        result: string;
        note: string;
    };
}

export interface Report {
    id: string;
    title: string;
    inspector: string;
    group?: string; // e.g. "LSITC"
    type?: string;  // e.g. "NX"
    createdAt: string;
    updatedAt: string;
    customInfo?: CustomReportInfo; // Optional custom header data
    themeConfig?: {
        primary: string;
        secondary: string;
        tertiary?: string;
        border?: string;
        text?: string;
    };
    sections: Section[];
}

export interface DB {
    reports: Report[];
}

export async function readDB(): Promise<DB> {
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, return empty structure
        return { reports: [] };
    }
}

export async function writeDB(data: DB): Promise<void> {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getReports(): Promise<Report[]> {
    const db = await readDB();
    return db.reports;
}

export async function getReportsByGroupType(group: string, type: string): Promise<Report[]> {
    const db = await readDB();
    return db.reports.filter(r => r.group === group && r.type === type);
}

export async function getReport(id: string): Promise<Report | undefined> {
    const db = await readDB();
    return db.reports.find(r => r.id === id);
}

export async function saveReport(report: Report): Promise<void> {
    const db = await readDB();
    const index = db.reports.findIndex(r => r.id === report.id);

    if (index >= 0) {
        db.reports[index] = { ...report, updatedAt: new Date().toISOString() };
    } else {
        report.createdAt = new Date().toISOString();
        report.updatedAt = new Date().toISOString();
        db.reports.push(report);
    }

    await writeDB(db);
}

export async function deleteReport(id: string): Promise<void> {
    const db = await readDB();
    const initialLength = db.reports.length;
    db.reports = db.reports.filter(r => r.id !== id);

    if (db.reports.length !== initialLength) {
        await writeDB(db);
    }
}
