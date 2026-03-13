#!/usr/bin/env node
const https = require('https');
const fs = require('fs');
const path = require('path');

const LLMS_TXT_URL = 'https://docs.stacks.co/llms.txt';
const START_MARKER = '<!--DOCS-INDEX-START-->';
const END_MARKER = '<!--DOCS-INDEX-END-->';

function fetchLlmsTxt() {
  return new Promise((resolve, reject) => {
    https.get(LLMS_TXT_URL, { timeout: 15000 }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error('HTTP ' + res.statusCode));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function compressIndex(content) {
  const paths = [];
  let skip = false;
  for (const line of content.split('\n')) {
    if (line.startsWith('## Press') || line.startsWith('## Stacks Brand')) skip = true;
    if (skip) continue;
    const linkMatch = line.match(/\[.*?\]\((\/[^)]+)\)/);
    const rawMatch = line.match(/^- `?(\/[a-z0-9\-/]+\.md)`?/i);
    const docPath = linkMatch ? linkMatch[1] : (rawMatch ? rawMatch[1] : null);
    if (docPath) {
      if (docPath.includes('/zh/') || docPath.includes('/es/')) continue;
      paths.push(docPath);
    }
  }
  const groups = {};
  for (const p of paths) {
    const parts = p.split('/').filter(Boolean);
    const file = parts.pop();
    const dir = parts.join('/') || 'root';
    if (!groups[dir]) groups[dir] = [];
    if (!groups[dir].includes(file)) groups[dir].push(file);
  }
  const header = '[Stacks Docs Index]|root: https://docs.stacks.co|IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning. Fetch docs before writing code.';
  const sortedDirs = Object.keys(groups).sort((a, b) => {
    if (a === 'root') return -1;
    if (b === 'root') return 1;
    return a.localeCompare(b);
  });
  const dirEntries = sortedDirs.filter(dir => dir !== 'root').map(dir => `${dir}:{${groups[dir].join(',')}}`).join('|');
  const compressed = header + '|' + dirEntries;
  return { compressed, pathCount: paths.length };
}

function updateKnowledgeFile(filePath, compressedIndex) {
  const content = fs.readFileSync(filePath, 'utf8');
  const startIdx = content.indexOf(START_MARKER);
  const endIdx = content.indexOf(END_MARKER);
  if (startIdx === -1 || endIdx === -1) throw new Error('Could not find index markers');
  const newContent = content.slice(0, startIdx + START_MARKER.length) + compressedIndex + content.slice(endIdx);
  fs.writeFileSync(filePath, newContent);
}

async function main() {
  const targetFile = process.argv[2] || path.join(__dirname, '..', 'knowledge', 'general-stacks-knowledge.md');
  const resolvedPath = path.resolve(targetFile);
  const llmsTxt = await fetchLlmsTxt();
  const { compressed } = compressIndex(llmsTxt);
  updateKnowledgeFile(resolvedPath, compressed);
  console.log('Update Complete');
}
main().catch(err => { console.error(err); process.exit(1); });
