import { App, Menu, Notice } from 'obsidian';
import type { MapSettings } from './settings';
import { formsApi } from './integrations/oxill-forms';
import { t } from './i18n';

export function addFormMenuItems(app: App, menu: Menu, settings: MapSettings, values: Record<string, unknown>): void {
	if (!settings.formConnectorEnabled || settings.formActions.length === 0) return;
	menu.addSeparator();
	for (const action of settings.formActions) menu.addItem(item => item
		.setSection('oxill-forms')
		.setTitle(action.label)
		.setIcon(action.icon || 'notebook-pen')
		.onClick(() => {
			const api = formsApi(app);
			if (!api) { new Notice(t('Oxill Forms не установлен или выключен', 'Oxill Forms is not installed or enabled')); return; }
			void Promise.resolve(api.openForm(action.target, { values })).catch(error => {
				console.error('Oxill Maps: failed to open form', error);
				new Notice(t('Не удалось открыть форму', 'Could not open the form'));
			});
		}));
}
