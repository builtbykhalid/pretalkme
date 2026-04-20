import { Injectable } from '@nestjs/common';
import { supabase } from '../../infrastructure/supabase/supabase.client';
import { NormalizedMessage } from '../../channels/types';

@Injectable()
export class MessageRouter {
  async route(msg: NormalizedMessage) {
    let tenant: any = null;

    if (msg.channel === 'whatsapp') {
      const phoneNumberId = (msg.raw as any)?.metadata?.phone_number_id;
      if (phoneNumberId) {
        const found = await supabase
          .from('tenants')
          .select('id')
          .eq('wa_phone_id', phoneNumberId)
          .single();
        tenant = found.data;
      }
    } else {
      const pageId =
        (msg.raw as any)?.entry?.[0]?.id ||
        (msg.raw as any)?.entry?.[0]?.changes?.[0]?.value?.page_id ||
        (msg.raw as any)?.entry?.[0]?.changes?.[0]?.value?.instagram_business_account?.id ||
        (msg.raw as any)?.page_id ||
        (msg.raw as any)?.instagram_business_account_id;

      if (pageId) {
        const { data: integrations } = await supabase
          .from('integrations')
          .select('tenant_id, platform, provider, settings');

        const integration = (integrations || []).find((row: any) => {
          const settings = row.settings || {};
          return (
            row.platform === msg.channel ||
            row.provider === msg.channel ||
            settings.page_id === pageId ||
            settings.instagram_id === pageId ||
            settings.business_account_id === pageId
          );
        });

        if (integration?.tenant_id) {
          tenant = { id: integration.tenant_id };
        }
      }
    }

    if (!tenant) {
      return;
    }

    const contactField = msg.channel === 'facebook' ? 'facebook_id' : msg.channel === 'instagram' ? 'instagram_id' : 'wa_id';

    const { data: contact } = await supabase
      .from('contacts')
      .upsert(
        {
          tenant_id: tenant.id,
          [contactField]: msg.from,
          wa_id: msg.channel === 'whatsapp' ? msg.from : `channel:${msg.channel}:${msg.from}`,
          phone: msg.channel === 'whatsapp' ? msg.from : `channel:${msg.channel}:${msg.from}`,
          name: msg.fromName || msg.from,
        },
        { onConflict: 'tenant_id,wa_id' },
      )
      .select()
      .single();

    const { data: conversation } = await supabase
      .from('conversations')
      .upsert(
        {
          tenant_id: tenant.id,
          contact_id: contact?.id,
          status: 'open',
          channel: msg.channel,
        },
        { onConflict: 'tenant_id,contact_id' },
      )
      .select()
      .single();

    await supabase.from('messages').insert({
      tenant_id: tenant.id,
      conversation_id: conversation?.id,
      direction: 'inbound',
      type: msg.type === 'sticker' ? 'image' : msg.type,
      content: msg.text || null,
      media_url: msg.mediaUrl || null,
      channel: msg.channel,
      wamid: msg.externalId,
    });
  }
}
