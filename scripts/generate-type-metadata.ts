import { Project, SyntaxKind, InterfaceDeclaration, TypeAliasDeclaration, PropertySignature } from 'ts-morph';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(path.dirname(__filename));
console.log(__dirname);

console.log(path.resolve(__dirname, './src/ts/' + `**/*.ts`));
const project = new Project({ tsConfigFilePath: path.resolve(__dirname, './tsconfig.json') });
const sourceFiles = project.getSourceFiles([path.resolve(__dirname, './src/ts/' + `**/*.ts`)]);
console.log('Arquivos encontrados:', sourceFiles.map(file => file.getBaseName()));
const outputLines: string[] = [`import { registerType } from '../ts/common/evalTypes';\n`];

// Função para extrair os tipos dos campos de uma interface ou alias de tipo
function extractFieldTypes(node: InterfaceDeclaration | TypeAliasDeclaration): string {
  const members = (node.getKind() === SyntaxKind.InterfaceDeclaration)
    ? (node as InterfaceDeclaration).getProperties()
    : (node as TypeAliasDeclaration).getTypeNodeOrThrow().getType().getProperties();

  const fieldLines: string[] = [];

  // Iterando sobre os membros da interface ou alias de tipo
  for (const member of members) {
    const name = member.getName();
    let typeText = '';

    // Verificando se é uma PropertySignature (uma propriedade) ou um Symbol
    if (member instanceof PropertySignature) {
      // Se for uma PropertySignature, pegamos o tipo diretamente
      typeText = member.getType().getText();
    } else if (member instanceof Symbol) {
      // Se for um Symbol, pegamos o tipo pela localização
      typeText = member.getTypeAtLocation(member.getValueDeclarationOrThrow()).getText();
    }

    // Se o tipo for complexo (ex: união ou função), ignoramos
    if (typeText.includes('|') || typeText.includes('{') || typeText.includes('=>')) continue;

    // Aqui tratamos tipos como arrays ou tipos simples
    const fieldType = `'${typeText.replace(/\[\]$/, '')}'` + (typeText.endsWith('[]') ? `[]` : '');
    fieldLines.push(`  ${name}: ${fieldType},`);
  }

  return `{\n${fieldLines.join('\n')}\n}`;
}

// Para cada arquivo TypeScript encontrado, extraímos os tipos e registramos
console.log(`-----`);
for (const file of sourceFiles) {
  console.log(`Processando arquivo: ${file.getBaseName()}`);
  for (const node of file.getStatements()) {
    if (node.getKind() === SyntaxKind.InterfaceDeclaration || node.getKind() === SyntaxKind.TypeAliasDeclaration) {
      const name = (node as InterfaceDeclaration | TypeAliasDeclaration).getName();
      console.log(`Encontrado tipo: ${name}`);
      const fields = extractFieldTypes(node as InterfaceDeclaration);
      console.log(`Campos extraídos: ${fields}`);
      outputLines.push(`registerType('${name}', Object, ${fields});`);
    }
  }
}

// Criar o arquivo de saída e escrever os tipos registrados
const outputPath = path.resolve(__dirname, './src/__generated__/typeRegistry.ts');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, outputLines.join('\n') + '\n');

console.log(`✔ Tipos registrados em: ${outputPath}`);
