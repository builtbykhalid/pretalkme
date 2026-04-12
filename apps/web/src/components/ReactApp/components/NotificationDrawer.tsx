import { X, Bell, Loader2, CheckCircle, AlertCircle, Info, AlertTriangle, Trash2 } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearAllNotifications
  } = useNotifications();

  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} className="text-emerald-500" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-amber-500" />;
      default:
        return <Info size={16} className="text-primary-500" />;
    }
  };

  const getTypeBgColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-white';
    switch (type) {
      case 'success':
        return 'bg-emerald-50';
      case 'error':
        return 'bg-red-50';
      case 'warning':
        return 'bg-amber-50';
      default:
        return 'bg-primary-50';
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-dark/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      ></div>
      <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 border-l border-neutral-100 animate-in slide-in-from-right duration-300 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-neutral-100 flex justify-between items-center">
          <h3 className="font-bold text-dark flex items-center gap-2">
            <Bell size={18} /> 
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full font-semibold">
                {unreadCount}
              </span>
            )}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded-full text-neutral-500">
            <X size={20} />
          </button>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 border-b border-neutral-100 flex justify-between items-center text-sm">
            <button 
              onClick={markAllAsRead}
              className="text-primary-600 hover:text-primary-800 font-medium"
            >
              Tout marquer comme lu
            </button>
            <button 
              onClick={clearAllNotifications}
              className="text-neutral-500 hover:text-red-600 flex items-center gap-1"
            >
              <Trash2 size={14} /> Tout effacer
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              <span className="ml-2 text-neutral-500">Chargement...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                <Bell size={24} className="text-neutral-400" />
              </div>
              <p className="text-neutral-600 font-medium">Aucune notification</p>
              <p className="text-neutral-400 text-sm mt-1">Vous recevrez des notifications lorsqu'il y aura de l'activité.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`flex gap-3 p-4 hover:bg-neutral-50 transition-colors cursor-pointer group ${getTypeBgColor(notification.type, notification.is_read)}`}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                >
                  <div className="mt-0.5">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${notification.is_read ? 'text-neutral-700' : 'text-dark'}`}>
                        {notification.title}
                      </p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="text-neutral-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <p className={`text-xs mt-1 ${notification.is_read ? 'text-neutral-500' : 'text-neutral-600'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-neutral-400 mt-2">
                      {formatTime(notification.created_at)}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 shrink-0"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}





