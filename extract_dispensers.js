const fs = require('fs');
const path = 'C:\\Users\\silly\\.claude\\projects\\C--Users-silly\\8de9651c-34d4-489e-816a-06ab751d0d7f.jsonl';
const lines = fs.readFileSync(path, 'utf8').split('\n');
let found = false;
for (let i = 0; i < lines.length; i++) {
  if (!lines[i]) continue;
  if (lines[i].includes('Water Dispensers') && lines[i].includes('Buy or Rent')) {
    try {
      const data = JSON.parse(lines[i]);
      const content = (data.message && data.message.content) || [];
      for (const item of content) {
        if (item && item.content && typeof item.content === 'string' && item.content.includes('Water Dispensers') && item.content.length > 10000) {
          console.log('Line ' + (i+1) + ' len=' + item.content.length);
          // Strip line number prefixes (format: "1\t...\n2\t...")
          let html = item.content.replace(/^\d+\t/gm, '');
          fs.writeFileSync('C:\\Users\\silly\\Desktop\\waterboy-delivery\\dispensers.html', html, 'utf8');
          console.log('Written dispensers.html');
          found = true;
          break;
        }
      }
    } catch(e) { console.log('Parse error line ' + (i+1) + ': ' + e.message); }
    if (found) break;
  }
}
if (!found) console.log('Not found in 8de9651c');

