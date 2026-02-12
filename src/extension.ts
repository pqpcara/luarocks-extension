import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const diagnosticCollection = vscode.languages.createDiagnosticCollection('rockspec');

export function activate(context: vscode.ExtensionContext) {
	const initCommand = vscode.commands.registerCommand('luarocks-support.init', initRockspec);
	const completionProvider = vscode.languages.registerCompletionItemProvider(
		{ language: 'rockspec' },
		new RockspecCompletionProvider()
	);

	const diagnosticProvider = vscode.workspace.onDidOpenTextDocument((doc) => {
		if (doc.languageId === 'rockspec') {
			validateRockspec(doc);
		}
	});

	const diagnosticProviderSave = vscode.workspace.onDidSaveTextDocument((doc) => {
		if (doc.languageId === 'rockspec') {
			validateRockspec(doc);
		}
	});

	const diagnosticProviderChange = vscode.workspace.onDidChangeTextDocument((event) => {
		if (event.document.languageId === 'rockspec') {
			validateRockspec(event.document);
		}
	});

	context.subscriptions.push(
		initCommand,
		completionProvider,
		diagnosticProvider,
		diagnosticProviderSave,
		diagnosticProviderChange,
		diagnosticCollection
	);
}

export function deactivate() {}

class RockspecCompletionProvider implements vscode.CompletionItemProvider {
	provideCompletionItems(): vscode.CompletionItem[] {
		const fields = [
			{ label: 'package', detail: 'Package name' },
			{ label: 'version', detail: 'Package version' },
			{ label: 'rockspec_format', detail: 'Rockspec format' },
			{ label: 'description', detail: 'Package description' },
			{ label: 'homepage', detail: 'Homepage URL' },
			{ label: 'license', detail: 'License' },
			{ label: 'author', detail: 'Package author' },
			{ label: 'maintainer', detail: 'Package maintainer' },
			{ label: 'url', detail: 'Repository URL' },
			{ label: 'issues_url', detail: 'Issues URL' },
			{ label: 'labels', detail: 'Package labels/tags' },
			{ label: 'dependencies', detail: 'Package dependencies' },
			{ label: 'build', detail: 'Build configuration' },
			{ label: 'type', detail: 'Build type' },
			{ label: 'modules', detail: 'Lua modules' },
			{ label: 'copy_directories', detail: 'Directories to copy' },
		];

		return fields.map(field => {
			const item = new vscode.CompletionItem(field.label, vscode.CompletionItemKind.Field);
			item.detail = field.detail;
			item.insertText = `${field.label} = `;
			return item;
		});
	}
}

function validateRockspec(document: vscode.TextDocument) {
	const diagnostics: vscode.Diagnostic[] = [];
	const text = document.getText();
	const lines = text.split('\n');

	const requiredFields = ['package', 'version', 'description', 'build'];
	const foundFields = new Set<string>();

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const trimmed = line.trim();

		if (trimmed.startsWith('--') || trimmed === '') {
			continue;
		}

		for (const field of requiredFields) {
			if (trimmed.startsWith(field + ' ')) {
				foundFields.add(field);
			}
		}

		if (trimmed.includes('version') && trimmed.includes('=')) {
			const versionMatch = trimmed.match(/version\s*=\s*["']([^"']+)["']/);
			if (versionMatch) {
				const version = versionMatch[1];
				if (!/^\d+\.\d+\.\d+/.test(version)) {
					const range = new vscode.Range(i, 0, i, line.length);
					diagnostics.push(
						new vscode.Diagnostic(
							range,
							`Invalid version format: "${version}". Use semantic versioning (e.g., 1.0.0)`,
							vscode.DiagnosticSeverity.Warning
						)
					);
				}
			}
		}

		if (trimmed.includes('package') && trimmed.includes('=')) {
			const packageMatch = trimmed.match(/package\s*=\s*["']([^"']+)["']/);
			if (packageMatch) {
				const pkg = packageMatch[1];
				if (!/^[a-z0-9_-]+$/.test(pkg)) {
					const range = new vscode.Range(i, 0, i, line.length);
					diagnostics.push(
						new vscode.Diagnostic(
							range,
							`Invalid package name: "${pkg}". Use only lowercase letters, numbers, hyphens and underscores`,
							vscode.DiagnosticSeverity.Warning
						)
					);
				}
			}
		}

		if (trimmed.includes('url') && trimmed.includes('=') && !trimmed.includes('issues_url')) {
			const urlMatch = trimmed.match(/url\s*=\s*["']([^"']+)["']/);
			if (urlMatch) {
				const url = urlMatch[1];
				if (url && !url.startsWith('http')) {
					const range = new vscode.Range(i, 0, i, line.length);
					diagnostics.push(
						new vscode.Diagnostic(
							range,
							`Invalid URL: "${url}". Should start with http:// or https://`,
							vscode.DiagnosticSeverity.Information
						)
					);
				}
			}
		}
	}

	for (const field of requiredFields) {
		if (!foundFields.has(field)) {
			diagnostics.push(
				new vscode.Diagnostic(
					new vscode.Range(0, 0, 0, 1),
					`Missing required field: "${field}"`,
					vscode.DiagnosticSeverity.Error
				)
			);
		}
	}

	diagnosticCollection.set(document.uri, diagnostics);
}

