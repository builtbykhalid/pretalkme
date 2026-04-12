import { supabase, directApi } from './supabase';

export async function getPublicFormByUsernameAndSlug(username: string, slug: string) {
  try {
    // Prefer RPC if available
    if (supabase.rpc) {
      const { data, error } = await supabase.rpc('get_public_form_by_username_and_slug', { p_username: username, p_slug: slug });
      if (!error && data && (data as any).length > 0) return (data as any)[0];
    }
  } catch (e) {
    console.warn('RPC get_public_form_by_username_and_slug failed, falling back to REST', e);
  }

  // Fallback to public view via REST
  try {
    const normalizedSlug = slug.toLowerCase().trim();
    const slugOrFilter = `(slug.ilike.${normalizedSlug},clean_slug.ilike.${normalizedSlug})`;
    const data = await directApi.select('public_forms_view', '*', {
      'username': `ilike.${username}`,
      'or': slugOrFilter,
      'order': 'created_at.desc',
    });
    if (Array.isArray(data) && data.length > 0) return data[0];
    return null;
  } catch (err) {
    console.error('publicApi.getPublicFormByUsernameAndSlug error:', err);
    return null;
  }
}

export async function getPublicProfileById(userId: string) {
  try {
    const { data, error } = await supabase.rpc('get_public_profile_by_id', { user_id: userId });
    if (!error && data && (data as any).length > 0) return (data as any)[0];
  } catch (e) {
    console.warn('RPC get_public_profile_by_id failed, falling back to REST', e);
  }

  try {
    const data = await directApi.select('profiles', '*', { 'id': `eq.${userId}` });
    if (Array.isArray(data) && data.length > 0) return data[0];
    return null;
  } catch (err) {
    console.error('publicApi.getPublicProfileById error:', err);
    return null;
  }
}

export default { getPublicFormByUsernameAndSlug, getPublicProfileById };
