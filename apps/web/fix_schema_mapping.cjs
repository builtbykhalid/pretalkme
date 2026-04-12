const fs = require('fs');

const workflow = JSON.parse(fs.readFileSync('./n8n/workflow_generate_forms.json', 'utf8'));

// Fix Prepare Data for DB node - match actual Supabase schema
const dbNode = workflow.nodes.find(n => n.id === 'prepare-db');
if (dbNode) {
  dbNode.parameters.jsCode = `const payload = $('Webhook Trigger Form AI').first().json.body;
const parsed = $input.first().json;
const consultant = payload.consultant_profile || {};

// Generate slug from form_title (lowercase, replace spaces with dashes)
const generateSlug = (title) => {
  return (title || 'form').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
};

const slug = generateSlug(parsed.form_title) + '_' + Date.now();

return [{
  json: {
    user_id: payload.user_id,
    title: parsed.form_title || 'Untitled Form',
    slug: slug,
    status: 'published',
    form_structure: {
      form_title: parsed.form_title || 'Untitled Form',
      form_description: parsed.form_description || '',
      questions: parsed.questions || [],
      sections: parsed.sections || [],
      thank_you_title: parsed.thank_you_title || 'Merci!',
      thank_you_description: parsed.thank_you_description || ''
    },
    ai_config: payload.ai_config || {},
    consultant_email: consultant.email || payload.consultant_email || 'contact@pretalk.me',
    consultant_name: consultant.full_name || 'Consultant',
    consultant_role: consultant.job_title || 'Consultant Expert',
    domain: consultant.website || null,
    views_count: 0,
    leads_count: 0
  }
}];`;
  console.log('✅ Prepare Data for DB updated');
}

// Fix Supabase save node - use correct column names
const saveNode = workflow.nodes.find(n => n.id === 'save-db');
if (saveNode) {
  saveNode.parameters.fieldsUi.fieldValues = [
    { "fieldId": "user_id", "fieldValue": "={{ $json.user_id }}" },
    { "fieldId": "title", "fieldValue": "={{ $json.title }}" },
    { "fieldId": "slug", "fieldValue": "={{ $json.slug }}" },
    { "fieldId": "status", "fieldValue": "={{ $json.status }}" },
    { "fieldId": "form_structure", "fieldValue": "={{ JSON.stringify($json.form_structure) }}" },
    { "fieldId": "ai_config", "fieldValue": "={{ JSON.stringify($json.ai_config) }}" },
    { "fieldId": "consultant_email", "fieldValue": "={{ $json.consultant_email }}" },
    { "fieldId": "consultant_name", "fieldValue": "={{ $json.consultant_name }}" },
    { "fieldId": "consultant_role", "fieldValue": "={{ $json.consultant_role }}" },
    { "fieldId": "domain", "fieldValue": "={{ $json.domain }}" },
    { "fieldId": "views_count", "fieldValue": "={{ $json.views_count }}" },
    { "fieldId": "leads_count", "fieldValue": "={{ $json.leads_count }}" }
  ];
  console.log('✅ Supabase save node updated with correct columns');
}

// Also update response node to include correct form data
const respondNode = workflow.nodes.find(n => n.id === 'respond-success');
if (respondNode) {
  respondNode.parameters.responseBody = `{{ { success: true, form_id: $('Save Form to Supabase').first().json.id, form_slug: $json.slug, form_title: $json.title, message: 'Formulaire créé avec succès' } }}`;
  console.log('✅ Response node updated');
}

fs.writeFileSync('./n8n/workflow_generate_forms.json', JSON.stringify(workflow, null, 2));
console.log('\n✅ WORKFLOW FIXED FOR ACTUAL SUPABASE SCHEMA');
console.log('');
console.log('Fields now saved to Supabase forms table:');
console.log('  • user_id (consultant UUID)');
console.log('  • title (form_title)');
console.log('  • slug (generated)');
console.log('  • status (published)');
console.log('  • form_structure (JSON with all form data)');
console.log('  • ai_config (JSON)');
console.log('  • consultant_email');
console.log('  • consultant_name');
console.log('  • consultant_role');
console.log('  • domain (website)');
console.log('  • views_count');
console.log('  • leads_count');
