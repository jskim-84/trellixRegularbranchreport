
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
    };
    license: {
        appliance: string;
        serial: string;
        id: string;
        endDate: string;
        features: string[];
    };
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

const cmReport: Report = {
    id: `cm-report-lsitc-${new Date().getTime()}`,
    title: "Trellix CMS 장비 점검 보고서",
    inspector: "김진수 (인더포레스트)",
    group: "LSITC",
    type: "CM",
    createdAt: "2025-12-15T09:00:00.000Z",
    updatedAt: new Date().toISOString(),
    customInfo: {
        customer: {
            name: "LS ITC",
            support: "(주) 인더포레스트",
            inspector: "김진수",
            date: "2025년 12월 15일",
            phone: "010-8766-2024",
            type: "■ 월\n□ 분기\n□ 특별",
            note: ""
        },
        system: {
            product: "Trellix CMS",
            equipment: "LS-CM",
            version: "FEOS Version: 10.0.4.1005222",
            customer: "LS ITC",
            usage: "Central Management System"
        },
        license: {
            appliance: "CM4500",
            serial: "FZ2215QA8GB",
            id: "3CECEF8F389A", // MAC ID for CM
            endDate: "2027-06-18",
            features: [
                "FIREEYE_APPLIANCE",
                "FIREEYE_SUPPORT",
                "CONTENT_UPDATES"
            ]
        },
        summary: {
            result: "[점검 결과]\n- /var 디렉토리 가용 공간 33% (전월: 32%)\n- RX discards: 163, RX overruns: 1636",
            note: "[비고]\n※ /var 디렉토리 가용량 저하 지속 모니터링 필요"
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
                    criteria: "전원 공급 및 하드웨어 전원 상태 확인\n(CLI - show system hardware status power-supply)",
                    result: "Overall power status: Good",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 1
                },
                {
                    id: uuidv4(),
                    category: "하드웨어 상태 점검",
                    criteria: "시스템 쿨링팬 동작 상태 확인\n(CLI - show system hardware status fan)",
                    result: "Overall fan health: healthySystem\n개별 FAN 상태:\n- Fan 1: 6700 RPM (Ok)\n- Fan 2: 6300 RPM (Ok)\n- Fan 3: 6200 RPM (Ok)\n- Fan 4: 6600 RPM (Ok)\n- Fan 5: 6100 RPM (Ok)",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 2
                },
                {
                    id: uuidv4(),
                    category: "하드웨어 상태 점검",
                    criteria: "시스템 내부 온도가 적정한지 확인\n(CLI - show system hardware status temperature)",
                    result: "System Temperature: 30°C (범위: 0-80°C, 상태: Good)",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 3
                },
                {
                    id: uuidv4(),
                    category: "하드웨어 상태 점검",
                    criteria: "디스크 인식 여부 및 RAID 상태 확인\n(CLI - show system hardware status raid)",
                    result: "Overall raid status: Good\n\n디스크 상태:\n- Disk 0: Online\n- Disk 1: Online\n- Disk 2: Online\n- Disk 3: Online",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 4
                },
                {
                    id: uuidv4(),
                    category: "시스템 버전 점검",
                    criteria: "Security Content가 최근 시간에 업데이트 되었는지 점검\n(CLI - show fenet security-content version)",
                    result: "Security Content Version: 122.102",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 5
                },
                {
                    id: uuidv4(),
                    category: "시스템 버전 점검",
                    criteria: "FEOS Version 상태 확인\n(CLI - show fenet image version)",
                    result: "FEOS Version: 10.0.4.1005222",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 6
                },
                {
                    id: uuidv4(),
                    category: "파일 시스템 상태 점검",
                    criteria: "/config 파일 시스템 사용량 확인\n(CLI - show files system)",
                    result: "사용량: 1.8% (9MB/488MB)\n여유공간: 98% (479MB)",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 7
                },
                {
                    id: uuidv4(),
                    category: "파일 시스템 상태 점검",
                    criteria: "/var 파일 시스템 사용량 확인\n(CLI - show files system)",
                    result: "사용량: 66.2% (21279MB/32126MB)\n여유공간: 33% (10847MB)",
                    opinion: "가용공간 32% 수준",
                    isDeleted: false,
                    sortOrder: 8
                },
                {
                    id: uuidv4(),
                    category: "파일 시스템 상태 점검",
                    criteria: "/data 파일 시스템 사용량 확인\n(CLI - show files system)",
                    result: "사용량: 1.1% (50160MB/4476489MB)\n여유공간: 98% (4426329MB)",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 9
                },
                {
                    id: uuidv4(),
                    category: "파일 시스템 상태 점검",
                    criteria: "/data/db 파일 시스템 사용량 확인\n(CLI - show files system)",
                    result: "사용량: 5.2% (154291MB/2952781MB)\n여유공간: 94% (2798490MB)",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 10
                },
                {
                    id: uuidv4(),
                    category: "시스템 상태 점검",
                    criteria: "Uptime 시간 확인\n(CLI - show version)",
                    result: "시스템 가동 시간: 211d 18h 39m 23.136s",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 11
                },
                {
                    id: uuidv4(),
                    category: "시스템 상태 점검",
                    criteria: "전체 대비 DB 서비스 정상 확인\n(CLI - show health all / Database Service)",
                    result: "Database Service: Healthy - DB 크기: 77.84735870361328 GB, 여유공간: 2586.4011459350586 GB",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 12
                },
                {
                    id: uuidv4(),
                    category: "시스템 상태 점검",
                    criteria: "시스템 Memory 사용량 확인\n(CLI - show memory)",
                    result: "Physical Memory:\n사용량: 24.1% (15407MB/64046MB)\n여유공간: 75.9% (48639MB)\n\nSwap Memory:\n사용량: 0.0% (17MB/65536MB)\n여유공간: 100.0% (65519MB)\n\nMemory Cache:\nBuffers: 421 MB, Cache: 46690 MB",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 13
                },
                {
                    id: uuidv4(),
                    category: "시스템 상태 점검",
                    criteria: "사용 중인 인터페이스 활성 상태 확인\n(CLI - show interfaces)",
                    result: "총 4개 인터페이스 (Admin Up: 1개, Link Up: 1개)\n주요 인터페이스:\n  lo: UP (127.0.0.1)",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 14
                },
                {
                    id: uuidv4(),
                    category: "시스템 상태 점검",
                    criteria: "주요 데몬 작동 상태 확인\n(CLI - show pm process all summary)",
                    result: "총 79개 프로세스 (실행중: 46개, 중지: 12개)",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 15
                },
                {
                    id: uuidv4(),
                    category: "시스템 상태 점검",
                    criteria: "센서 장비 연동 상태 확인\n(CLI - show cmc appliances)",
                    result: "총 5개 Appliance (활성: 5개, 연결됨: 5개)\n\n어플라이언스 상태:\n\n- LS-EX1: 활성 & 연결됨 (10.125.11.211)\n- LS-EX2: 활성 & 연결됨 (10.125.11.212)\n- LS-HX1: 활성 & 연결됨 (10.125.12.223)\n- LSG-INT-NX: 활성 & 연결됨 (10.51.0.152)\n- LSG-SDN-APT: 활성 & 연결됨 (10.51.0.153)\n- ITC-INT-APT1 활성 & 연결됨 (10.51.0.88)",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 16
                },
                {
                    id: uuidv4(),
                    category: "시스템 상태 점검",
                    criteria: "주요 서비스 상태 확인\n(CLI - show health all)",
                    result: "전체 서비스: 12개, 정상: 10개\n비정상 서비스:\nIPS Policy Sync Engine: Critical\nCMSHA Fedb Sync health: Disabled",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 17
                },
                {
                    id: uuidv4(),
                    category: "네트워크 상태 점검",
                    criteria: "사용 중인 인터페이스 Rx/Tx 정보 확인\n(CLI - show interface <인터페이스명>)",
                    result: "Interface unknown RX/TX 정보:\n상태: Admin unknown, Link unknown\nIP 주소: N/A\n속도: unknown",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 18
                },
                {
                    id: uuidv4(),
                    category: "네트워크 상태 점검",
                    criteria: "현재 시간과 동일하면 정상\n(CLI - show clock)",
                    result: "현재 시간: 2025/12/15 08:52:18 (Asia Southeast Seoul)",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 19
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

        const existingIndex = db.reports.findIndex(r => r.title === cmReport.title);

        if (existingIndex >= 0) {
            console.log('Report with this title already exists. Updating...');
            db.reports[existingIndex] = {
                ...cmReport,
                id: db.reports[existingIndex].id // Preserve ID
            };
        } else {
            console.log('Adding new report...');
            db.reports.push(cmReport);
        }

        await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
