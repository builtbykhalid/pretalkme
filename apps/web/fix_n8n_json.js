import fs from 'fs';

const path = 'c:\\Users\\HP\\Desktop\\buildbykhalid\\pretalk.me\\pretalk-hub\\pretalk-hub\\n8n\\workflow_generate_audit_pdf.json';
let content = fs.readFileSync(path, 'utf8');

// The file has literal newlines inside JSON string for the n8n jsCode block.
// This is exactly what broke the parse. 
content = content.replace("'<div class=\\\"page cover-page\\\">\\n  ' + coverImgUrl);", "'<div class=\\\"page cover-page\\\">\\\\n  ' + coverImgUrl);");
content = content.replace("'<div class=\\\"page closing-page\\\">\\n  ' + closingImgUrl);", "'<div class=\\\"page closing-page\\\">\\\\n  ' + closingImgUrl);");

fs.writeFileSync(path, content, 'utf8');

console.log("Fixed n8n json!");
