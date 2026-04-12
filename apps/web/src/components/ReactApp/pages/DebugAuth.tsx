import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function DebugAuth() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [local, setLocal] = useState<Record<string,string|null>>({});
  const [sessionStorageDump, setSessionStorageDump] = useState<Record<string,string|null>>({});

  useEffect(() => {
    async function load() {
      try {
        const s = await supabase.auth.getSession();
        setSession(s?.data?.session || null);
        const u = await supabase.auth.getUser();
        setUser(u?.data?.user || null);
      } catch (e) {
        setSession({ error: String(e) });
      }

      const keys = ['pretalk-auth'];
      const localDump: Record<string,string|null> = {};
      keys.forEach(k => localDump[k] = localStorage.getItem(k));
      setLocal(localDump);

      const sKeys = ['admin_session'];
      const sDump: Record<string,string|null> = {};
      sKeys.forEach(k => sDump[k] = sessionStorage.getItem(k));
      setSessionStorageDump(sDump);
    }

    load();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Auth</h1>

      <section className="mb-4">
        <h2 className="font-semibold">Supabase session</h2>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(session, null, 2)}</pre>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">Supabase user</h2>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(user, null, 2)}</pre>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">localStorage</h2>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(local, null, 2)}</pre>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">sessionStorage</h2>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(sessionStorageDump, null, 2)}</pre>
      </section>

      <div className="mt-6">
        <button
          className="px-4 py-2 bg-red-600 text-white rounded"
          onClick={() => { localStorage.removeItem('pretalk-auth'); sessionStorage.removeItem('admin_session'); alert('Cleared pretalk-auth and admin_session'); }}
        >Clear auth cache</button>
      </div>
    </div>
  );
}
