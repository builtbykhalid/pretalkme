const fs = require('fs');

const workflow = JSON.parse(fs.readFileSync('./n8n/workflow_generate_forms.json', 'utf8'));

// Find Prepare Prompt node
const promptNode = workflow.nodes.find(n => n.id === 'prepare-prompt');

if (promptNode) {
  // Update jsCode with form_description and sections support
  promptNode.parameters.jsCode = `const input = $input.first().json.body;
const language = input.locale === 'en' ? 'English' : input.locale === 'es' ? 'Spanish' : input.locale === 'ar' ? 'Arabic' : 'French';

const consultant = input.consultant_profile || {};
const consultantName = consultant.full_name || 'Consultant';
const consultantRole = consultant.job_title || 'Expert consultant';
const consultantBio = consultant.bio || '';
const consultantWebsite = consultant.website || '';
const consultantSocial = consultant.social_networks || {};

const service = input.active_service || null;
const serviceIsActive = !!(service && service.name);
const serviceName = serviceIsActive ? (service.name || '') : '';
const serviceDescription = serviceIsActive ? (service.description || '') : '';
const serviceBasePrompt = serviceIsActive ? (service.base_prompt || '') : '';

const aiConfig = input.ai_config || {};
const toneHint = aiConfig.tone || 'professional';
const complexityHint = aiConfig.questionComplexity || 'intermediate';
const nbQuestions = aiConfig.numberOfQuestions || 5;

let personaContent;
if (serviceIsActive && serviceBasePrompt) {
    personaContent = serviceBasePrompt + (serviceDescription ? '\\n(Service: ' + serviceDescription + ')' : '');
} else {
    personaContent = 'You are acting on behalf of ' + consultantName + ', a ' + consultantRole + '.';
}

const systemContent = 'You are an elite form designer specializing in professional consulting services.';

const instructionsContent = 'Output language: ' + language + '.\\nGenerate JSON with: form_title, form_description, questions[], sections[], thank_you_title, thank_you_description.\\nQuestion types: text, textarea, select, radio, checkbox, email, phone, section.\\nFor SECTION questions: include sectionTitle and empty label.\\nRESPECT provided form_title and form_description - do NOT generate new ones.\\nIf sections are provided, organize questions within those sections.\\nOutput ONLY valid JSON. No markdown.';

let contextContent = 'Consultant: ' + consultantName + ' (' + consultantRole + ')';
if (consultantBio) contextContent += '\\nBio: ' + consultantBio;
if (consultantWebsite) contextContent += '\\nWebsite: ' + consultantWebsite;
if (consultantSocial?.linkedin) contextContent += '\\nLinkedIn: ' + consultantSocial.linkedin;

contextContent += '\\n\\n=== FORM SPECIFICATIONS ===';
contextContent += '\\nForm Title: ' + (input.form_title || 'Untitled');
if (input.form_description) {
    contextContent += '\\nForm Description: ' + input.form_description;
}

if (input.sections && Array.isArray(input.sections) && input.sections.length > 0) {
    contextContent += '\\n\\nRequired Sections:';
    input.sections.forEach(section => {
        contextContent += '\\n  - Section: ' + section.name;
        if (section.description) contextContent += ' (' + section.description + ')';
    });
}

contextContent += '\\n\\nUser Request: ' + (input.prompt || 'Generate qualification form');

const generatedPrompt = '<system>' + systemContent + '</system>\\n<persona>' + personaContent + '</persona>\\n<instructions>' + instructionsContent + '</instructions>\\n<context>' + contextContent + '</context>';

return [{ json: { ...input, generated_prompt: generatedPrompt } }];`;

  console.log('✅ Prepare Prompt node updated with form_description + sections support');
}

// Also ensure Parse & Validate JSON handles sections
const parseNode = workflow.nodes.find(n => n.id === 'parse-json');
if (parseNode) {
  parseNode.parameters.jsCode = `let text = $input.first().json.text || '';
text = text.replace(/<thinking>[\\s\\S]*?<\\/thinking>/gi, '');
text = text.replace(/^\`\`\`json\\n?/, '').replace(/\\n?\`\`\`$/, '');
text = text.replace(/^\`\`\`\\n?/, '').replace(/\\n?\`\`\`$/, '');
text = text.trim();

let parsed = {};
try {
  parsed = JSON.parse(text);
} catch (e) {
  return [{ json: { 
    error: 'JSON_PARSE_ERROR',
    message: 'Failed to parse Gemini output',
    form_title: 'Error Form',
    questions: []
  }}];
}

return [{
  json: {
    form_title: parsed.form_title || 'Untitled Form',
    form_description: parsed.form_description || '',
    questions: Array.isArray(parsed.questions) ? parsed.questions : [],
    sections: Array.isArray(parsed.sections) ? parsed.sections : [],
    thank_you_title: parsed.thank_you_title || 'Merci!',
    thank_you_description: parsed.thank_you_description || '',
    generated: true
  }
}];`;

  console.log('✅ Parse & Validate JSON updated to handle sections');
}

// Update Prepare Data for DB to include sections
const dbNode = workflow.nodes.find(n => n.id === 'prepare-db');
if (dbNode) {
  dbNode.parameters.jsCode = `const payload = $('Webhook Trigger Form AI').first().json.body;
const parsed = $input.first().json;

const formId = 'form_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
const timestamp = new Date().toISOString();

return [{
  json: {
    id: formId,
    consultant_id: payload.user_id,
    user_id: payload.user_id,
    name: parsed.form_title || 'Untitled Form',
    description: parsed.form_description || '',
    questions: parsed.questions || [],
    sections: parsed.sections || [],
    thank_you_title: parsed.thank_you_title || 'Merci!',
    thank_you_description: parsed.thank_you_description || '',
    form_type: (payload.form_title || 'custom').toLowerCase().replace(/\\s+/g, '_'),
    is_active: true,
    created_at: timestamp,
    updated_at: timestamp
  }
}];`;

  console.log('✅ Prepare Data for DB updated to include sections');
}

// Update Supabase save node to include sections
const saveNode = workflow.nodes.find(n => n.id === 'save-db');
if (saveNode) {
  // Find sections field, add if not exists
  const fieldsValues = saveNode.parameters.fieldsUi.fieldValues;
  
  // Check if sections already in list
  if (!fieldsValues.find(f => f.fieldId === 'sections')) {
    fieldsValues.push({
      fieldId: "sections",
      fieldValue: "={{ JSON.stringify($json.sections) }}"
    });
    console.log('✅ Added sections field to Supabase save node');
  }
}

fs.writeFileSync('./n8n/workflow_generate_forms.json', JSON.stringify(workflow, null, 2));
console.log('\n✅ Complete workflow updated:');
console.log('  ✓ Prepare Prompt: now includes form_description + sections in context');
console.log('  ✓ Parse & Validate: now handles sections[] from Gemini');
console.log('  ✓ Prepare Data for DB: passes sections to Supabase');
console.log('  ✓ Save to Supabase: sections field added');
