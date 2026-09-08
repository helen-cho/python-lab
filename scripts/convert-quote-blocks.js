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

content = content.replace(/<div class="doc-quote-block">\s*<p>([\s\S]*?)<\/p>\s*<\/div>/g, (_, inner) => {
  const text = decodeHtml(inner.replace(/<[^>]+>/g, '').trim());
  return (
    '<textarea class="doc-autotextarea autotextarea" rows="1" aria-label="예제 입력 (수정 가능)" spellcheck="false">' +
    escapeHtml(text) +
    '</textarea>'
  );
});

fs.writeFileSync(target, content);
console.log('remaining quote blocks:', (content.match(/doc-quote-block/g) || []).length);
console.log('example textareas:', (content.match(/aria-label="예제 입력 \(수정 가능\)"/g) || []).length);
