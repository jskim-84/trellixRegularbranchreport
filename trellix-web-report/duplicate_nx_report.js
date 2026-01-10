const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Find the source report (LSITC > NX)
// We know it is 'default-report' or we can search by group/type
const sourceReport = db.reports.find(r => r.group === 'LSITC' && r.type === 'NX');

if (!sourceReport) {
    console.error('Source report (LSITC > NX) not found!');
    process.exit(1);
}

// Create the new report
const newReport = JSON.parse(JSON.stringify(sourceReport)); // Deep clone
newReport.id = 'nx-report-jusung';
newReport.title = 'Trellix NX 정기점검 2025년 08월 보고서 (주성)';
newReport.group = '주성엔지니어링';
newReport.type = 'NX';
newReport.createdAt = new Date().toISOString();
newReport.updatedAt = new Date().toISOString();

// Check existence
const existingIndex = db.reports.findIndex(r => r.id === newReport.id);
if (existingIndex >= 0) {
    db.reports[existingIndex] = newReport;
    console.log('Updated existing Jusung NX report');
} else {
    db.reports.push(newReport);
    console.log('Added new Jusung NX report');
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
