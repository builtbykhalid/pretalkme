import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const sbUrl = 'https://htvtmrejzzwekztekzev.supabase.co';
const sbKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0dnRtcmVqenp3ZWt6dGVremV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDEyMzA0NSwiZXhwIjoyMDg1Njk5MDQ1fQ.tULXG3YNnsS_LeHkanNrZW7eOYzKEV99A73wuTMqF6s';

const supabase = createClient(sbUrl, sbKey);

async function run() {
    const { data, error } = await supabase.from('pdf_templates').select('id, name');
    if (error) {
        console.error('Error fetching templates:', error);
        return;
    }

    console.log('Existing templates:');
    console.log(data);

    const pretalkHtml = fs.readFileSync('C:\\Users\\HP\\.gemini\\antigravity\\brain\\ca06f00f-5959-4a6e-a9a5-3385e6dd66ce\\pdf_template_pretalk.html', 'utf8');
    const industryHtml = fs.readFileSync('C:\\Users\\HP\\.gemini\\antigravity\\brain\\ca06f00f-5959-4a6e-a9a5-3385e6dd66ce\\pdf_template_industry.html', 'utf8');

    let pretalkId = null;
    let industryId = null;

    for (const t of data) {
        if (t.name.includes('Pretalk') || t.name.toLowerCase().includes('default')) {
            pretalkId = t.id;
        }
        if (t.name.includes('Industry') || t.name.includes('Industrie')) {
            industryId = t.id;
        }
    }

    if (pretalkId) {
        console.log('Updating Pretack template ID:', pretalkId);
        await supabase.from('pdf_templates').update({ html_css_content: pretalkHtml }).eq('id', pretalkId);
    } else {
        console.log('Inserting Modern Pretalk template');
        await supabase.from('pdf_templates').insert({ name: 'Modern Pretalk Template', html_css_content: pretalkHtml, is_active: true });
    }

    if (industryId) {
        console.log('Updating Industry template ID:', industryId);
        await supabase.from('pdf_templates').update({ html_css_content: industryHtml }).eq('id', industryId);
    } else {
        console.log('Inserting Industry Brochure Template');
        await supabase.from('pdf_templates').insert({ name: 'Industry Brochure Template', html_css_content: industryHtml, is_active: true });
    }

    console.log('Templates updated successfully!');
}

run();
