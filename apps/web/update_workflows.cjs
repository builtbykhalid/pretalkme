const fs = require('fs');

try {
  const file1 = 'n8n/new/Pretalk_-_Generateur_Forms_v2_Fixed.json';
  const data = JSON.parse(fs.readFileSync(file1, 'utf8'));
  const preparePrompt = data.nodes.find(n => n.name === 'Prepare Prompt');

  // We are going to completely replace the outputFormatLines
  preparePrompt.parameters.jsCode = preparePrompt.parameters.jsCode.replace(
    /const outputFormatLines = \[[^\]]+\];/,
    `const outputFormatLines = [
  '{',
  '  "form_title": "string (max 6 words)",',
  '  "form_description": "string (max 30 words)",',
  '  "sections": [',
  '    {',
  '      "id": "section_1",',
  '      "title": "Discovery",',
  '      "description": "Short description"',
  '    }',
  '  ],',
  '  "questions": [',
  '',
  '    // ── Closed question examples ──',
  '    {',
  '      "type": "radio",',
  '      "label": "Question label (max 8 words)",',
  '      "options": ["Option A", "Option B", "Not sure yet"],',
  '      "required": true,',
  '      "section_id": "section_1"',
  '    },',
  '    {',
  '      "type": "checkbox",',
  '      "label": "Which of these apply to you?",',
  '      "options": ["Goal 1", "Goal 2", "Goal 3", "Other"],',
  '      "required": false,',
  '      "section_id": "section_1"',
  '    },',
  '    {',
  '      "type": "select",',
  '      "label": "What industry are you in?",',
  '      "placeholder": "Select your industry",',
  '      "options": ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"],',
  '      "required": true,',
  '      "section_id": "section_1"',
  '    },',
  '',
  '    // ── Single textarea (Section 2 only, max 1 per form) ──',
  '    {',
  '      "type": "textarea",',
  '      "label": "Describe your main challenge briefly.",',
  '      "placeholder": "A few words is enough",',
  '      "required": false,',
  '      "section_id": "section_2"',
  '    },',
  '',
  '    // ── Personal Info section examples ──',
  '    {',
  '      "type": "text",',
  '      "label": "Your full name",',
  '      "placeholder": "e.g. Jane Smith",',
  '      "required": true,',
  '      "section_id": "section_3"',
  '    },',
  '    {',
  '      "type": "email",',
  '      "label": "Your professional email address",',
  '      "placeholder": "you@company.com",',
  '      "required": true,',
  '      "section_id": "section_3"',
  '    },',
  '    {',
  '      "type": "phone",',
  '      "label": "Your phone number",',
  '      "placeholder": "+1 (555) 000-0000",',
  '      "required": true,',
  '      "section_id": "section_3"',
  '    }',
  '',
  '  ],',
  '  "thank_you_title": "string (max 4 words)",',
  '  "thank_you_description": "string (max 30 words)",',
  '  "button_text": "string (max 3 words)"',
  '}'
];`
  );

  const parseJson = data.nodes.find(n => n.name === 'Parse & Validate JSON');
  parseJson.parameters.jsCode = parseJson.parameters.jsCode.replace(
    `thank_you_description: parsed.thank_you_description || '',`,
    `thank_you_description: parsed.thank_you_description || '',\n    button_text: parsed.button_text || 'Envoyer',`
  );

  const prepareData = data.nodes.find(n => n.name === 'Prepare Data for DB');
  prepareData.parameters.jsCode = prepareData.parameters.jsCode.replace(
    `thank_you_description: parsed.thank_you_description || ''`,
    `thank_you_description: parsed.thank_you_description || '',\n      button_text: parsed.button_text || 'Envoyer'`
  );

  fs.writeFileSync(file1, JSON.stringify(data, null, 2));


  const file2 = 'n8n/new/Pretalk_-_Augmented_Onboarding_v6_1_Fixed (2).json';
  const data2 = JSON.parse(fs.readFileSync(file2, 'utf8'));

  const preparePayloads = data2.nodes.find(n => n.name === '4. Prepare Form Payloads');
  preparePayloads.parameters.jsCode = preparePayloads.parameters.jsCode.replace('return formPrompts.slice(0, 2).map', 'return formPrompts.slice(0, 3).map');

  const masterPrompt = data2.nodes.find(n => n.name === 'Prepare Master Prompt');
  masterPrompt.parameters.jsCode = masterPrompt.parameters.jsCode
    .replace('Generate EXACTLY 2 form generation prompts', 'Generate EXACTLY 3 form generation prompts')
    .replace('SECTION 3 — FORM PROMPTS (exactly 2)', 'SECTION 3 — FORM PROMPTS (exactly 3)')
    .replace('Generating 1 or 3 form_prompts is a CRITICAL schema violation', 'Generating 1 or 2 form_prompts is a CRITICAL schema violation')
    .replace('Object at index 1 MUST be the Strategic Audit prompt.', 'Object at index 1 MUST be the Strategic Audit prompt.\\nObject at index 2 MUST be the Client Need Deep Dive prompt.');

  masterPrompt.parameters.jsCode = masterPrompt.parameters.jsCode.replace(
    `'    {',
  '      "title": "Strategic Audit title in ' + language + '",',
  '      "prompt": "Deep audit form prompt — maturity + weaknesses + growth opportunities, written in ' + language + '"',
  '    }'`,
    `'    {',
  '      "title": "Strategic Audit title in ' + language + '",',
  '      "prompt": "Deep audit form prompt — maturity + weaknesses + growth opportunities, written in ' + language + '"',
  '    },',
  '    {',
  '      "title": "Client Need Deep Dive title in ' + language + '",',
  '      "prompt": "Exploration deep dive on a specific pain point or project need, written in ' + language + '"',
  '    }'`
  );

  // Fix parallel branch splitting issue in Input Splitter
  const inputSplitter = data2.nodes.find(n => n.name === 'Input Splitter');
  inputSplitter.parameters.jsCode = `const body = $input.first().json.body || $input.first().json;
if (body.url) return [{ json: { ...body, _route: 'url' } }];
if (body.pdf_url) return [{ json: { ...body, _route: 'document' } }];
if (body.audio_base64) return [{ json: { ...body, _route: 'audio' } }];
return [{ json: { ...body, _route: 'text' } }];`;

  fs.writeFileSync(file2, JSON.stringify(data2, null, 2));
  console.log('Success');
} catch(e) {
  console.error(e);
}
