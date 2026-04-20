import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { QrCode, Wifi, WifiOff, RefreshCcw, Link2Off } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const WA_STATUS_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  disconnected: { color: 'bg-gray-100 text-gray-700', label: 'Deconnecte', icon: '⚪' },
  scanning: { color: 'bg-yellow-100 text-yellow-700', label: 'En attente scan', icon: '🟡' },
  connected: { color: 'bg-green-100 text-green-700', label: 'Connecte', icon: '🟢' },
  expired: { color: 'bg-orange-100 text-orange-700', label: 'Session expiree', icon: '🟠' },
  error: { color: 'bg-red-100 text-red-700', label: 'Erreur', icon: '🔴' },
};

export default function WAConnect() {
  const { api } = useApi();
  const { tenantId } = useApp();
  const { session } = useAuth();
  const [status, setStatus] = useState<string>('disconnected');
  const [qrBase64, setQrBase64] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const statusUI = useMemo(() => WA_STATUS_CONFIG[status] || WA_STATUS_CONFIG.disconnected, [status]);

  const fetchStatus = async () => {
    const res = await api.get('/api/v1/wa/status');
    setStatus(res.data?.status || 'disconnected');
  };

  const fetchQr = async () => {
    try {
      const res = await api.get('/api/v1/wa/qr');
      setQrBase64(res.data?.qrBase64 || '');
    } catch {
      setQrBase64('');
    }
  };

  const connect = async () => {
    setLoading(true);
    try {
      await api.post('/api/v1/wa/connect');
      await fetchStatus();
      await fetchQr();
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    setLoading(true);
    try {
      await api.post('/api/v1/wa/disconnect');
      setStatus('disconnected');
      setQrBase64('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchQr();
  }, []);

  useEffect(() => {
    if (!tenantId || !session?.access_token) return;

    const socket = io(import.meta.env.VITE_WS_URL || 'ws://localhost:4000', {
      auth: { token: session.access_token },
      transports: ['websocket'],
    });

    socket.on('wa.qr_updated', (data: any) => {
      if (data?.tenantId === tenantId) {
        setQrBase64(data.qrBase64 || '');
        setStatus('scanning');
      }
    });

    socket.on('wa.status_changed', (data: any) => {
      if (data?.tenantId === tenantId) {
        setStatus(data.status || 'disconnected');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [tenantId, session?.access_token]);

  return (
    <div className="p-6 md:p-8 bg-[#F0F2F5] min-h-full">
      <div className="max-w-3xl mx-auto bg-white border border-[#D1D7DB] rounded-2xl shadow-sm p-6 md:p-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00A884] text-white flex items-center justify-center">
              <QrCode size={20} />
            </div>
            <h1 className="text-2xl font-bold text-[#111B21]">Connexion WhatsApp</h1>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusUI.color}`}>
            {statusUI.icon} {statusUI.label}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="border border-[#E9EDEF] rounded-xl p-4 bg-[#FAFAFA]">
            <div className="aspect-square rounded-xl bg-white border border-[#E9EDEF] flex items-center justify-center overflow-hidden">
              {qrBase64 ? (
                <img src={`data:image/png;base64,${qrBase64}`} alt="QR WhatsApp" className="w-full h-full object-contain" />
              ) : (
                <div className="text-[#8696A0] text-sm text-center px-4">Aucun QR disponible. Lancez une connexion.</div>
              )}
            </div>
            <button
              onClick={fetchQr}
              className="mt-3 w-full px-3 py-2 rounded-lg border border-[#D1D7DB] text-[#54656F] hover:bg-[#F0F2F5] text-sm font-semibold flex items-center justify-center gap-2"
            >
              <RefreshCcw size={16} /> Rafraichir le QR
            </button>
          </div>

          <div className="space-y-4">
            <div className="text-sm text-[#54656F] leading-relaxed">
              1. Ouvrir WhatsApp sur votre telephone.<br />
              2. Parametres puis Appareils lies.<br />
              3. Scanner le QR code affiche.
            </div>

            <div className="flex gap-3">
              <button
                onClick={connect}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-[#00A884] text-white font-bold text-sm hover:brightness-105 disabled:opacity-50 flex items-center gap-2"
              >
                <Wifi size={16} /> Demarrer connexion
              </button>
              <button
                onClick={disconnect}
                disabled={loading || status !== 'connected'}
                className="px-4 py-2.5 rounded-xl border border-[#D1D7DB] text-[#111B21] font-bold text-sm hover:bg-[#F0F2F5] disabled:opacity-50 flex items-center gap-2"
              >
                <Link2Off size={16} /> Deconnecter
              </button>
            </div>

            <div className="text-xs text-[#8696A0] pt-2 border-t border-[#E9EDEF]">
              Note: le mode QR repose sur WhatsApp Web et peut etre limite par WhatsApp.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
