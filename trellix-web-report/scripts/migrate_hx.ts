
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// Interface definitions (copied from lib/storage.ts to avoid import issues in standalone script if ts-config paths are tricky)
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

const hxReport: Report = {
    id: `hx-report-lsitc-${new Date().getTime()}`,
    title: "Trellix HX 정기점검 2025년 12월 보고서",
    inspector: "김진수 (인더포레스트)",
    group: "LSITC",
    type: "HX",
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
            product: "Trellix HX",
            equipment: "LS-HX1",
            version: "10.0.2.1007339",
            customer: "LS ITC",
            usage: "Endpoint Security Protection System"
        },
        license: {
            appliance: "HX4502",
            serial: "FZ2022QA6PF",
            id: "AC1F6BD75160",
            endDate: "2026-02-28",
            features: [
                "FIREEYE_SUPPORT",
                "HX_ADVANCED",
                "CONTENT_UPDATES",
                "FIREEYE_APPLIANCE"
            ]
        },
        summary: {
            result: "[점검 결과]\n■ 아래 2건의 오류 해결을 위해 HX 장비 재부팅 작업 예정 (작업 일시 : 12/16(화) 18:00 ~ 20:00)\n  - 127.0.0.1:8080 ECONNREFUSED error is still occurring. 오류\n  - WebUI 콘솔의 Host Management 메뉴에서 자산 정보 확인 안되는 문제\n■ 신규 Software Version릴리즈 (Ver 10.0.5)",
            note: "[비고]\n※ Malware 이벤트 발생 및 격리 건 모니터링 요망"
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
                    category: "전원 상태",
                    criteria: "전원 공급 장치와 이중화 상태 정상 여부 확인\n(CLI - show system hardware-status power-supply)",
                    result: "Overall power status: Good",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 1
                },
                {
                    id: uuidv4(),
                    category: "FAN 상태",
                    criteria: "전체 시스템 FAN 정상 동작 여부 확인\n(CLI - show system hardware-status fan)",
                    result: "Overall fan health: healthySystem\n개별 FAN 상태:\n- Fan 1: 8200 RPM (Ok)\n- Fan 2: 7900 RPM (Ok)\n- Fan 3: 8300 RPM (Ok)\n- Fan 4: 7800 RPM (Ok)\n- Fan 5: 7800 RPM (Ok)",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 2
                },
                {
                    id: uuidv4(),
                    category: "장비 온도 상태",
                    criteria: "시스템 내부 온도 적정 여부 확인\n(CLI - show system hardware status temperature)",
                    result: "System Temperature: 32°C (범위: 0-80°C, 상태: Good)",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 3
                },
                {
                    id: uuidv4(),
                    category: "Disk 상태 (RAID 포함)",
                    criteria: "디스크 인식 여부 및 RAID 상태 확인\n(CLI - show system hardware status raid)",
                    result: "Overall raid status: Good\n디스크 상태:\n- Disk 0: Online\n- Disk 1: Online\n- Disk 2: Online\n- Disk 3: Online",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 4
                }
            ]
        },
        {
            id: uuidv4(),
            title: "시스템 버전 점검 (서버)",
            sortOrder: 2,
            items: [
                {
                    id: uuidv4(),
                    category: "Security Content",
                    criteria: "시스템 주요 구성요소의 버전 업데이트 정상 여부 확인",
                    result: "Security Content Version: 921.102",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 1
                },
                {
                    id: uuidv4(),
                    category: "FEOS Version",
                    criteria: "시스템 주요 구성요소의 버전 업데이트 정상 여부 확인",
                    result: "FEOS Version: 10.0.2.1007339",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 2
                },
                {
                    id: uuidv4(),
                    category: "IPMI Version",
                    criteria: "시스템 주요 구성요소의 버전 업데이트 정상 여부 확인",
                    result: "3.11",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 3
                }
            ]
        },
        {
            id: uuidv4(),
            title: "시스템 버전 점검 (에이전트)",
            sortOrder: 3,
            items: [
                {
                    id: uuidv4(),
                    category: "Windows",
                    criteria: "서버에 다운로드 된 가장 최신의 Windows Agent 버전을 기준으로 설정",
                    result: "36.30.17",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 1
                },
                {
                    id: uuidv4(),
                    category: "Linux",
                    criteria: "서버에 다운로드 된 가장 최신의 Linux Agent 버전을 기준으로 설정",
                    result: "36.30.17",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 2
                },
                {
                    id: uuidv4(),
                    category: "macOS",
                    criteria: "서버에 다운로드 된 가장 최신의 macOS Agent 버전을 기준으로 설정",
                    result: "36.30.17",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 3
                }
            ]
        },
        {
            id: uuidv4(),
            title: "파일 시스템 상태 점검",
            sortOrder: 4,
            items: [
                {
                    id: uuidv4(),
                    category: "/config 사용량 확인",
                    criteria: "/config 파일시스템 사용량 확인\n(CLI - show files system)",
                    result: "사용량: 1.8% (9MB/488MB)\n여유공간: 98%",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 1
                },
                {
                    id: uuidv4(),
                    category: "/var 사용량 확인",
                    criteria: "/var 파일시스템 사용량 확인\n(CLI - show files system)",
                    result: "사용량: 55.4% (53510MB/96633MB)\n여유공간: 44%",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 2
                },
                {
                    id: uuidv4(),
                    category: "/data 사용량 확인",
                    criteria: "/data 파일시스템 사용량 확인\n(CLI - show files system)",
                    result: "사용량: 23.7% (1629935MB/6879855MB)\n여유공간: 76%",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 3
                },
                {
                    id: uuidv4(),
                    category: "/data/db 사용량 확인",
                    criteria: "/data/db 파일시스템 사용량 확인\n(CLI - show files system)",
                    result: "사용량: 24.9% (125312MB/503836MB)\n여유공간: 75%",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 4
                }
            ]
        },
        {
            id: uuidv4(),
            title: "시스템 상태 점검",
            sortOrder: 5,
            items: [
                {
                    id: uuidv4(),
                    category: "System Uptime",
                    criteria: "Uptime 시간 확인\n(CLI - show version)",
                    result: "System Uptime: 178d 13h 27m 58.208s\nCPU load averages: 4.35 / 4.42 / 4.76",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 1
                },
                {
                    id: uuidv4(),
                    category: "DB 상태",
                    criteria: "전월 대비 DB 사이즈 증감 확인\n(CLI - show health all / Database Service)",
                    result: "KyotoDB Casket File Status: Healthy - Kyoto DB size is 13M",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 2
                },
                {
                    id: uuidv4(),
                    category: "Memory 상태 점검",
                    criteria: "시스템 Memory 상태 확인\n(CLI - show memory)",
                    result: "Physical Memory: 12417MB 사용/64046MB 전체 (19.4% 사용중)\nSwap Memory: 37919MB 사용/65536MB 전체 (57.9% 사용중)\nSystem Buffers: 540MB\nSystem Cache: 47650MB\nTotal Buffers/Cache: 48190MB",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 3
                },
                {
                    id: uuidv4(),
                    category: "Interface 상태 확인",
                    criteria: "사용 중인 인터페이스 활성 상태 확인\n(CLI - show interface 인터페이스명)",
                    result: "ether1: Admin(yes), Link(yes), IP(10.125.12.223), Speed(1000Mb/s (auto))\nether2: Admin(no), Link(no)\nether3: Admin(no), Link(no)\nether4: Admin(no), Link(no)",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 4
                },
                {
                    id: uuidv4(),
                    category: "데몬 상태 확인",
                    criteria: "주요 데몬 작동 상태 확인\n(CLI - show pm process all summary)",
                    result: "총 89개 프로세스 (실행중: 57개, 중지: 9개)",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 5
                },
                {
                    id: uuidv4(),
                    category: "주요 서비스 상태 확인",
                    criteria: "주요 서비스 상태 확인\n(CLI - show health all)",
                    result: "전체 서비스: 20개, 정상: 12개\n비정상 서비스:\n- Licenses Monitoring: Critical\n- Security Contents: Warning\n- Disk Storage: Warning\n- Helix Datastreaming: Disabled\n- Store and Forward Cluster Connectivity: Warning\n- Concurrent Host Limit and Sysinfo Interval: Warning\n- HelixConnect: Disabled\n- Application Processor: Critical",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 6
                }
            ]
        },
        {
            id: uuidv4(),
            title: "네트워크 상태 점검",
            sortOrder: 6,
            items: [
                {
                    id: uuidv4(),
                    category: "Interface 세부 확인",
                    criteria: "사용 중인 인터페이스 Rx/Tx 정보 확인\n(CLI - show interface 인터페이스명)",
                    result: "Interface ether1:\n- Admin up: yes, Link up: yes\n- IP Address: 10.125.12.223\n- Speed: 1000Mb/s (auto)\n- Rx: 1293655531126 bytes / 5585389583 packets\n- Tx: 2638102000546 bytes / 5443110802 packets",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 1
                },
                {
                    id: uuidv4(),
                    category: "NTP 동기화 확인",
                    criteria: "점검 시점의 시간과 일치하면 정상\n(CLI - show clock)",
                    result: "현재 시간: 2025/12/15 08:45:45 (Asia Southeast Seoul)",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 2
                }
            ]
        },
        {
            id: uuidv4(),
            title: "이벤트 탐지 (엔진별)",
            sortOrder: 7,
            items: [
                {
                    id: uuidv4(),
                    category: "Malware Protection",
                    criteria: "Malware Protection 알림 발생 건수",
                    result: "0",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 1
                },
                {
                    id: uuidv4(),
                    category: "Exploit Guard",
                    criteria: "Exploit Guard 알림 발생 건수",
                    result: "0",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 2
                },
                {
                    id: uuidv4(),
                    category: "Real-Time indicator detection",
                    criteria: "Real-Time indicator detection 알림 발생 건수",
                    result: "0",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 3
                },
                {
                    id: uuidv4(),
                    category: "Others",
                    criteria: "Others 알림 발생 건수",
                    result: "0",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 4
                }
            ]
        },
        {
            id: uuidv4(),
            title: "Acquisitions (타입별)",
            sortOrder: 8,
            items: [
                {
                    id: uuidv4(),
                    category: "File",
                    criteria: "File 수집 요청 건수",
                    result: "46",
                    opinion: "Failed 15건",
                    isDeleted: false,
                    sortOrder: 1
                },
                {
                    id: uuidv4(),
                    category: "Quarantine",
                    criteria: "Quarantine 수집 요청 건수",
                    result: "11",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 2
                },
                {
                    id: uuidv4(),
                    category: "Triage",
                    criteria: "Triage 수집 요청 건수",
                    result: "900",
                    opinion: "Failed 3건",
                    isDeleted: false,
                    sortOrder: 3
                },
                {
                    id: uuidv4(),
                    category: "Data",
                    criteria: "Data 수집 요청 건수",
                    result: "1",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 4
                },
                {
                    id: uuidv4(),
                    category: "Agent Diagnostics",
                    criteria: "Agent Diagnostics 수집 요청 건수",
                    result: "0",
                    opinion: "특이사항 없음",
                    isDeleted: false,
                    sortOrder: 5
                }
            ]
        }
    ]
};

function readDB(): DB {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if ((error as any).code === 'ENOENT') {
            return { reports: [] };
        }
        throw error;
    }
}

function writeDB(data: DB): void {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function migrate() {
    const db = readDB();

    // Check if report already exists (crude check by title)
    const exists = db.reports.some(r => r.title === hxReport.title);
    if (exists) {
        console.log("Report with this title already exists. Skipping or updating...");
        // Option: remove old one and add new one
        const index = db.reports.findIndex(r => r.title === hxReport.title);
        // Preserve ID if updating
        hxReport.id = db.reports[index].id;
        db.reports[index] = hxReport;
        console.log("Updated existing report.");
    } else {
        db.reports.push(hxReport);
        console.log("Added new report.");
    }

    writeDB(db);
    console.log("Migration completed successfully.");
}

migrate();
