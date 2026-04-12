import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase, directApi } from '../lib/supabase';
import { useAuth } from './AuthContext';

// Types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'general' | 'lead' | 'agent' | 'workflow' | 'billing' | 'system';
  is_read: boolean;
  metadata: Record<string, any>;
  created_at: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  createNotification: (title: string, message: string, type?: string, category?: string, metadata?: Record<string, any>) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsAvailable, setNotificationsAvailable] = useState(true);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Fetch notifications from database
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    if (!notificationsAvailable) {
      // If notifications table is missing, avoid repeated API calls
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      const data = await directApi.select(
        'notifications',
        '*',
        { 
          'user_id': `eq.${user.id}`,
          'order': 'created_at.desc',
          'limit': '50'
        }
      );
      
      setNotifications(data || []);
    } catch (error: any) {
      // If the table doesn't exist (404), disable notifications feature to avoid spamming errors
      const msg = (error && error.message) ? error.message : String(error);
      console.error('Error fetching notifications:', msg);
      if (msg.includes('404') || msg.includes("Could not find the table") || msg.includes('PGRST205')) {
        console.warn('Notifications table missing - disabling notifications fetch/subscription');
        setNotificationsAvailable(false);
      }
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user, notificationsAvailable]);

  // Mark single notification as read
  const markAsRead = useCallback(async (id: string) => {
    if (!user) return;

    // Optimistic update
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );

    try {
      await directApi.update('notifications', { is_read: true }, { 'id': `eq.${id}` });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert on error
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

    try {
      await directApi.update(
        'notifications', 
        { is_read: true }, 
        { 'user_id': `eq.${user.id}`, 'is_read': 'eq.false' }
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  // Delete a notification
  const deleteNotification = useCallback(async (id: string) => {
    if (!user) return;

    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== id));

    try {
      await directApi.delete('notifications', { 'id': `eq.${id}` });
    } catch (error) {
      console.error('Error deleting notification:', error);
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    if (!user) return;

    // Optimistic update
    setNotifications([]);

    try {
      await directApi.delete('notifications', { 'user_id': `eq.${user.id}` });
    } catch (error) {
      console.error('Error clearing notifications:', error);
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  // Create a new notification
  const createNotification = useCallback(async (
    title: string, 
    message: string, 
    type: string = 'info', 
    category: string = 'general',
    metadata: Record<string, any> = {}
  ) => {
    if (!user) return;

    try {
      const newNotification = {
        user_id: user.id,
        title,
        message,
        type,
        category,
        metadata,
        is_read: false
      };

      const result = await directApi.insert('notifications', newNotification);
      
      if (result && result[0]) {
        setNotifications(prev => [result[0], ...prev]);
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }, [user]);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    setLoading(true);
    await fetchNotifications();
  }, [fetchNotifications]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Set up Supabase Realtime subscription
  useEffect(() => {
    if (!user) return;
    if (!notificationsAvailable) {
      console.log('Notifications disabled - skipping realtime subscription');
      return;
    }

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New notification received:', payload);
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Notification updated:', payload);
          const updatedNotification = payload.new as Notification;
          setNotifications(prev => 
            prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Notification deleted:', payload);
          const deletedId = (payload.old as any).id;
          setNotifications(prev => prev.filter(n => n.id !== deletedId));
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('Realtime notifications disabled (local dev mode)');
        } else {
          console.log('Notification subscription status:', status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, notificationsAvailable]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        refreshNotifications,
        createNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;





