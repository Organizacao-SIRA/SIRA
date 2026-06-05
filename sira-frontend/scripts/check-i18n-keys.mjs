import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const resourcesDir = path.join(root, 'src', 'i18n', 'resources');
const backendErrorCodesPath = path.join(root, '..', 'sira-backend', 'src', 'common', 'constants', 'error-codes.ts');
const locales = ['pt-BR', 'en-US'];
const checkedJsxAttributes = new Set(['aria-label', 'alt', 'description', 'label', 'placeholder', 'title']);
const humanTextPattern = /[a-zÀ-ÿ]/;

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

const unwrapExpression = (node) => {
  if (ts.isAsExpression(node) || ts.isSatisfiesExpression(node)) {
    return unwrapExpression(node.expression);
  }
  return node;
};

const readExportedObject = (filePath, exportName) => {
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
    if (!declaration || !ts.isIdentifier(declaration.name)) continue;
    if (exportName && declaration.name.text !== exportName) continue;

    const initializer = declaration.initializer ? unwrapExpression(declaration.initializer) : null;
    if (initializer && ts.isObjectLiteralExpression(initializer)) {
      return initializer;
    }
  }

  throw new Error(`No exported resource object found in ${filePath}`);
};

const readResourceKeys = (filePath) => new Set(collectKeys(readExportedObject(filePath)));

const readTopLevelObjectKeys = (filePath, exportName) =>
  new Set(
    readExportedObject(filePath, exportName)
      .properties
      .flatMap((property) => {
        if (!ts.isPropertyAssignment(property)) return [];
        const name = propertyName(property.name);
        return name ? [name] : [];
      }),
  );

const filesFor = (locale) =>
  fs.readdirSync(path.join(resourcesDir, locale))
    .filter((file) => file.endsWith('.ts'))
    .sort();

const walkFiles = (dir, predicate) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'dist' || entry.name === 'node_modules') return [];
      return walkFiles(fullPath, predicate);
    }
    return predicate(fullPath) ? [fullPath] : [];
  });
};

const locationFor = (source, node) => {
  const { line, character } = source.getLineAndCharacterOfPosition(node.getStart(source));
  return `${path.relative(root, source.fileName)}:${line + 1}:${character + 1}`;
};

const hasHumanLiteral = (value) => humanTextPattern.test(value.trim());

const collectHardcodedJsxText = (filePath) => {
  const source = ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const findings = [];

  const visit = (node) => {
    if (ts.isJsxText(node) && hasHumanLiteral(node.getText(source))) {
      findings.push(`${locationFor(source, node)} hardcoded JSX text`);
    }

    if (ts.isJsxAttribute(node)) {
      const attrName = node.name.getText(source);
      const initializer = node.initializer;
      if (
        checkedJsxAttributes.has(attrName)
        && initializer
        && ts.isStringLiteral(initializer)
        && hasHumanLiteral(initializer.text)
      ) {
        findings.push(`${locationFor(source, node)} hardcoded JSX attribute ${attrName}`);
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(source);
  return findings;
};

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

if (fs.existsSync(backendErrorCodesPath)) {
  const backendErrorCodes = readTopLevelObjectKeys(backendErrorCodesPath, 'ERROR_CODES');

  for (const locale of locales) {
    const commonKeys = readResourceKeys(path.join(resourcesDir, locale, 'common.ts'));
    for (const code of backendErrorCodes) {
      if (!commonKeys.has(`errorCodes.${code}`)) {
        failures.push(`${locale}/common.ts missing errorCodes.${code}`);
      }
    }
  }
}

const sourceFiles = walkFiles(path.join(root, 'src'), (filePath) =>
  filePath.endsWith('.tsx')
  && !filePath.includes(`${path.sep}i18n${path.sep}resources${path.sep}`)
);

for (const finding of sourceFiles.flatMap(collectHardcodedJsxText)) {
  failures.push(finding);
}

if (failures.length > 0) {
  console.error('i18n key check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('i18n key check passed.');