async function initRockspec() {
	const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
	if (!workspaceFolder) {
		vscode.window.showErrorMessage('No workspace folder open');
		return;
	}

	try {
		const packageName = await vscode.window.showInputBox({
			prompt: 'Package name',
			placeHolder: 'ex: my-awesome-lib',
			validateInput: (value) => {
				if (!value) {
					return 'Package name is required';
				}
				if (!/^[a-z0-9_-]+$/.test(value)) {
					return 'Use only lowercase letters, numbers, hyphens and underscores';
				}
				return '';
			}
		});

		if (!packageName) {
			return;
		}

		const version = await vscode.window.showInputBox({
			prompt: 'Initial version',
			value: '0.1.0',
			validateInput: (value) => {
				if (!/^\d+\.\d+\.\d+/.test(value)) {
					return 'Format: 1.0.0';
				}
				return '';
			}
		});

		if (!version) {
			return;
		}

		const description = await vscode.window.showInputBox({
			prompt: 'Description',
			placeHolder: 'A brief description'
		});

		const author = await vscode.window.showInputBox({
			prompt: 'Author',
			placeHolder: 'Your name'
		});

		const license = await vscode.window.showQuickPick(
			['MIT', 'Apache 2.0', 'GPL 3.0', 'BSD', 'ISC', 'Other'],
			{ placeHolder: 'Select a license' }
		);

		if (!license) {
			return;
		}

		let finalLicense = license;
		if (license === 'Other') {
			const custom = await vscode.window.showInputBox({ prompt: 'Enter license name' });
			if (!custom) {
				return;
			}
			finalLicense = custom;
		}

		const url = await vscode.window.showInputBox({
			prompt: 'Repository URL (optional)',
			placeHolder: 'https://github.com/user/repo'
		});

		const content = generateRockspec({
			packageName,
			version,
			description: description || 'A Lua package',
			author: author || 'Unknown',
			license: finalLicense,
			url: url || ''
		});

		const rockspecPath = path.join(workspaceFolder.uri.fsPath, `${packageName}-${version}-1.rockspec`);
		fs.writeFileSync(rockspecPath, content);

		const doc = await vscode.workspace.openTextDocument(rockspecPath);
		await vscode.window.showTextDocument(doc);

		vscode.window.showInformationMessage(`Rockspec created: ${packageName}-${version}-1.rockspec`);
	} catch (error) {
		vscode.window.showErrorMessage(`Error: ${error}`);
	}
}

function generateRockspec(config: {
	packageName: string;
	version: string;
	description: string;
	author: string;
	license: string;
	url: string;
}): string {
	return `rockspec_format = "3.0"
package = "${config.packageName}"
version = "${config.version}"
description = {
   summary = "${config.description}",
   detailed = "${config.description}",
   homepage = "${config.url || 'https://example.com'}",
   license = "${config.license}"
}
author = "${config.author}"
maintainer = "${config.author}"
url = "${config.url}"
issues_url = "${config.url}/issues"
labels = { "lua", "rocks" }

dependencies = {
   "lua >= 5.1"
}

build = {
   type = "builtin",
   modules = {
      ${config.packageName} = "src/${config.packageName}.lua"
   }
}
`;
}
