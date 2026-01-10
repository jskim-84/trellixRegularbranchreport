import { Report } from "@/lib/storage";

export function generateHtmlReport(report: Report): string {
    // Styles based on globals.css and the legacy report
    const styles = `
    :root { --bg:#ffffff; --fg:#111827; --header-bg:#1f4e79; --footer-bg:#1f4e79; --header-fg:#ffffff; --footer-fg:#ffffff; --width-col-ab: 30%; --width-col-c: 25%; --width-col-d: 35%; --width-col-e: 10%; }
    *{box-sizing:border-box}
    body{margin:0;font-family:"Pretendard","Noto Sans KR",sans-serif;line-height:1.45;color:var(--fg);background:var(--bg)}
    header{background:var(--header-bg);}
    .container{max-width:1200px;margin:0 auto;padding:12px 20px}
    header .container{ text-align: center; padding: 15px 20px; }
    header h1{margin:10px 0;font-size:22px;color:var(--header-fg)}
    .header-bottom { font-size: 1.1em; color: #e0e0e0; letter-spacing: 1px; }
    main{padding:20px 0; font-size: 14px;}
    table{ border-collapse:collapse; width:100%; border:1px solid #e5e7eb; table-layout: fixed; }
    th,td{border:1px solid #e5e7eb;padding:8px 10px;text-align:left;vertical-align:top;word-break:keep-all;white-space:pre-wrap;}
    thead th{ background:var(--header-bg); color:var(--header-fg); text-align:center; vertical-align:middle; position: sticky; top: 0; z-index: 5; }
    tbody tr:nth-child(even){background:#fafafa}
    footer{background:var(--footer-bg);color:var(--footer-fg);padding:15px 20px;text-align:center;font-size:12px;margin-top:20px;}
    .col-ab { width: var(--width-col-ab); }
    .col-c { width: var(--width-col-c); }
    .col-d { width: var(--width-col-d); }
    .col-e { width: var(--width-col-e); }
  `;

    // Generate Table Rows
    let tableRows = '';
    report.sections.forEach(section => {
        const visibleItems = section.items.filter(i => !i.isDeleted);
        if (visibleItems.length === 0) return;

        visibleItems.forEach((item, idx) => {
            // Determine if we should show the Category cell (logic mirrored from React component)
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
                categoryCell = `<td rowspan="${categoryRowSpan}" style="vertical-align: middle;">${item.category}</td>`;
            }

            // Section Title (only on first item of section)
            const sectionCell = idx === 0
                ? `<td rowspan="${visibleItems.length}" style="font-weight: bold; text-align: center; vertical-align: middle;">${section.title}</td>`
                : '';

            tableRows += `
        <tr>
          ${sectionCell}
          ${categoryCell}
          <td style="white-space: pre-wrap;">${item.criteria}</td>
          <td>${item.result ?? ''}</td>
          <td>${item.opinion ?? ''}</td>
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
            <table>
                <thead>
                    <tr>
                        <th class="col-ab" colspan="2">점 검 항 목</th>
                        <th class="col-c">판단 기준</th>
                        <th class="col-d">점검 결과</th>
                        <th class="col-e">점검 의견</th>
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
        // Insert custom header at the beginning of the main container
        return htmlTemplate.replace('<main class="container">', `<main class="container">${customHeaderHtml}`);
    }

    return htmlTemplate;
}

function generateCustomHeaderHtml(info: any, reportType: string): string {
    const systems = Array.isArray(info.system) ? info.system : [info.system];
    const licenses = Array.isArray(info.license) ? info.license : [info.license];

    // Theme (Blue)
    const theme = {
        primary: '#1e40af',
        secondary: '#3b82f6',
        tertiary: '#dbeafe',
        text: '#1e40af',
        border: '#1d4ed8'
    };

    // Helper for rows
    let systemRows = systems.map((sys: any, idx: number) => `
        <tr>
            <td style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${sys.product}</td>
            <td style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${sys.equipment}</td>
            <td style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${sys.version}</td>
            <td style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${sys.customer}</td>
            <td style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${sys.usage}</td>
        </tr>
    `).join('');

    let licenseRows = licenses.map((lic: any, idx: number) => {
        const separator = (idx < licenses.length - 1) ? '<tr><td colspan="5" style="height: 10px; background-color: #f1f5f9; border: 1px solid #cbd5e1;"></td></tr>' : '';
        return `
        <tr>
            <td rowspan="4" style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff; vertical-align: middle; text-align: center;">${lic.appliance}</td>
            <td rowspan="4" style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff; vertical-align: middle; text-align: center;">${lic.serial}</td>
            <td rowspan="4" style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff; vertical-align: middle; text-align: center;">${lic.id}</td>
            <td style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${lic.endDate}</td>
            <td style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${lic.features[0] || ''}</td>
        </tr>
        <tr>
            <td style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${(reportType === 'CM' || reportType === 'EX') ? lic.endDate : 'N/A'}</td>
            <td style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${lic.features[1] || ''}</td>
        </tr>
        <tr>
            <td style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${lic.endDate}</td>
            <td style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${lic.features[2] || ''}</td>
        </tr>
        <tr>
            <td style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${lic.endDate}</td>
            <td style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${lic.features[3] || ''}</td>
        </tr>
        ${separator}
        `;
    }).join('');

    // Equipment Info Tables
    let equipmentInfoTables = systems.map((sys: any, idx: number) => {
        const lic = licenses[idx] || licenses[0];
        return `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; fontSize: 14px;">
            <tbody>
                <tr>
                    <th style="background-color: #3b82f6; color: white; font-weight: 600; text-align: left; width: 200px; padding: 15px; border: 1px solid #cbd5e1;">점검 장비명</th>
                    <td style="padding: 15px; border: 1px solid #cbd5e1; background-color: #fff; font-weight: 500;">${sys.product} ${lic.appliance}</td>
                    <th style="background-color: #3b82f6; color: white; font-weight: 600; text-align: left; width: 200px; padding: 15px; border: 1px solid #cbd5e1;">Serial Number</th>
                    <td style="padding: 15px; border: 1px solid #cbd5e1; background-color: #fff; font-weight: 500;">${lic.serial}</td>
                </tr>
            </tbody>
        </table>`;
    }).join('');


    return `
    <div style="margin-bottom: 30px;">
        <div style="text-align: center; font-size: 20px; font-weight: 600; margin: 0 0 25px 0; padding: 15px; background-color: ${theme.secondary}; color: white; border-radius: 6px; border-left: 4px solid ${theme.border};">
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
                    <th rowspan="4" style="background-color: ${theme.secondary}; color: white; padding: 12px; border: 1px solid #cbd5e1;">고객사</th>
                    <th style="background-color: ${theme.tertiary}; color: ${theme.text}; padding: 12px; border: 1px solid #cbd5e1;">고객사명</th>
                    <td colspan="2" style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${info.customer.name}</td>
                    <th style="background-color: ${theme.tertiary}; color: ${theme.text}; padding: 12px; border: 1px solid #cbd5e1;">확인자</th>
                    <td style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;"></td>
                </tr>
                <tr>
                    <th style="background-color: ${theme.tertiary}; color: ${theme.text}; padding: 12px; border: 1px solid #cbd5e1;">지원회사명</th>
                    <td colspan="2" style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${info.customer.support}</td>
                    <th style="background-color: ${theme.tertiary}; color: ${theme.text}; padding: 12px; border: 1px solid #cbd5e1;">점검자</th>
                    <td style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${info.customer.inspector}</td>
                </tr>
                <tr>
                    <th style="background-color: ${theme.tertiary}; color: ${theme.text}; padding: 12px; border: 1px solid #cbd5e1;">점검일자</th>
                    <td colspan="2" style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${info.customer.date}</td>
                    <th style="background-color: ${theme.tertiary}; color: ${theme.text}; padding: 12px; border: 1px solid #cbd5e1;">TEL</th>
                    <td style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff;">${info.customer.phone}</td>
                </tr>
                <tr>
                    <th style="background-color: ${theme.tertiary}; color: ${theme.text}; padding: 12px; border: 1px solid #cbd5e1;">점검구분</th>
                    <td colspan="2" style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff; white-space: pre-wrap;">${info.customer.type}</td>
                    <th style="background-color: ${theme.tertiary}; color: ${theme.text}; padding: 12px; border: 1px solid #cbd5e1;">추가 사항</th>
                    <td style="padding: 12px; border: 1px solid #cbd5e1; background-color: #fff; white-space: pre-wrap;">${info.customer.note}</td>
                </tr>

                <tr>
                    <th rowspan="${systems.length + 1}" style="background-color: ${theme.secondary}; color: white; padding: 12px; border: 1px solid #cbd5e1;">시스템<br />정보</th>
                    <th style="background-color: ${theme.tertiary}; color: ${theme.text}; padding: 12px; border: 1px solid #cbd5e1;">제품명</th>
                    <th style="background-color: ${theme.tertiary}; color: ${theme.text}; padding: 12px; border: 1px solid #cbd5e1;">장비명</th>
                    <th style="background-color: ${theme.tertiary}; color: ${theme.text}; padding: 12px; border: 1px solid #cbd5e1;">버전정보</th>
                    <th style="background-color: ${theme.tertiary}; color: ${theme.text}; padding: 12px; border: 1px solid #cbd5e1;">고객사</th>
                    <th style="background-color: ${theme.tertiary}; color: ${theme.text}; padding: 12px; border: 1px solid #cbd5e1;">용도</th>
                </tr>
                ${systemRows}

                <tr>
                    <th rowspan="${licenses.length * 5 + 1}" style="background-color: ${theme.secondary}; color: white; padding: 12px; border: 1px solid #cbd5e1;">라이선스<br />정보</th>
                    <th style="background-color: ${theme.tertiary}; color: ${theme.text}; padding: 12px; border: 1px solid #cbd5e1;">Appliance</th>
                    <th style="background-color: ${theme.tertiary}; color: ${theme.text}; padding: 12px; border: 1px solid #cbd5e1;">Serial Number</th>
                    <th style="background-color: ${theme.tertiary}; color: ${theme.text}; padding: 12px; border: 1px solid #cbd5e1;">
                         ${reportType === 'HX' ? 'Appliance ID' : 'MAC ID'}
                    </th>
                    <th style="background-color: ${theme.tertiary}; color: ${theme.text}; padding: 12px; border: 1px solid #cbd5e1;">End Date</th>
                    <th style="background-color: ${theme.tertiary}; color: ${theme.text}; padding: 12px; border: 1px solid #cbd5e1;">Feature</th>
                </tr>
                ${licenseRows}

                <tr>
                    <th style="background-color: ${theme.secondary}; color: white; padding: 12px; border: 1px solid #cbd5e1;">점검 종합의견</th>
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
