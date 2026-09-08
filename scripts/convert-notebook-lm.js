const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const source = 'c:\\조향덕\\교재\\14.인공지능\\HTML\\노트북LM.htm';
const utf8Copy = path.join(__dirname, 'notebook-lm-utf8.htm');
const target = path.join(__dirname, '../views/partials/notebook-lm-content.ejs');

function decodeHtml(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
    .replace(/&#8226;/g, '•')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\u00a0/g, ' ');
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function stripTags(s) {
  return decodeHtml(s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
}

function inlineSpans(s) {
  let out = s.replace(/<BR\s*\/?>/gi, '');
  out = out.replace(
    /<SPAN[^>]*color\s*:\s*#315f97[^>]*>([\s\S]*?)<\/SPAN>/gi,
    (_, text) => `%%HL%%${decodeHtml(text.replace(/<[^>]+>/g, ''))}%%/HL%%`
  );
  out = out.replace(/<SPAN[^>]*>([\s\S]*?)<\/SPAN>/gi, (_, text) => decodeHtml(text.replace(/<[^>]+>/g, '')));
  out = out.replace(/<[^>]+>/g, '');
  out = out.replace(/%%HL%%([\s\S]*?)%%\/HL%%/g, '<span class="doc-highlight">$1</span>');
  return decodeHtml(out).replace(/^●\s*/, '').trim();
}

function isEmptyParagraph(inner) {
  return !stripTags(inner);
}

function isSectionTitle(inner) {
  const text = stripTags(inner);
  return /font-size:10\.0pt/i.test(inner) && /^\d+\.\s+[가-힣\[]/.test(text);
}

function isStepTitle(inner) {
  return /font-size:10\.0pt/i.test(inner) && /●|&#8226;/.test(inner);
}

function isMainTitle(inner) {
  return (
    /font-size:14\.0pt/i.test(inner) ||
    (/font-size:12\.0pt/i.test(inner) && /●|&#8226;/.test(inner))
  );
}

function extractTableText(tableHtml) {
  const lines = [];
  const pRegex = /<P[^>]*>([\s\S]*?)<\/P>/gi;
  let match;
  while ((match = pRegex.exec(tableHtml)) !== null) {
    const line = stripTags(match[1]);
    if (line) lines.push(line);
  }
  return lines.join('\n');
}

function isPromptTable(tableHtml) {
  return /#\s*역할/i.test(tableHtml);
}

function readSourceUtf8() {
  const ps = `[System.IO.File]::WriteAllText('${utf8Copy.replace(/\\/g, '\\\\')}', [System.IO.File]::ReadAllText('${source.replace(/\\/g, '\\\\')}', [System.Text.Encoding]::GetEncoding(949)), [System.Text.UTF8Encoding]::new($false))`;
  execSync(`powershell -NoProfile -Command "${ps}"`, { stdio: 'pipe' });
  return fs.readFileSync(utf8Copy, 'utf8');
}

const raw = readSourceUtf8();
const bodyMatch = raw.match(/<BODY>([\s\S]*?)<\/BODY>/i);
if (!bodyMatch) {
  console.error('BODY not found');
  process.exit(1);
}

let body = bodyMatch[1];
const tables = [];
body = body.replace(/<TABLE[\s\S]*?<\/TABLE>/gi, (table) => {
  const index = tables.length;
  tables.push(table);
  return `<!--TABLE:${index}-->`;
});

const tokenRegex = /<!--TABLE:\d+-->|<P[\s\S]*?<\/P>/gi;
const tokens = body.match(tokenRegex) || [];
const parts = ['<div class="document-content text-foreground">'];

for (const token of tokens) {
  const tableRef = token.match(/<!--TABLE:(\d+)-->/);
  if (tableRef) {
    const tableHtml = tables[Number(tableRef[1])];
    const text = extractTableText(tableHtml);
    if (!text) continue;
    const label = isPromptTable(tableHtml)
      ? '프롬프트 템플릿 (수정 가능)'
      : '예제 입력 (수정 가능)';
    parts.push(
      `  <textarea class="doc-autotextarea autotextarea" rows="1" aria-label="${label}" spellcheck="false">${escapeHtml(text)}</textarea>`
    );
    continue;
  }

  const innerMatch = token.match(/<P[^>]*>([\s\S]*?)<\/P>/i);
  if (!innerMatch) continue;
  const inner = innerMatch[1];
  if (inner.includes('<!--TABLE:')) continue;
  if (isEmptyParagraph(inner)) continue;

  if (isMainTitle(inner)) {
    const title = stripTags(inner).replace(/^●\s*/, '');
    parts.push(`  <p class="doc-section-title">${escapeHtml(title)}</p>`);
    continue;
  }

  if (isSectionTitle(inner)) {
    const title = stripTags(inner);
    parts.push(`  <p class="doc-subtitle">${escapeHtml(title)}</p>`);
    continue;
  }

  if (isStepTitle(inner)) {
    const title = stripTags(inner).replace(/^●\s*/, '');
    parts.push(`  <p class="doc-step-title">${escapeHtml(title)}</p>`);
    continue;
  }

  const html = inlineSpans(inner);
  if (!html) continue;
  const safe = html.includes('<span') ? html : escapeHtml(html);
  parts.push(`  <p>${safe}</p>`);
}

parts.push('</div>');
fs.writeFileSync(target, parts.join('\n') + '\n', 'utf8');
console.log('written:', target);
console.log('lines:', parts.length);
console.log('textareas:', (parts.join('\n').match(/doc-autotextarea/g) || []).length);
