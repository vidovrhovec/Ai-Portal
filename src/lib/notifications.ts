'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date(),
          read: false,
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      removeNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          const newNotifications = state.notifications.filter((n) => n.id !== id);
          return {
            notifications: newNotifications,
            unreadCount: notification && !notification.read
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount,
          };
        });
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },
    }),
    {
      name: 'notifications-storage',
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 50), // Keep only last 50
        unreadCount: state.unreadCount,
      }),
    }
  )
);

// Notification API functions
export const notificationApi = {
  // Add a new notification
  add: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    useNotificationStore.getState().addNotification(notification);
  },

  // Course-related notifications
  courseEnrolled: (courseName: string) => {
    notificationApi.add({
      type: 'success',
      title: 'Vpisan v tečaj',
      message: `Uspešno ste se vpisali v tečaj "${courseName}".`,
      actionUrl: '/dashboard/student?section=learning',
      actionText: 'Začni učenje',
    });
  },

  courseCompleted: (courseName: string) => {
    notificationApi.add({
      type: 'success',
      title: 'Tečaj zaključen',
      message: `Čestitamo! Zaključili ste tečaj "${courseName}".`,
      actionUrl: '/dashboard/student?section=progress',
      actionText: 'Ogled dosežkov',
    });
  },

  // Quiz/Test notifications
  quizCompleted: (quizName: string, score: number) => {
    const type = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error';
    notificationApi.add({
      type,
      title: 'Kviz zaključen',
      message: `Dosegli ste ${score}% na kvizu "${quizName}".`,
      actionUrl: '/dashboard/student?section=analytics',
      actionText: 'Ogled rezultatov',
    });
  },

  assignmentDue: (assignmentName: string, dueDate: Date) => {
    const hoursUntilDue = Math.max(0, Math.floor((dueDate.getTime() - Date.now()) / (1000 * 60 * 60)));
    if (hoursUntilDue <= 24) {
      notificationApi.add({
        type: 'warning',
        title: 'Rok za oddajo',
        message: `Naloga "${assignmentName}" zapade čez ${hoursUntilDue} ur.`,
        actionUrl: '/dashboard/student?section=learning',
        actionText: 'Ogled naloge',
      });
    }
  },

  // Social notifications
  groupInvite: (groupName: string) => {
    notificationApi.add({
      type: 'info',
      title: 'Vabilo v skupino',
      message: `Povabljeni ste v skupino "${groupName}".`,
      actionUrl: '/dashboard/student?section=social',
      actionText: 'Ogled vabila',
    });
  },

  messageReceived: (senderName: string) => {
    notificationApi.add({
      type: 'info',
      title: 'Novo sporočilo',
      message: `${senderName} vam je poslal sporočilo.`,
      actionUrl: '/dashboard/student?section=social',
      actionText: 'Preberi sporočilo',
    });
  },

  // Achievement notifications
  achievementUnlocked: (achievementName: string) => {
    notificationApi.add({
      type: 'success',
      title: 'Dosežek odklenjen',
      message: `Čestitamo! Odklenili ste dosežek "${achievementName}".`,
      actionUrl: '/dashboard/student?section=progress',
      actionText: 'Ogled dosežkov',
    });
  },

  streakMaintained: (streakCount: number) => {
    if (streakCount % 7 === 0) { // Weekly milestone
      notificationApi.add({
        type: 'success',
        title: 'Serija vzdrževana',
        message: `Ohranili ste ${streakCount}-dnevno serijo učenja!`,
        actionUrl: '/dashboard/student?section=progress',
        actionText: 'Ogled serije',
      });
    }
  },

  // AI-related notifications
  aiInsight: (topic: string) => {
    notificationApi.add({
      type: 'info',
      title: 'AI vpogled',
      message: `AI je odkril priložnost za izboljšanje pri "${topic}".`,
      actionUrl: '/dashboard/student?section=ai',
      actionText: 'Ogled vpogleda',
    });
  },

  // System notifications
  systemMaintenance: (message: string) => {
    notificationApi.add({
      type: 'warning',
      title: 'Vzdrževanje sistema',
      message,
    });
  },

  newFeature: (featureName: string) => {
    notificationApi.add({
      type: 'info',
      title: 'Nova funkcionalnost',
      message: `Na voljo je nova funkcionalnost: ${featureName}`,
      actionUrl: '/dashboard/student?section=tools',
      actionText: 'Preizkusi',
    });
  },
};