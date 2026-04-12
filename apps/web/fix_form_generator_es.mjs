import fs from 'fs';

const workflow = JSON.parse(fs.readFileSync('./n8n/workflow_generate_form_fields_fixed.json', 'utf8'));

const cleanJsCode = `const input = $input.first().json.body;
const language = input.locale === 'en' ? 'English' : input.locale === 'es' ? 'Spanish' : input.locale === 'ar' ? 'Arabic' : 'French';

const consultant = input.consultant_profile || {};
const consultantName = consultant.full_name || [consultant.first_name, consultant.last_name].filter(Boolean).join(' ') || 'Consultant';
const consultantRole = consultant.job_title || 'Expert consultant';
const consultantBio = consultant.bio || '';
const consultantSpecialties = consultant.specialties || '';
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

const systemContent = 'You are an elite lead generation form designer and UX expert specializing in professional consulting services. You create highly targeted qualification forms that help consultants identify, attract, and qualify their ideal prospects.';

const instructionsContent = 'All reasoning and instructions in English. Output language: ' + language + '.\\nAll user-visible text (titles, labels, placeholders, descriptions, option values) MUST be written in ' + language + '. Do NOT mix languages.\\n\\nAbsolute rules:\\n1. Generate EXCLUSIVELY for professional consultants. Generic forms are strictly FORBIDDEN.\\n2. The form must reflect the consultant\\'s expertise, positioning, and business vocabulary.\\n3. Generate the COMPLETE form structure: title, description, sections, questions, AND thank-you page.\\n4. Allowed field types: text, textarea, select, radio, checkbox, email, phone, url, number, date, file, section.\\n5. A \\"section\\" field visually groups related questions - it MUST have a sectionTitle and an empty label.\\n6. Fields of type select / radio / checkbox MUST include a non-empty \\"options\\" array.\\n7. Questions must qualify the prospect: need, context, budget potential, readiness - without being intrusive.\\n8. Do NOT add email or phone fields unless explicitly requested by the consultant.\\n9. The thank_you_title must be warm, personalized, and aligned with the consultant\\'s positioning.\\n10. The thank_you_description must describe the concrete next step the prospect can expect.\\n\\nFirst, briefly outline your strategy inside <thinking> tags. Then output the final JSON result.';

const outputFormatContent = 'Output ONLY a valid raw JSON object. No markdown (no \`\`\`json). No text before or after the JSON.\\n\\n{\\n  \\"form_title\\": \\"string - compelling, specific form title\\",\\n  \\"form_description\\": \\"string - engaging hook sentence presenting the form to the prospect\\",\\n  \\"questions\\": [\\n    { \\"type\\": \\"section\\", \\"sectionTitle\\": \\"Section name\\", \\"label\\": \\"\\", \\"required\\": false },\\n    { \\"type\\": \\"text|textarea|select|radio|checkbox|...\\", \\"label\\": \\"Prospect-facing label\\", \\"placeholder\\": \\"Helper text\\", \\"options\\": [\\"Option A\\", \\"Option B\\"], \\"required\\": true }\\n  ],\\n  \\"thank_you_title\\": \\"string - thank-you page title\\",\\n  \\"thank_you_description\\": \\"string - next-step description for the prospect\\"\\n}';

let contextContent = 'Consultant profile:\\n- Name: ' + consultantName + '\\n- Role: ' + consultantRole;
if (consultantBio) contextContent += '\\n- Bio: ' + consultantBio;
if (consultantSpecialties) contextContent += '\\n- Specialties: ' + consultantSpecialties;
if (consultantWebsite) contextContent += '\\n- Website: ' + consultantWebsite;
if (consultantSocial?.linkedin) contextContent += '\\n- LinkedIn: ' + consultantSocial.linkedin;
if (consultantSocial?.twitter) contextContent += '\\n- Twitter/X: ' + consultantSocial.twitter;
if (consultantSocial?.github) contextContent += '\\n- GitHub: ' + consultantSocial.github;

contextContent += '\\n\\nGeneration parameters:\\n- Tone: ' + toneHint + '\\n- Complexity: ' + complexityHint + '\\n- Target number of questions (sections excluded): ' + nbQuestions;
if (extraContext) contextContent += '\\n- Extra context from consultant: ' + extraContext;

contextContent += '\\n\\nConsultant request:\\n\\"' + (input.prompt || 'Generate a qualification form tailored to my consulting practice') + '\\"\\n\\nCurrent form title in builder: \\"' + (input.form_title || 'Untitled') + '\\"';

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

const preparePromptNode = workflow.nodes.find(n => n.id === 'prepare-prompt');
if (preparePromptNode) {
    preparePromptNode.parameters.jsCode = cleanJsCode;
    fs.writeFileSync('./n8n/workflow_generate_form_fields.json', JSON.stringify(workflow, null, 2), 'utf8');
    console.log('✓ Fixed and saved workflow');
    import('./n8n/workflow_generate_form_fields.json').then(() => {
        console.log('✓ JSON validation passed');
    });
}
