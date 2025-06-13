import { Project } from 'ts-morph';
import { writeFileSync } from 'fs';
import { join } from 'path';

// 1. Configurações - TODOS os pacotes free
const ICON_PACKAGES = {
	solid: '@fortawesome/free-solid-svg-icons',
	regular: '@fortawesome/free-regular-svg-icons',
	brands: '@fortawesome/free-brands-svg-icons',
};

const PROJECT_ROOT = process.cwd();
const OUTPUT_FILE = join(PROJECT_ROOT, 'src/utils/fontawesome.ts');

// 2. Mapeia prefixos (ex: 'faHome' -> 'solid', 'faGithub' -> 'brands')
function detectIconPackage(
	iconName: string,
): keyof typeof ICON_PACKAGES {
	// Ícones de marcas (ex: faGithub, faTwitter) -> brands
	if (
		/fa(Github|Twitter|Facebook|Instagram|Linkedin)/.test(iconName)
	) {
		return 'brands';
	}
	// Ícones regulares (ex: faCircle[x], faSquare[x]) -> regular
	if (/fa(Circle|Square)[A-Z]/.test(iconName)) {
		return 'regular';
	}
	// Padrão: solid
	return 'solid';
}

// 3. Encontra ícones usados
async function findUsedIcons() {
	const project = new Project();
	const files = project.addSourceFilesAtPaths('src/**/*.tsx');

	const usedIcons = new Map<string, keyof typeof ICON_PACKAGES>();

	files.forEach((file) => {
		file.forEachDescendant((node) => {
			// Caso 1: <FontAwesomeIcon icon="home" /> (assume solid por padrão)
			if (node.getText().includes('icon="')) {
				const match = node.getText().match(/icon="([^"]+)"/);
				if (match?.[1]) usedIcons.set(match[1], 'solid');
			}

			// Caso 2: <FontAwesomeIcon icon={faHome} />
			if (node.getText().includes('icon={fa')) {
				const match = node.getText().match(/icon=\{fa([^}]+)\}/);
				if (match?.[1]) {
					const packageType = detectIconPackage(`fa${match[1]}`);
					usedIcons.set(match[1], packageType);
				}
			}
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
(async () => {
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
})();
