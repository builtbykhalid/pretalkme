import { Bell, X, Settings as SettingsIcon, Check, AlertCircle, Info, AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../../context/NotificationContext';
import { useState } from 'react';

export default function NotificationPanel() {
  const { t } = useTranslation();
  const [panelOpen, setPanelOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearAllNotifications
  } = useNotifications();

  const handleNavigation = (path: string) => {
    setPanelOpen(false);
    // Use window.location for broad compatibility between SPA and Astro pages
    window.location.href = path;
  };

  const goToSettings = () => {
    handleNavigation('/admin/notification-settings');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-500 bg-green-500/10';
      case 'error':
        return 'text-red-500 bg-red-500/10';
      case 'warning':
        return 'text-yellow-500 bg-yellow-500/10';
      default:
        return 'text-primary-500 bg-primary-500/10';
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('common.justNow');
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setPanelOpen(!panelOpen)}
        className="relative p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {panelOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setPanelOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-96 max-w-[90vw] bg-dark border border-neutral-800 rounded-lg shadow-2xl z-50 flex flex-col max-h-[600px]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Bell size={18} />
                {t('common.notifications')}
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              <button
                onClick={() => setPanelOpen(false)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Notifications List */}
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                <span className="ml-2 text-neutral-400">{t('common.loading')}</span>
              </div>
            ) : notifications.length > 0 ? (
              <>
                <div className="flex-1 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors cursor-pointer ${
                        !notification.is_read ? 'bg-neutral-800/30' : ''
                      }`}
                      onClick={() => !notification.is_read && markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div
                          className={`p-2 rounded-lg shrink-0 ${getNotificationColor(
                            notification.type
                          )}`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-white text-sm">
                              {notification.title}
                            </h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="text-neutral-400 hover:text-red-400 shrink-0"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <p className="text-neutral-400 text-xs mt-1">
                            {notification.message}
                          </p>
                          <p className="text-neutral-500 text-xs mt-2">
                            {formatTime(notification.created_at)}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-primary-500 rounded-full shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-neutral-800 flex gap-2">
                  <button
                    onClick={markAllAsRead}
                    className="flex-1 px-3 py-2 text-sm text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
                  >
                    {t('common.markAllAsRead')}
                  </button>
                  <button
                    onClick={clearAllNotifications}
                    className="px-3 py-2 text-neutral-400 hover:text-red-400 bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
                    title="Clear all"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={goToSettings}
                    className="px-3 py-2 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded transition-colors flex items-center gap-1"
                    title="Notification Settings"
                  >
                    <SettingsIcon size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <Bell size={32} className="text-neutral-600 mb-3" />
                <p className="text-neutral-400 text-sm">{t('common.noNotifications')}</p>
                <button
                  onClick={goToSettings}
                  className="mt-4 px-3 py-2 text-sm text-primary-400 hover:text-primary-300 flex items-center gap-2"
                >
                  <SettingsIcon size={16} />
                  {t('common.configureNotifications')}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
