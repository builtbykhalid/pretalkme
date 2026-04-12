const fs = require('fs');

const workflow = JSON.parse(fs.readFileSync('./n8n/workflow_generate_forms.json', 'utf8'));

// Fix Prepare Prompt node
const promptNode = workflow.nodes.find(n => n.id === 'prepare-prompt');

if (promptNode) {
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

const instructionsContent = 'Output language: ' + language + '.\\nGenerate complete JSON with MANDATORY fields: form_title, form_description, questions[], thank_you_title, thank_you_description, sections[].\\nALWAYS generate form_title and form_description - they must NEVER be empty.\\nform_title: compelling 1-2 sentence title\\nform_description: 2-3 sentence hook explaining value\\nquestions: array of objects\\nQuestion types: text, textarea, select, radio, checkbox, email, phone\\nFor section type: include sectionTitle and empty label.\\nthank_you_title: warm congratulation message\\nthank_you_description: next steps guidance\\nOutput ONLY valid JSON. No markdown. No code blocks.';

let contextContent = 'Consultant Profile:\\n  Name: ' + consultantName + '\\n  Role: ' + consultantRole;
if (consultantBio) contextContent += '\\n  Bio: ' + consultantBio;
if (consultantWebsite) contextContent += '\\n  Website: ' + consultantWebsite;
if (consultantSocial?.linkedin) contextContent += '\\n  LinkedIn: ' + consultantSocial.linkedin;

contextContent += '\\n\\n=== FORM REQUEST ===';
contextContent += '\\nContext: ' + (input.prompt || 'Generate a qualification form');

if (input.form_title && input.form_title.trim()) {
    contextContent += '\\nPreferred Title (use as reference): ' + input.form_title;
}

if (input.form_description && input.form_description.trim()) {
    contextContent += '\\nPreferred Description (use as reference): ' + input.form_description;
}

if (input.sections && Array.isArray(input.sections) && input.sections.length > 0) {
    contextContent += '\\n\\nSuggested Sections:';
    input.sections.forEach(section => {
        contextContent += '\\n  • ' + section.name;
        if (section.description) contextContent += ': ' + section.description;
    });
}

const generatedPrompt = '<system>' + systemContent + '</system>\\n<persona>' + personaContent + '</persona>\\n<instructions>' + instructionsContent + '</instructions>\\n<context>' + contextContent + '</context>';

return [{ json: { ...input, generated_prompt: generatedPrompt } }];`;

  console.log('✅ Prepare Prompt updated');
}

fs.writeFileSync('./n8n/workflow_generate_forms.json', JSON.stringify(workflow, null, 2));
console.log('✅ Workflow fixed - form_title and form_description will ALWAYS be generated');
