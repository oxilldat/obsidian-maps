import { App, FuzzySuggestModal, getIconIds, Modal, PluginSettingTab, Setting } from 'obsidian';
import type { SettingDefinition, SettingDefinitionGroup, SettingDefinitionItem } from 'obsidian';
import OxillMapsPlugin from './main';
import { commandManager, ObsidianCommand } from './integrations/commands';
import { formsApi } from './integrations/oxill-forms';
import { t } from './i18n';
import authorAvatar from '../assets/ava.jpg';

export interface TileSet { id: string; name: string; lightTiles: string; darkTiles: string }
export interface QuickAction { target: string; label: string; icon: string }
export interface MapSettings { tileSets: TileSet[]; quickActions: QuickAction[]; formConnectorEnabled: boolean; formActions: QuickAction[] }
export const DEFAULT_SETTINGS: MapSettings = { tileSets: [], quickActions: [], formConnectorEnabled: false, formActions: [] };

class TileSetModal extends Modal {
	private value: TileSet;
	constructor(app: App, tileSet: TileSet | null, private onSave: (value: TileSet) => void) {
		super(app); this.value = tileSet ?? { id: crypto.randomUUID(), name: '', lightTiles: '', darkTiles: '' };
	}
	onOpen(): void {
		this.setTitle(t('Фон карты', 'Map background'));
		new Setting(this.contentEl).setName(t('Название', 'Name')).addText(c => c.setValue(this.value.name).onChange(v => this.value.name = v));
		new Setting(this.contentEl).setName(t('Светлая тема', 'Light mode')).setDesc(t('URL тайлов или стиля.', 'Tile or style URL.')).addText(c => c.setValue(this.value.lightTiles).onChange(v => this.value.lightTiles = v));
		new Setting(this.contentEl).setName(t('Тёмная тема', 'Dark mode')).setDesc(t('Необязательно.', 'Optional.')).addText(c => c.setValue(this.value.darkTiles).onChange(v => this.value.darkTiles = v));
		const footer = this.modalEl.createDiv('modal-button-container');
		footer.createEl('button', { cls: 'mod-cta', text: t('Сохранить', 'Save') }).onclick = () => { this.onSave(this.value); this.close(); };
		footer.createEl('button', { text: t('Отмена', 'Cancel') }).onclick = () => this.close();
	}
}

class CommandActionPicker extends FuzzySuggestModal<ObsidianCommand> {
	constructor(app: App, private choose: (item: ObsidianCommand) => void) { super(app); this.setPlaceholder(t('Выберите команду…', 'Choose a command…')); }
	getItems(): ObsidianCommand[] { return commandManager(this.app)?.listCommands() ?? []; }
	getItemText(item: ObsidianCommand): string { return item.name; }
	onChooseItem(item: ObsidianCommand): void { this.choose(item); }
}

class FormActionPicker extends FuzzySuggestModal<string> {
	private forms: string[] = [];
	constructor(app: App, private choose: (item: string) => void) { super(app); this.setPlaceholder(t('Выберите форму…', 'Choose a form…')); }
	async onOpen(): Promise<void> { this.forms = await (formsApi(this.app)?.listForms() ?? []); void super.onOpen(); }
	getItems(): string[] { return this.forms; }
	getItemText(item: string): string { return item; }
	onChooseItem(item: string): void { this.choose(item); }
}

class IconPicker extends FuzzySuggestModal<string> {
	constructor(app: App, private choose: (icon: string) => void) { super(app); this.setPlaceholder(t('Выберите иконку…', 'Choose an icon…')); }
	getItems(): string[] { return getIconIds(); }
	getItemText(item: string): string { return item; }
	onChooseItem(item: string): void { this.choose(item); }
}

