
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface CustomReportInfo {
    customer: {
        name: string;
        support: string;
        inspector: string;
        date: string;
        phone: string;
        type: string;
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
        id: string; // MAC ID or Appliance ID
        endDate: string;
        features: string[];
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

interface InspectionItem {
    id: string;
    category: string;
    criteria: string;
    result: string;
    opinion: string;
    isDeleted: boolean;
    sortOrder: number;
}

interface Section {
    id: string;
    title: string;
    items: InspectionItem[];
    sortOrder: number;
}

interface Report {
    id: string;
    title: string;
    inspector: string;
    group?: string;
    type?: string;
    createdAt: string;
    updatedAt: string;
    customInfo?: CustomReportInfo;
    sections: Section[];
}

interface DB {
    reports: Report[];
}

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

const exReport: Report = {
    id: `ex-report-lsitc-${new Date().getTime()}`,
    title: "Trellix EX 장비 점검 보고서",
    inspector: "김진수",
    group: "LSITC",
    type: "EX",
    createdAt: "2025-12-15T09:00:00.000Z",
    updatedAt: new Date().toISOString(),
    customInfo: {
        customer: {
            name: "LS ITC",
            support: "(주) 인더포레스트",
            inspector: "김진수",
            date: "2025-12-15",
            phone: "010-8766-2024",
            type: "■ 월\n□ 분기\n□ 특별",
            note: ""
        },
        system: [
            {
                product: "Trellix EX",
                equipment: "LS-EX1",
                version: "10.0.4.1005222",
                customer: "LS ITC",
                usage: "Email Security (e-APT) System"
            },
            {
                product: "Trellix EX",
                equipment: "LS-EX2",
                version: "10.0.4.1005222",
                customer: "LS ITC",
                usage: "Email Security (e-APT) System"
            }
        ],
        license: [
            {
                appliance: "EX8500 #1",
                serial: "FZ2224RA8IX",
                id: "74FE48680D31",
                endDate: "2027-06-25",
                features: [
                    "FIREEYE_APPLIANCE",
                    "FIREEYE_SUPPORT",
                    "CONTENT_UPDATES",
                    "EMPS_ATTACHMENT_SCAN",
                    "EMPS_URL_SCAN"
                ]
            },
            {
                appliance: "EX8500 #2",
                serial: "FZ2224RA8IV",
                id: "74FE48695A6E",
                endDate: "2027-06-25",
                features: [
                    "FIREEYE_APPLIANCE",
                    "FIREEYE_SUPPORT",
                    "CONTENT_UPDATES",
                    "EMPS_ATTACHMENT_SCAN",
                    "EMPS_URL_SCAN"
                ]
            }
        ],
        summary: {
            result: "[점검 결과]\n□ EX1, 2 공통\n- /var 파일 시스템 가용량 확보를 위한 perfmon 로그 백업 및 삭제 작업 필요",
            note: "[비고]\n※ 신규 이미지 버전(11.0.0) 출시"
        }
    },
    sections: [
        {
            id: uuidv4(),
            title: "하드웨어 상태 점검",
            sortOrder: 1,
            items: [
                {
                    id: uuidv4(),
                    category: "하드웨어 상태 점검",
                    criteria: "전원 공급 및 하드웨어 전원 상태 확인\n(Show system hardware status power supply)",
                    result: "전원 상태: Good",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 1
                },
                {
                    id: uuidv4(),
                    category: "하드웨어 상태 점검",
                    criteria: "시스템 쿨링팬 동작 상태 확인\n(CLI - show system hardware status fan)",
                    result: "Overall fan health: healthySystem",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 2
                },
                {
                    id: uuidv4(),
                    category: "하드웨어 상태 점검",
                    criteria: "시스템 내부 온도 적정 여부 확인\n(CLI - show system hardware status temperature)",
                    result: "시스템 온도: 44°C (상태: elsius)",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 3
                },
                {
                    id: uuidv4(),
                    category: "하드웨어 상태 점검",
                    criteria: "디스크 인식 여부 및 RAID 상태 확인\n(CLI - show system hardware status raid)",
                    result: "Overall raid status: Good\n\nDisk status:\n- Disk 0: Online\n- Disk 1: Online\n- Disk 2: Online\n- Disk 3: Online",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 4
                }
            ]
        },
        {
            id: uuidv4(),
            title: "시스템 버전 점검",
            sortOrder: 2,
            items: [
                {
                    id: uuidv4(),
                    category: "시스템 버전 점검",
                    criteria: "Security Content가 최근 시간에 업데이트 되었으면 정상",
                    result: "Security Content 버전 정보를 찾을 수 없음",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 1
                },
                {
                    id: uuidv4(),
                    category: "시스템 버전 점검",
                    criteria: "FEOS Version 10.0.4.1005222",
                    result: "10.0.4.1005222",
                    opinion: "양호",
                    isDeleted: false,
                    sortOrder: 2
                },
                {
                    id: uuidv4(),
                    category: "시스템 버전 점검",
                    criteria: "Guest Image",
                    result: "Version: 24.0503 (yes)",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 3
                }
            ]
        },
        {
            id: uuidv4(),
            title: "파일 시스템 상태 점검",
            sortOrder: 3,
            items: [
                {
                    id: uuidv4(),
                    category: "파일 시스템 상태 점검",
                    criteria: "/config 사용량 확인\n(CLI - show files system)",
                    result: "사용량: 4.1% (20MB/488MB)\n여유공간: 95.9% (468MB)",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 1
                },
                {
                    id: uuidv4(),
                    category: "파일 시스템 상태 점검",
                    criteria: "/var 사용량 확인\n(CLI - show files system)",
                    result: "사용량: 75.3% (48458MB/64379MB)\n여유공간: 24.7% (15922MB)",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 2
                },
                {
                    id: uuidv4(),
                    category: "파일 시스템 상태 점검",
                    criteria: "/data 사용량 확인\n(CLI - show files system)",
                    result: "사용량: 14.7% (457100MB/3102396MB)\n여유공간: 85.3% (2645296MB)",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 3
                }
            ]
        },
        {
            id: uuidv4(),
            title: "시스템 상태 점검",
            sortOrder: 4,
            items: [
                {
                    id: uuidv4(),
                    category: "시스템 상태 점검",
                    criteria: "Uptime 시간 확인\n(CLI - show version)",
                    result: "시스템 가동 시간: 211d 16h 19m",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 1
                },
                {
                    id: uuidv4(),
                    category: "시스템 상태 점검",
                    criteria: "DB 사용/여유 공간 확인\n(CLI - show health all / Database Service)",
                    result: "Database Service: Healthy\nDB 크기: 8.5 GB, 여유공간: 446 GB",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 2
                },
                {
                    id: uuidv4(),
                    category: "시스템 상태 점검",
                    criteria: "시스템 Memory 사용량 확인\n(CLI - show memory)",
                    result: "Physical Memory: 사용량 17.7%\nSwap Memory: 사용량 0.8%",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 3
                }
            ]
        }
    ]
};

async function migrate() {
    try {
        let db: DB = { reports: [] };
        try {
            const data = await fs.readFile(DB_PATH, 'utf-8');
            db = JSON.parse(data);
        } catch (error) {
            console.log('Creating new database...');
        }

        const existingIndex = db.reports.findIndex(r => r.title === exReport.title && r.type === 'EX');

        if (existingIndex >= 0) {
            console.log('Report with this title already exists. Updating...');
            db.reports[existingIndex] = {
                ...exReport,
                id: db.reports[existingIndex].id // Preserve ID
            };
        } else {
            console.log('Adding new report...');
            db.reports.push(exReport);
        }

        await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
        console.log('EX Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
