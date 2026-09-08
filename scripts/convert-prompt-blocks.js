const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '../views/partials/learning-examples-content.ejs');
let content = fs.readFileSync(target, 'utf8');

function decodeHtml(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ');
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

content = content.replace(/<div class="doc-prompt-block">([\s\S]*?)<\/div>/g, (_, inner) => {
  const lines = [];
  const pRegex = /<p>([\s\S]*?)<\/p>/g;
  let match;
  while ((match = pRegex.exec(inner)) !== null) {
    const line = decodeHtml(match[1].replace(/<[^>]+>/g, '').trim());
    if (line) lines.push(line);
  }
  const text = lines.join('\n');
  return (
    '<textarea class="doc-autotextarea autotextarea" rows="1" aria-label="프롬프트 템플릿 (수정 가능)" spellcheck="false">' +
    escapeHtml(text) +
    '</textarea>'
  );
});

fs.writeFileSync(target, content);
console.log('converted:', (content.match(/doc-autotextarea/g) || []).length);