export class MapSettingTab extends PluginSettingTab {
	constructor(app: App, public plugin: OxillMapsPlugin) { super(app, plugin); }
	getSettingDefinitions(): SettingDefinitionItem[] {
		return [this.backgroundsGroup(), this.actionsGroup('quickActions'), this.actionsGroup('formActions'), this.authorCard()];
	}
	private group(items: SettingDefinition[]): SettingDefinitionGroup { return { type: 'group', cls: 'oxm-settings-group', items }; }
	private backgroundsGroup(): SettingDefinitionGroup {
		const items: SettingDefinition[] = [{
			name: t('Фоны карты', 'Map backgrounds'),
			desc: t('Наборы тайлов доступны всем представлениям карты.', 'Tile sets are available to every map view.'),
			render: setting => { setting.addButton(button => button.setButtonText(t('Добавить', 'Add')).setCta().onClick(() => new TileSetModal(this.app, null, value => { this.plugin.settings.tileSets.push(value); void this.save(); }).open())); },
		}];
		for (const [index, tile] of this.plugin.settings.tileSets.entries()) items.push({ name: tile.name || t('Без названия', 'Untitled'), render: setting => { setting.addExtraButton(b => b.setIcon('pen-line').setTooltip(t('Изменить', 'Edit')).onClick(() => new TileSetModal(this.app, { ...tile }, value => { this.plugin.settings.tileSets[index] = value; void this.save(); }).open())).addExtraButton(b => b.setIcon('trash-2').setTooltip(t('Удалить', 'Delete')).onClick(() => { this.plugin.settings.tileSets.splice(index, 1); void this.save(); })); } });
		return this.group(items);
	}
	private actionsGroup(key: 'quickActions' | 'formActions'): SettingDefinitionGroup {
		const forms = key === 'formActions';
		const items: SettingDefinition[] = [{
			name: forms ? t('Коннектор Oxill Forms', 'Oxill Forms connector') : t('Быстрые действия', 'Quick actions'),
			desc: forms ? t('Включает формы на карте и передаёт в них координаты.', 'Enables forms on the map and passes coordinates to them.') : t('Команды под функциональной кнопкой в правом верхнем углу карты.', 'Commands under the top-right action button.'),
			render: setting => {
				if (forms) setting.addToggle(toggle => toggle.setValue(this.plugin.settings.formConnectorEnabled).onChange(value => { this.plugin.settings.formConnectorEnabled = value; void this.save(); }));
				else setting.addButton(button => button.setButtonText(t('Добавить', 'Add')).setCta().onClick(() => new CommandActionPicker(this.app, item => { this.plugin.settings.quickActions.push({ target: item.id, label: item.name, icon: item.icon ?? 'terminal' }); void this.save(); }).open()));
			},
		}];
		if (forms && this.plugin.settings.formConnectorEnabled) items.push({ name: t('Формы на карте', 'Forms on the map'), desc: t('Выберите сохранённую форму Oxill Forms.', 'Choose a saved Oxill Forms form.'), render: setting => { setting.addButton(button => button.setButtonText(t('Добавить', 'Add')).setCta().onClick(() => new FormActionPicker(this.app, name => { this.plugin.settings.formActions.push({ target: name, label: name, icon: 'notebook-pen' }); void this.save(); }).open())); } });
		if (forms && !this.plugin.settings.formConnectorEnabled) return this.group(items);
		for (const [index, action] of this.plugin.settings[key].entries()) items.push({ name: action.label, desc: action.target, render: setting => {
			if (!forms) setting.addExtraButton(button => button.setIcon(action.icon || 'terminal').setTooltip(t('Изменить иконку', 'Change icon')).onClick(() => new IconPicker(this.app, icon => { action.icon = icon; void this.save(); }).open()));
			setting.addExtraButton(button => button.setIcon('trash-2').setTooltip(t('Удалить', 'Delete')).onClick(() => { this.plugin.settings[key].splice(index, 1); void this.save(); }));
		} });
		return this.group(items);
	}
	private authorCard(): SettingDefinition {
		return { name: t('Автор и поддержка', 'Author and support'), searchable: false, render: setting => { setting.settingEl.empty(); setting.settingEl.addClass('oxm-author-setting'); this.renderAuthorCard(setting.settingEl); } };
	}
	private renderAuthorCard(container: HTMLElement): void {
		const card = container.createDiv('oxm-author-card');
		const top = card.createDiv('oxm-author-top');
		top.createEl('img', { cls: 'oxm-author-avatar', attr: { src: authorAvatar, alt: 'oxill' } });
		const copy = top.createDiv('oxm-author-copy');
		copy.createDiv({ cls: 'oxm-author-title', text: t('Нравится плагин?', 'Like the plugin?') });
		copy.createEl('p', { text: t('Поддержите проект или подпишитесь', 'Support the project or follow its updates') });
		const links = card.createDiv('oxm-social-links');
		this.addSocialButton(links, 'telegram', 'Telegram', 'https://t.me/oxilldat', 'M21.7 3.4 18.5 19c-.2 1.1-.9 1.4-1.8.9l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9-8.1c.4-.4-.1-.6-.6-.2L6.1 12.8 1.3 11.3c-1-.3-1-1 .2-1.5L20.3 2.6c.9-.3 1.7.2 1.4.8Z');
		this.addSocialButton(links, 'boosty', 'Boosty', 'https://boosty.to/oxilldat', 'm13.1 2-3.8 7.4 2.5.1-3.7 6.7 3.4.1L9.7 22c5.5-1.8 9-5.2 9-9.2 0-2.8-1.8-4.8-4.5-5.5L16.6 2h-3.5Zm-.8 17.1 1.2-4.4-2.6-.1 3.4-6.2c1.6.5 2.6 1.8 2.6 3.7 0 2.7-1.7 5-4.6 7Z');
		this.addSocialButton(links, 'youtube', 'YouTube', 'https://www.youtube.com/@oxilldat', 'M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z');
	}
	private addSocialButton(parent: HTMLElement, brand: string, label: string, url: string, pathData: string): void {
		const link = parent.createEl('a', { cls: `oxm-social-button is-${brand}`, attr: { href: url, target: '_blank', rel: 'noopener noreferrer', 'aria-label': label, title: label } });
		const svg = createSvg('svg', { attr: { viewBox: '0 0 24 24', 'aria-hidden': 'true' } });
		svg.appendChild(createSvg('path', { attr: { d: pathData } }));
		link.appendChild(svg);
	}
	private async save(): Promise<void> { await this.plugin.saveSettings(); this.update(); }
}
