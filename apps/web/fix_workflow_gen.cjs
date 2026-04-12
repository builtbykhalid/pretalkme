const fs = require('fs');
const path = require('path');

try {
  const filePath = path.join(__dirname, 'n8n', 'workflow_generate_form_fields_fixed.json');
  const workflow = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  const prepareNode = workflow.nodes.find(n => n.id === 'prepare-prompt');
  if (!prepareNode) {
    console.error('Node prepare-prompt not found');
    process.exit(1);
  }

  // Clean jsCode - now with proper syntax
  const cleanCode = `const input = $input.first().json.body;
const language = input.locale === 'en' ? 'English' : input.locale === 'es' ? 'Spanish' : input.locale === 'ar' ? 'Arabic' : 'French';

const consultant = input.consultant_profile || {};
const consultantName = consultant.full_name || [consultant.first_name, consultant.last_name].filter(Boolean).join(' ') || 'Consultant';
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
const extraContext = aiConfig.questionContext || '';
const customSystemPrompt = !serviceIsActive ? (aiConfig.systemPrompt || '') : '';

let personaContent;
if (serviceIsActive && serviceBasePrompt) {
    personaContent = serviceBasePrompt + (serviceDescription ? '\\n(Service description: ' + serviceDescription + ')' : '');
} else if (serviceIsActive) {
    personaContent = 'Active service: ' + serviceName + (serviceDescription ? '. ' + serviceDescription : '') + '\\n(No base_prompt configured - adopt the role described above.)';
} else if (customSystemPrompt) {
    personaContent = customSystemPrompt;
} else {
    personaContent = 'You are acting on behalf of ' + consultantName + ', a ' + consultantRole + '. Design the form to perfectly reflect their expertise and professional positioning.';
}

const systemContent = 'You are an elite lead generation form designer and UX expert specializing in professional consulting services.';

const instructionsContent = 'All reasoning and instructions in English. Output language: ' + language + '.\\nAll user-visible text MUST be in ' + language + '.\\n\\nRules:\\n1. Generate EXCLUSIVELY for professional consultants.\\n2. Reflect the consultant\\'s expertise and positioning.\\n3. Generate complete form structure: title, description, questions, thank-you page.\\n4. Allowed types: text, textarea, select, radio, checkbox, email, phone, url, number, date, file, section.\\n5. Section fields MUST have sectionTitle and empty label.\\n6. Select/radio/checkbox MUST have options array.\\n7. Questions qualify prospects without being intrusive.\\n8. Do NOT add email/phone unless requested.\\n9. Thank-you title must be warm and personalized.\\n10. Thank-you description describes next steps.';

const outputFormatContent = 'Output ONLY valid JSON. No markdown.';

let contextContent = 'Consultant profile:\\n- Name: ' + consultantName + '\\n- Role: ' + consultantRole;
if (consultantBio) contextContent += '\\n- Bio: ' + consultantBio;
if (consultantWebsite) contextContent += '\\n- Website: ' + consultantWebsite;
if (consultantSocial?.linkedin) contextContent += '\\n- LinkedIn: ' + consultantSocial.linkedin;
if (consultantSocial?.twitter) contextContent += '\\n- Twitter/X: ' + consultantSocial.twitter;
if (consultantSocial?.github) contextContent += '\\n- GitHub: ' + consultantSocial.github;

contextContent += '\\n\\nGeneration parameters:\\n- Tone: ' + toneHint + '\\n- Complexity: ' + complexityHint + '\\n- Questions: ' + nbQuestions;
if (extraContext) contextContent += '\\n- Extra context: ' + extraContext;

contextContent += '\\n\\nConsultant request:\\n"' + (input.prompt || 'Generate a qualification form') + '"\\n\\nForm title: "' + (input.form_title || 'Untitled') + '"';

const generatedPrompt = '<system>\\n' + systemContent + '\\n</system>\\n\\n<persona>\\n' + personaContent + '\\n</persona>\\n\\n<instructions>\\n' + instructionsContent + '\\n</instructions>\\n\\n<output_format>\\n' + outputFormatContent + '\\n</output_format>\\n\\n<context>\\n' + contextContent + '\\n</context>';

return [{
    json: {
        ...$input.first().json,
        generated_prompt: generatedPrompt,
        _debug: {
            serviceIsActive,
            serviceName,
            hasServiceBasePrompt: !!serviceBasePrompt,
            hasCustomSystemPrompt: !!customSystemPrompt,
            personaSource: serviceIsActive && serviceBasePrompt ? 'service_base_prompt' : serviceIsActive ? 'service_description_fallback' : customSystemPrompt ? 'custom_system_prompt' : 'default',
            language
        }
    }
}];`;

  prepareNode.parameters.jsCode = cleanCode;
  
  // Write back to the original file
  fs.writeFileSync(
    path.join(__dirname, 'n8n', 'workflow_generate_form_fields.json'),
    JSON.stringify(workflow, null, 2),
    'utf8'
  );

  console.log('✓ Fixed workflow_generate_form_fields.json');
  console.log('✓ Updated Prepare Prompt node with:');
  console.log('  - Service support (active_service)');
  console.log('  - Social networks (linkedin, twitter, github)');
  console.log('  - Website field');
  
  // Verify it's valid JSON
  require(path.join(__dirname, 'n8n', 'workflow_generate_form_fields.json'));
  console.log('✓ JSON validation passed');
  
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
