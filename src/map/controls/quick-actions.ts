import { setIcon } from 'obsidian';
import type { IControl, Map } from 'maplibre-gl';
import type OxillMapsPlugin from '../../main';
import { commandManager } from '../../integrations/commands';
import { t } from '../../i18n';

export class QuickActionsControl implements IControl {
	private containerEl = createDiv('maplibregl-ctrl oxm-quick-actions');
	private actionsEl = this.containerEl.createDiv('oxm-quick-actions__items');
	constructor(private plugin: OxillMapsPlugin) {}
	onAdd(_map: Map): HTMLElement {
		const toggle = this.containerEl.createEl('button', { cls: 'oxm-map-button oxm-quick-actions__toggle', attr: { 'aria-label': t('Быстрые действия', 'Quick actions'), 'aria-expanded': 'false' } });
		this.containerEl.prepend(toggle);
		setIcon(toggle, 'ellipsis-vertical');
		for (const action of this.plugin.settings.quickActions) this.addButton(action.icon || 'terminal', action.label, () => commandManager(this.plugin.app)?.executeCommandById(action.target));
		toggle.addEventListener('click', () => {
			const open = !this.containerEl.hasClass('is-open');
			this.containerEl.toggleClass('is-open', open);
			toggle.setAttribute('aria-expanded', String(open));
		});
		return this.containerEl;
	}
	private addButton(icon: string, label: string, action: () => void): void {
		const button = this.actionsEl.createEl('button', { cls: 'oxm-map-button', attr: { 'aria-label': label, title: label } });
		setIcon(button, icon);
		button.addEventListener('click', () => { action(); this.containerEl.removeClass('is-open'); });
	}
	onRemove(): void { this.containerEl.detach(); }
}
