import { Project } from 'ts-morph';
import { writeFileSync } from 'fs';
import { join } from 'path';
import chokidar from 'chokidar';

// Configurações
const ICON_PACKAGES = {
	solid: '@fortawesome/free-solid-svg-icons',
	regular: '@fortawesome/free-regular-svg-icons',
	brands: '@fortawesome/free-brands-svg-icons',
} as const;

const PROJECT_ROOT = process.cwd();
const OUTPUT_FILE = join(
	PROJECT_ROOT,
	'src/__generated__/fontawesome.ts',
);

// Mapeamento mais completo de ícones
const BRAND_ICONS = new Set([
	'github',
	'twitter',
	'facebook',
	'instagram',
	'linkedin',
	'youtube',
	'whatsapp',
	'discord',
]);

const REGULAR_ICONS = new Set([
	'circle',
	'square',
	'file',
	'clock',
	'calendar',
	'envelope',
	'star',
]);

function detectIconPackage(
	iconName: string,
): keyof typeof ICON_PACKAGES {
	const baseName = iconName.replace(/^fa/, '').toLowerCase();

	if (BRAND_ICONS.has(baseName)) return 'brands';
	if (REGULAR_ICONS.has(baseName)) return 'regular';
	return 'solid'; // Padrão
}

// Padrões de busca mais abrangentes
async function findUsedIcons() {
	const project = new Project();
	const files = project.addSourceFilesAtPaths([
		'src/**/*.{tsx,jsx}',
		'!**/node_modules/**',
		'!**/*.stories.{tsx,jsx}',
	]);

	const usedIcons = new Map<string, keyof typeof ICON_PACKAGES>();

	files.forEach((file) => {
		file.forEachDescendant((node) => {
			const text = node.getText();

			// Padrão 1: icon={faIcon}
			const directUsage = text.match(/icon=\{fa([A-Za-z0-9]+)\}/);
			if (directUsage?.[1]) {
				const iconName = directUsage[1];
				usedIcons.set(iconName, detectIconPackage(`fa${iconName}`));
			}

			// Padrão 2: icon="icon-name"
			const stringUsage = text.match(/icon=["']([a-z-]+)["']/);
			if (stringUsage?.[1]) {
				const iconName = stringUsage[1].replace(/-/g, '');
				usedIcons.set(iconName, detectIconPackage(`fa${iconName}`));
			}

			// Padrão 3: Objeto com left/right
			const objUsage = text.match(
				/(left|right):\s*fa([A-Za-z0-9]+)/g,
			);
			objUsage?.forEach((match) => {
				const iconName = match.split(':')[1].trim().replace('fa', '');
				usedIcons.set(iconName, detectIconPackage(`fa${iconName}`));
			});
		});
	});

	return usedIcons;
}

// 4. Gera o arquivo
async function generateFontawesomeFile(
	icons: Map<string, keyof typeof ICON_PACKAGES>,
) {
	const imports: string[] = [];
	const iconEntries: string[] = [];

	icons.forEach((pkg, icon) => {
		imports.push(
			`import { fa${icon} } from '${ICON_PACKAGES[pkg]}';`,
		);
		iconEntries.push(`fa${icon}`);
	});

	const content = `
// AUTO-GENERATED - ATUALIZADO DINAMICAMENTE
import { library } from '@fortawesome/fontawesome-svg-core';
${imports.join('\n')}

library.add(
  ${iconEntries.join(',\n  ')}
);
`;

	writeFileSync(OUTPUT_FILE, content.trim());
	console.log(
		`✅ ${icons.size} ícones adicionados em ${OUTPUT_FILE}`,
	);
}

// 5. Execução principal
async function run() {
	try {
		const usedIcons = await findUsedIcons();
		if (usedIcons.size === 0) {
			console.warn(
				'⚠️ Nenhum ícone FontAwesome encontrado nos arquivos .tsx',
			);
			return;
		}
		await generateFontawesomeFile(usedIcons);
	} catch (error) {
		console.error('❌ Erro ao gerar fontawesome.ts:', error);
		process.exit(1);
	}
}

run();

// Verifica se o modo --watch está ativo
if (process.argv.includes('--watch')) {
	console.log(
		'👀 fontawesome: Assistindo alterações em arquivos .tsx/.jsx...',
	);
	const watcher = chokidar.watch('src/**/*.{tsx,jsx}', {
		ignoreInitial: true,
		ignored: ['**/node_modules/**', '**/*.stories.{tsx,jsx}'],
	});

	watcher.on('all', async (event, path) => {
		console.log(`📦 Arquivo alterado: ${path} (${event})`);
		await run();
	});
}
