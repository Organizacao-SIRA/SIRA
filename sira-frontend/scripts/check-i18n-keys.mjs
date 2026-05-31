import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const resourcesDir = path.join(root, 'src', 'i18n', 'resources');
const locales = ['pt-BR', 'en-US'];

const propertyName = (name) => {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }
  return null;
};

const collectKeys = (node, prefix = '') => {
  if (!ts.isObjectLiteralExpression(node)) return [];

  return node.properties.flatMap((property) => {
    if (!ts.isPropertyAssignment(property)) return [];
    const name = propertyName(property.name);
    if (!name) return [];

    const key = prefix ? `${prefix}.${name}` : name;
    if (ts.isObjectLiteralExpression(property.initializer)) {
      return collectKeys(property.initializer, key);
    }
    return [key];
  });
};

const readResourceKeys = (filePath) => {
  const source = ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );

  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    const isExported = statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
    if (!isExported) continue;

    const declaration = statement.declarationList.declarations[0];
    if (declaration?.initializer && ts.isObjectLiteralExpression(declaration.initializer)) {
      return new Set(collectKeys(declaration.initializer));
    }
  }

  throw new Error(`No exported resource object found in ${filePath}`);
};

const filesFor = (locale) =>
  fs.readdirSync(path.join(resourcesDir, locale))
    .filter((file) => file.endsWith('.ts'))
    .sort();

const [baseLocale, targetLocale] = locales;
const baseFiles = filesFor(baseLocale);
const targetFiles = filesFor(targetLocale);
const failures = [];

for (const file of new Set([...baseFiles, ...targetFiles])) {
  if (!baseFiles.includes(file)) failures.push(`${baseLocale} missing file ${file}`);
  if (!targetFiles.includes(file)) failures.push(`${targetLocale} missing file ${file}`);
  if (!baseFiles.includes(file) || !targetFiles.includes(file)) continue;

  const baseKeys = readResourceKeys(path.join(resourcesDir, baseLocale, file));
  const targetKeys = readResourceKeys(path.join(resourcesDir, targetLocale, file));

  for (const key of baseKeys) {
    if (!targetKeys.has(key)) failures.push(`${targetLocale}/${file} missing ${key}`);
  }
  for (const key of targetKeys) {
    if (!baseKeys.has(key)) failures.push(`${baseLocale}/${file} missing ${key}`);
  }
}

if (failures.length > 0) {
  console.error('i18n key check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('i18n key check passed.');
