import type { App } from 'obsidian';

interface OxillFormsApi {
	listForms(): string[] | Promise<string[]>;
	openForm(name: string, options?: { values?: Record<string, unknown> }): void | Promise<void>;
}

interface PluginRegistry { plugins?: Record<string, { api?: OxillFormsApi }> }

export function formsApi(app: App): OxillFormsApi | null {
	const plugins = (app as App & { plugins?: PluginRegistry }).plugins;
	return plugins?.plugins?.['oxill-forms']?.api ?? null;
}
