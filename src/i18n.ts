export function t(ru: string, en: string): string {
	return document.documentElement.lang.toLowerCase().startsWith('ru') ? ru : en;
}
