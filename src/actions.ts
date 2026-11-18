import { App, FuzzySuggestModal, Menu, Notice } from 'obsidian';
import { commandManager, ObsidianCommand } from './integrations/commands';
import { formsApi } from './integrations/oxill-forms';
import { t } from './i18n';

class CommandPicker extends FuzzySuggestModal<ObsidianCommand> {
	getItems(): ObsidianCommand[] { return commandManager(this.app)?.listCommands() ?? []; }
	getItemText(item: ObsidianCommand): string { return item.name; }
	onChooseItem(item: ObsidianCommand): void { commandManager(this.app)?.executeCommandById(item.id); }
}

class FormPicker extends FuzzySuggestModal<string> {
	constructor(app: App, private readonly values: Record<string, unknown>) { super(app); }
	private forms: string[] = [];
	async onOpen(): Promise<void> {
		const api = formsApi(this.app);
		this.forms = api ? await api.listForms() : [];
		void super.onOpen();
	}
	getItems(): string[] { return this.forms; }
	getItemText(item: string): string { return item; }
	onChooseItem(item: string): void { void Promise.resolve(formsApi(this.app)?.openForm(item, { values: this.values })).catch(error => console.error('Oxill Maps: failed to open form', error)); }
}

export interface MapActionContext {
	event: MouseEvent;
	values: Record<string, unknown>;
	filePath?: string;
	createNote?: () => void;
}

export function showActionMenu(app: App, context: MapActionContext): void {
	const menu = Menu.forEvent(context.event);
	if (context.filePath) menu.addItem(item => item.setTitle(t('Открыть заметку', 'Open note')).setIcon('file-text').onClick(() => void app.workspace.openLinkText(context.filePath ?? '', '', false)));
	const createNote = context.createNote;
	if (createNote) menu.addItem(item => item.setTitle(t('Создать заметку здесь', 'Create note here')).setIcon('square-pen').onClick(() => createNote()));
	menu.addItem(item => item.setTitle(t('Выполнить команду', 'Run command')).setIcon('terminal').onClick(() => new CommandPicker(app).open()));
	menu.addItem(item => item.setTitle(t('Открыть форму Oxill Forms', 'Open Oxill Forms form')).setIcon('notebook-pen').onClick(() => {
		if (!formsApi(app)) { new Notice(t('Oxill Forms не установлен или выключен', 'Oxill Forms is not installed or enabled')); return; }
		new FormPicker(app, context.values).open();
	}));
}
