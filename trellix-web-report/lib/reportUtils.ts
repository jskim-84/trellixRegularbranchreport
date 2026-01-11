export const NORMAL_KEYWORDS = ['Good', 'Ok', 'Online', 'Healthy', 'Healthy System', 'Success', 'Normal', '정상'];

export function getResultStatus(text: string): 'normal' | 'issue' {
    if (!text) return 'normal';

    // Check if the text contains explicit Issue keywords? 
    // Or check if it contains Normal keywords.
    // The requirement says "Normal -> Plain, Issue -> Highlight".
    // Usually "Issue" is harder to define (infinite variations), so we whitelist "Normal".
    // BUT we must be careful. If text is just "CPU: 50%", is that normal? 
    // Ideally we check if it *contains* failure words, OR we check if it *matches* normal patterns.

    // Let's refine based on the example: "Overall fan health: healthySystem" -> Normal.
    // "Fan 1: ... (Ok)" -> Normal.

    // Simplest approach: If it contains any of the NORMAL_KEYWORDS (case insensitive), treat as mostly normal, 
    // unless it ALSO contains error keywords? 
    // Actually, usually "Status: Good" implies normal.
    // Use a loose match for now.

    const lower = text.toLowerCase();
    const isNormal = NORMAL_KEYWORDS.some(k => lower.includes(k.toLowerCase()));

    return isNormal ? 'normal' : 'issue';
}

export function formatResultText(text: string): string {
    if (!text) return '';

    // 1. Normalize CamelCase (healthySystem -> Healthy System)
    let formatted = text.replace(/healthySystem/gi, 'Healthy System');

    // 2. Normalize RAID
    formatted = formatted.replace(/raid/gi, 'RAID');

    // 3. Bold "Overall whatever:" lines
    // Logic: Look for lines starting with "Overall" and containing ":"
    // We will handle HTML formatting in the component/generator, here we just normalize text.
    // Actually, for HTML export and React rendering, we need different outputs (string vs JSX). 
    // Let's keep this function for STRING normalization.

    return formatted;
}

export function parseCriteriaText(text: string) {
    // Separate main criteria from CLI command
    // Regex to find (CLI - ...) or (CLI : ...)
    const cliRegex = /\(CLI\s*[-:]\s*(.*?)\)/i;
    const match = text.match(cliRegex);

    if (match) {
        return {
            main: text.replace(cliRegex, '').trim(),
            command: `(CLI - ${match[1]})`
        };
    }

    return { main: text, command: null };
}
