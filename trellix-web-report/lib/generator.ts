import { Report, CustomReportInfo } from "@/lib/storage";
import { THEME_COLORS } from "@/lib/constants";
import { getResultStatus, formatResultText, parseCriteriaText } from "@/lib/reportUtils";

export function generateHtmlReport(report: Report): string {
    const theme = report.themeConfig || THEME_COLORS;

    const styles = `
    :root { 
        --bg: #ffffff; 
        --fg: #111827; 
        
        /* Theme Colors */
        --theme-primary: ${theme.primary};
        --theme-secondary: ${theme.secondary};
        --theme-tertiary: ${theme.tertiary || '#dbeafe'};
        --theme-border: ${theme.border || '#1d4ed8'};
        --theme-text: ${theme.text || '#1e40af'};

        /* Applied Colors */
        --header-bg: var(--theme-primary); 
        --header-fg: #ffffff; 
        --footer-bg: var(--theme-primary); 
        --footer-fg: #ffffff; 
        
        --table-header-bg: var(--theme-secondary);
        --table-header-fg: #ffffff;
    }
    *{box-sizing:border-box}
    body{margin:0;font-family:"Pretendard","Noto Sans KR",sans-serif;line-height:1.45;color:var(--fg);background:var(--bg)}
    header{background:var(--header-bg); border-bottom: 3px solid var(--theme-border);}
    .container{max-width:1200px;margin:0 auto;padding:12px 20px}
    header .container{ text-align: center; padding: 15px 20px; }
    header h1{margin:10px 0;font-size:22px;color:var(--header-fg)}
    .header-bottom { font-size: 1.1em; color: #e0e0e0; letter-spacing: 1px; }
    main{padding:20px 0; font-size: 14px;}
    table{ border-collapse:collapse; width:100%; border:1px solid #e5e7eb; table-layout: fixed; }
    th,td{border:1px solid #e5e7eb;padding:8px 10px;text-align:left;vertical-align:top;word-break:keep-all;white-space:pre-wrap;}
    thead th{ background:var(--table-header-bg); color:var(--table-header-fg); text-align:center; vertical-align:middle; position: sticky; top: 0; z-index: 5; }
    tbody tr:nth-child(even){background:#fafafa}
    footer{background:var(--footer-bg);color:var(--footer-fg);padding:15px 20px;text-align:center;font-size:12px;margin-top:20px;}
    
    /* Utility classes for custom html */
    .bg-primary, .section-header, .confirmation-table .section-header { background-color: var(--theme-primary) !important; color: white !important; }
    .bg-secondary, .confirmation-title { background-color: var(--theme-secondary) !important; color: white !important; }
    .bg-tertiary, .yellow-bg, .system-header, .license-header { background-color: var(--theme-tertiary) !important; color: var(--theme-text) !important; }
    .border-theme { border-color: var(--theme-border) !important; }

    /* Custom Styles from CM Report v0.2 */
    .inspection-table { 
        width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 20px; 
        border: 1px solid var(--theme-border); border-radius: 6px; overflow: hidden; 
    }
    .inspection-table th, .inspection-table td {
        border: 1px solid var(--theme-border); padding: 12px; text-align: left; vertical-align: middle;
    }
    .inspection-table th {
        background-color: var(--theme-secondary); color: white; font-weight: 600; text-align: center;
    }
    
    /* Column specific styles */
    .inspection-table .category { 
        background-color: var(--theme-primary); color: white; vertical-align: middle; text-align: center; font-weight: 600; 
    }
    .inspection-table .item {
        text-align: left; font-weight: 500; background-color: #f8fafc; color: #374151;
    }
    ${report.type === 'EX' ? `
    .inspection-table .item {
        background-color: var(--theme-primary); color: white; text-align: center; font-weight: 600;
    }
    ` : ''}
    .inspection-table .checkpoint {
        text-align: left; white-space: pre-wrap; font-size: 12px; color: #64748b; background-color: #ffffff; line-height: 1.4;
    }
    .inspection-table .result {
        text-align: left; white-space: pre-wrap; font-weight: 500; line-height: 1.4;
    }
    .inspection-table .result.issue, .inspection-table .result.ex-highlight {
        background-color: var(--theme-tertiary); color: var(--theme-text);
    }
    .inspection-table .result.normal {
        background-color: #ffffff; color: #374151;
    }
    .inspection-table .comment {
        text-align: left; background-color: #ffffff; color: #374151; font-weight: 500;
    }
    .cli-command {
        display: block; font-family: monospace; font-size: 11px; color: #94a3b8; margin-top: 4px; border-top: 1px dashed #e2e8f0; padding-top: 2px;
    }
    .overall-bold { font-weight: 700; }
    .red-text, .blue-text { color: var(--theme-text) !important; font-weight: 600; }
    `;

    // Generate Table Rows
    let tableRows = '';
    report.sections.forEach(section => {
        const visibleItems = section.items.filter(i => !i.isDeleted);
        if (visibleItems.length === 0) return;

        visibleItems.forEach((item, idx) => {
            const prevItem = visibleItems[idx - 1];
            const isSameCategoryAsPrev = prevItem && prevItem.category === item.category;

            let categoryRowSpan = 0;
            let categoryCell = '';

            if (!isSameCategoryAsPrev) {
                let count = 1;
                for (let k = idx + 1; k < visibleItems.length; k++) {
                    if (visibleItems[k].category === item.category) {
                        count++;
                    } else {
                        break;
                    }
                }
                categoryRowSpan = count;
                categoryCell = `<td class="item" rowspan="${categoryRowSpan}" style="vertical-align: middle;">${item.category}</td>`;
            }

            const sectionCell = idx === 0
                ? `<td class="category" rowspan="${visibleItems.length}" style="font-weight: bold; text-align: center; vertical-align: middle;">${section.title}</td>`
                : '';

            // Apply readabilty logic
            const status = getResultStatus(item.result || '');
            const normalizedResult = formatResultText(item.result || '');
            const { main: criteriaMain, command: criteriaCommand } = parseCriteriaText(item.criteria || '');

            // Bold internal "Overall" lines and handle list 1-per-line
            const resultWithBold = normalizedResult.split('\n').map(line => {
                const trimmed = line.trim();
                if (trimmed.toLowerCase().startsWith('overall')) {
                    return `<div class="overall-bold">${trimmed}</div>`;
                }
                return `<div>${trimmed}</div>`;
            }).join('');

            tableRows += `
        <tr>
          ${sectionCell}
          ${categoryCell}
          <td class="checkpoint">
            <div style="white-space: pre-wrap;">${criteriaMain}</div>
            ${criteriaCommand ? `<div class="cli-command">${criteriaCommand}</div>` : ''}
          </td> 
          <td class="result ${report.type === 'EX' ? 'ex-highlight' : status}">
            ${resultWithBold}
          </td>
          <td class="comment">${item.opinion ?? ''}</td>
        </tr>
      `;
        });
    });

    const htmlTemplate = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1" name="viewport"/>
    <title>${report.title}</title>
    <style>${styles}</style>
</head>
<body>
    <header>
        <div class="container">
            <h1>${report.title}</h1>
            <div class="header-bottom">${report.inspector}</div>
        </div>
    </header>

    <main class="container">
        <section>
            <table class="inspection-table">
                <thead>
                    <tr>
                        <th style="width: 15%;">항목</th>
                        <th style="width: 15%;">점검 항목</th>
                        <th style="width: 25%;">판단 기준</th>
                        <th style="width: 20%;">점검 결과</th>
                        <th style="width: 25%;">점검 결과 및 의견</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </section>
    </main>

    <footer>
        <div class="footer-inner">Copyright © ${new Date().getFullYear()} ${report.inspector}. All Rights Reserved.</div>
    </footer>
</body>
</html>`;

    if (report.customInfo) {
        const customHeaderHtml = generateCustomHeaderHtml(report.customInfo, report.type || 'HX');
        return htmlTemplate.replace('<main class="container">', `<main class="container">${customHeaderHtml}`);
    }

    return htmlTemplate;
}

function generateCustomHeaderHtml(info: CustomReportInfo, reportType: string): string {
    const systems = Array.isArray(info.system) ? info.system : [info.system];
    const licenses = Array.isArray(info.license) ? info.license : [info.license];

    const normalizeFeatures = (features?: string[]) => {
        const cleaned = (Array.isArray(features) ? features : [])
            .map(f => (f ?? '').trim())
            .filter(f => f.length > 0);
        return cleaned.length > 0 ? cleaned : [''];
    };

    const totalLicenseRows = licenses.reduce((sum: number, lic: any) => sum + normalizeFeatures(lic?.features).length, 0);

    let systemRows = systems.map((sys: any) => `
        <tr>
            <td style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${sys.product}</td>
            <td style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${sys.equipment}</td>
            <td style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${sys.version}</td>
            <td style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${sys.customer}</td>
            <td style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${sys.usage}</td>
        </tr>
    `).join('');

    let licenseRows = '';
    licenses.forEach((lic: any, idx: number) => {
        const features = normalizeFeatures(lic?.features);
        features.forEach((feature, fIdx) => {
            licenseRows += `
            <tr>
                ${fIdx === 0 ? `
                <td rowspan="${features.length}" style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff; vertical-align: middle; text-align: center;">${lic.appliance}</td>
                <td rowspan="${features.length}" style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff; vertical-align: middle; text-align: center;">${lic.serial}</td>
                <td rowspan="${features.length}" style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff; vertical-align: middle; text-align: center;">${lic.id}</td>
                ` : ''}
                <td style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${fIdx === 0 ? lic.endDate : (reportType === 'HX' ? 'N/A' : lic.endDate)}</td>
                <td style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${feature}</td>
            </tr>`;
        });
        if (idx < licenses.length - 1) {
            licenseRows += `<tr><td colspan="5" style="height: 10px; background-color: #f1f5f9; border: 1px solid #cbd5e1;"></td></tr>`;
        }
    });

    let equipmentInfoTables = systems.map((sys: any, idx: number) => {
        const lic = licenses[idx] || licenses[0];
        return `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; font-size: 14px;">
            <tbody>
                <tr>
                    <th class="bg-primary" style="font-weight: 600; text-align: left; width: 200px; padding: 15px; border: 1px solid #cbd5e1;">점검 장비명</th>
                    <td style="padding: 15px; border: 1px solid #cbd5e1; background-color: #fff; font-weight: 500;">${sys.product} ${lic.appliance}</td>
                    <th class="bg-primary" style="font-weight: 600; text-align: left; width: 200px; padding: 15px; border: 1px solid #cbd5e1;">Serial Number</th>
                    <td style="padding: 15px; border: 1px solid #cbd5e1; background-color: #fff; font-weight: 500;">${lic.serial}</td>
                </tr>
            </tbody>
        </table>`;
    }).join('');

    return `
    <div style="margin-bottom: 30px;">
        <div class="bg-secondary border-theme" style="text-align: center; font-size: 20px; font-weight: 600; margin: 0 0 25px 0; padding: 15px; border-radius: 6px; border-left-width: 4px; border-left-style: solid;">
            정기점검 확인서
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; font-size: 14px; table-layout: fixed;">
             <colgroup>
                <col style="width: 10%" />
                <col style="width: 15%" />
                <col style="width: 15%" />
                <col style="width: 15%" />
                <col style="width: 15%" />
                <col style="width: 30%" />
            </colgroup>
            <tbody>
                <tr>
                    <th rowspan="4" class="bg-primary" style="padding: 12px; border: 1px solid #cbd5e1;">고객사</th>
                    <th class="bg-tertiary" style="padding: 12px; border: 1px solid #cbd5e1;">고객사명</th>
                    <td colspan="2" style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${info.customer.name}</td>
                    <th class="bg-tertiary" style="padding: 12px; border: 1px solid #cbd5e1;">확인자</th>
                    <td style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;"></td>
                </tr>
                <tr>
                    <th class="bg-tertiary" style="padding: 12px; border: 1px solid #cbd5e1;">지원회사명</th>
                    <td colspan="2" style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${info.customer.support}</td>
                    <th class="bg-tertiary" style="padding: 12px; border: 1px solid #cbd5e1;">점검자</th>
                    <td style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${info.customer.inspector}</td>
                </tr>
                <tr>
                    <th class="bg-tertiary" style="padding: 12px; border: 1px solid #cbd5e1;">점검일자</th>
                    <td colspan="2" style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${info.customer.date}</td>
                    <th class="bg-tertiary" style="padding: 12px; border: 1px solid #cbd5e1;">TEL</th>
                    <td style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${info.customer.phone}</td>
                </tr>
                <tr>
                    <th class="bg-tertiary" style="padding: 12px; border: 1px solid #cbd5e1;">점검구분</th>
                    <td colspan="2" style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff; white-space: pre-wrap;">${info.customer.type}</td>
                    <th class="bg-tertiary" style="padding: 12px; border: 1px solid #cbd5e1;">추가 사항</th>
                    <td style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff; white-space: pre-wrap;">${info.customer.note}</td>
                </tr>

                <tr>
                    <th rowspan="${systems.length + 1}" class="bg-primary" style="padding: 12px; border: 1px solid #cbd5e1;">시스템<br />정보</th>
                    <th class="bg-tertiary" style="padding: 12px; border: 1px solid #cbd5e1;">제품명</th>
                    <th class="bg-tertiary" style="padding: 12px; border: 1px solid #cbd5e1;">장비명</th>
                    <th class="bg-tertiary" style="padding: 12px; border: 1px solid #cbd5e1;">버전정보</th>
                    <th class="bg-tertiary" style="padding: 12px; border: 1px solid #cbd5e1;">고객사</th>
                    <th class="bg-tertiary" style="padding: 12px; border: 1px solid #cbd5e1;">용도</th>
                </tr>
                ${systemRows}

                <tr>
                    <th rowspan="${totalLicenseRows + 1}" class="bg-primary" style="padding: 12px; border: 1px solid #cbd5e1;">라이선스<br />정보</th>
                    <th class="bg-tertiary" style="padding: 12px; border: 1px solid #cbd5e1;">Appliance</th>
                    <th class="bg-tertiary" style="padding: 12px; border: 1px solid #cbd5e1;">Serial Number</th>
                    <th class="bg-tertiary" style="padding: 12px; border: 1px solid #cbd5e1;">
                         ${reportType === 'HX' ? 'Appliance ID' : 'MAC ID'}
                    </th>
                    <th class="bg-tertiary" style="padding: 12px; border: 1px solid #cbd5e1;">End Date</th>
                    <th class="bg-tertiary" style="padding: 12px; border: 1px solid #cbd5e1;">Feature</th>
                </tr>
                ${licenseRows}

                <tr>
                    <th class="bg-primary" style="padding: 12px; border: 1px solid #cbd5e1;">점검 종합의견</th>
                    <td colspan="5" style="padding: 15px; border: 1px solid #cbd5e1; background-color: #fff; line-height: 1.7; text-align: left;">
                        <div style="white-space: pre-wrap;">${info.summary.result}</div>
                        <br />
                        <div style="white-space: pre-wrap;">${info.summary.note}</div>
                    </td>
                </tr>
            </tbody>
        </table>

        ${equipmentInfoTables}
    </div>`;
}
