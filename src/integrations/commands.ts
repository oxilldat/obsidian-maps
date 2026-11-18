import type { App } from 'obsidian';

export interface ObsidianCommand { id: string; name: string; icon?: string }

interface CommandManager {
	listCommands(): ObsidianCommand[];
	executeCommandById(id: string): boolean;
}

export function commandManager(app: App): CommandManager | null {
	return (app as App & { commands?: CommandManager }).commands ?? null;
}
