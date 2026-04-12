const fs = require('fs');

const workflow = JSON.parse(fs.readFileSync('./n8n/workflow_generate_forms.json', 'utf8'));

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
    consultant_email: payload.user_email || 'contact@pretalk.me',
    consultant_name: consultant.full_name || payload.user_name || 'Consultant',
    consultant_role: consultant.job_title || 'Consultant Expert',
    domain: consultant.website || null,
    views_count: 0,
    leads_count: 0
  }
}];`;
  
  console.log('✅ Updated Prepare Data for DB node');
}

fs.writeFileSync('./n8n/workflow_generate_forms.json', JSON.stringify(workflow, null, 2));
console.log('✅ Workflow updated!');
console.log('');
console.log('✅ Complete mapping:');
console.log('  • user_id ← webhook.user_id');
console.log('  • title ← form_title');
console.log('  • slug ← generated from form_title');
console.log('  • form_structure ← JSON with form metadata');
console.log('  • consultant_email ← user_email or default');
console.log('  • consultant_name ← consultant.full_name');
console.log('  • consultant_role ← consultant.job_title');
