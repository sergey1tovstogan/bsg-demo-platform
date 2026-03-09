/**
 * Generate temenosComponentsData.ts from component-list.json
 * Run: node scripts/generate-temenos-components.js
 */

const fs = require('fs');
const path = require('path');

const defaultJsonPath = path.join(__dirname, '..', 'component-list.json');
const outPath = path.join(__dirname, '../frontend/src/components/temenos-components/temenosComponentsData.ts');

// Use project's component-list.json by default, or path from argv
const inputPath = process.argv[2] || defaultJsonPath;

if (!fs.existsSync(inputPath)) {
  console.error('component-list.json not found at:', inputPath);
  console.error('Usage: node scripts/generate-temenos-components.js [path/to/component-list.json]');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const comps = data.components;

// Build group order: priority groups first, then from JSON groupOrder, then any extras
const PRIORITY_GROUPS = ['Runtime', 'Core Services', 'Service Architecture', 'Core Modules'];
const groupOrderFlat = [...PRIORITY_GROUPS];
if (data.groupOrder) {
  for (const cat of Object.values(data.groupOrder)) {
    for (const g of cat) {
      if (!groupOrderFlat.includes(g)) groupOrderFlat.push(g);
    }
  }
}
const groupOrderIndex = (g) => {
  const i = groupOrderFlat.indexOf(g);
  return i >= 0 ? i : 9999;
};

const active = comps
  .filter((c) => c.yearAbandoned === null && c.tag !== 'Roadmap')
  .sort((a, b) => {
    const ga = groupOrderIndex(a.group);
    const gb = groupOrderIndex(b.group);
    if (ga !== gb) return ga - gb;
    return (a.sortOrder ?? 999) - (b.sortOrder ?? 999);
  });
const future = comps.filter((c) => c.tag === 'Roadmap');

function toId(name) {
  return name
    .replace(/\s*\([^)]*\)\s*/g, '-')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function toItem(c) {
  return {
    id: toId(c.name),
    name: c.name,
    description: c.description,
    introduced: String(c.yearIntroduced),
    group: c.group || 'Other',
    category: c.category,
  };
}

const activeItems = active.map(toItem);
const futureItems = future.map(toItem);

// Build group order from groupOrderFlat + any extra groups from active
const activeGroupOrder = [...groupOrderFlat];
for (const item of activeItems) {
  if (item.group && !activeGroupOrder.includes(item.group)) {
    activeGroupOrder.push(item.group);
  }
}

function escape(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

function formatItem(item, indent) {
  return `${indent}{
${indent}  id: '${item.id}',
${indent}  name: '${escape(item.name)}',
${indent}  introduced: '${item.introduced}',
${indent}  group: '${escape(item.group)}',
${indent}  description: '${escape(item.description)}',
${indent}},`;
}

const activeStr = activeItems.map((i) => formatItem(i, '    ')).join('\n');
const futureStr = futureItems.map((i) => formatItem(i, '    ')).join('\n');

const groupOrderStr = activeGroupOrder.map((g) => `  '${g.replace(/'/g, "\\'")}'`).join(',\n');

const output = `/**
 * Temenos Active and Future Components
 * Generated from component-list.json - DO NOT EDIT MANUALLY
 * Run: node scripts/generate-temenos-components.js [path/to/component-list.json]
 */

export interface TemenosComponentItem {
  id: string
  name: string
  description: string
  introduced?: string
  group?: string
  category?: string
}

export interface TemenosComponentsData {
  active: TemenosComponentItem[]
  future: TemenosComponentItem[]
}

export const temenosComponentsData: TemenosComponentsData = {
  active: [
${activeStr}
  ],
  future: [
${futureStr}
  ],
}

/** Group display order for Active components - update TemenosComponentsContent.tsx ACTIVE_GROUP_ORDER if needed */
export const ACTIVE_GROUP_ORDER = [
${groupOrderStr}
];

/** Known aliases: Azure/deployment names -> catalog component ID */
const COMPONENT_NAME_ALIASES: Record<string, string> = {
  'statement generation microservice': 'camt',
  'statement generation': 'camt',
  'stmtgen': 'camt',
  'stmt-gen': 'camt',
  'party v2 microservice': 'party-master',
  'party v2': 'party-master',
  'party microservice': 'party-master',
  'deposits microservice': 'deposits-accounts',
  'deposits': 'deposits-accounts',
  'camt microservice': 'camt',
  'virtual table microservice': 'virtual-tables',
  'virtual table': 'virtual-tables',
  'notification microservice': 'notification',
  'audit microservice': 'audit',
  'file management microservice': 'file-management',
  'workflow microservice': 'workflow',
  'integration microservice': 'integration',
  'web ingress microservice': 'web-ingress',
  'ingress microservice': 'ingress',
}

export function getComponentIdFromName(componentName: string): string | null {
  if (!componentName || typeof componentName !== 'string') return null
  const baseName = componentName.replace(/\\s*microservice\\s*$/i, '').trim()
  const normalized = baseName.toLowerCase().replace(/\\s+/g, '-')
  const aliasKey = baseName.toLowerCase().trim()
  if (COMPONENT_NAME_ALIASES[aliasKey]) return COMPONENT_NAME_ALIASES[aliasKey]
  if (COMPONENT_NAME_ALIASES[normalized]) return COMPONENT_NAME_ALIASES[normalized]
  const allItems = [...temenosComponentsData.active, ...temenosComponentsData.future]
  for (const item of allItems) {
    if (item.id === normalized) return item.id
    if (item.id.replace(/-/g, '') === normalized.replace(/-/g, '')) return item.id
    const nameNorm = item.name.toLowerCase().replace(/\\s+/g, '-')
    if (nameNorm === normalized) return item.id
    if (item.name.toLowerCase().replace(/\\s+/g, '') === baseName.toLowerCase().replace(/\\s+/g, '')) return item.id
  }
  if (allItems.some((c) => c.id === normalized)) return normalized
  return null
}

export function getComponentDisplayName(componentId: string): string {
  const allItems = [...temenosComponentsData.active, ...temenosComponentsData.future]
  const item = allItems.find((c) => c.id === componentId)
  return item?.name ?? componentId.replace(/-/g, ' ')
}

export function getComponentById(componentId: string): TemenosComponentItem | null {
  const allItems = [...temenosComponentsData.active, ...temenosComponentsData.future]
  return allItems.find((c) => c.id === componentId) ?? null
}
`;

// Fix escaped backslashes in the output (the \\s in regex should be \s)
const fixedOutput = output.replace(/\\\\s/g, '\\s');

fs.writeFileSync(outPath, fixedOutput, 'utf8');
console.log('Generated:', outPath);
console.log('Active:', activeItems.length, 'Future:', futureItems.length, 'Total:', activeItems.length + futureItems.length);
console.log('ACTIVE_GROUP_ORDER has', activeGroupOrder.length, 'groups');
