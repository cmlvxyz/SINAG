import { soundEffects } from './soundEffects';
import { PushNotificationItem } from '../types';

export class PushNotificationService {
  private static instance: PushNotificationService;
  private listeners: ((item: PushNotificationItem) => void)[] = [];

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return 'denied';
    }
  }

  public getPermissionStatus(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  public subscribe(callback: (item: PushNotificationItem) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  public sendPushAlert(
    title: string, 
    body: string, 
    type: PushNotificationItem['type'] = 'SOS_DISPATCH',
    incidentId?: string
  ): PushNotificationItem {
    const item: PushNotificationItem = {
      id: 'push-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title,
      body,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
      read: false,
      incidentId
    };

    // Play synthesized push notification sound
    if (type === 'SOS_DISPATCH') {
      soundEffects.playEmergencySiren(1.8);
    } else {
      soundEffects.playPushAlertPing();
    }

    // Try native Web Notification if allowed
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: item.id
        });
      } catch {
        // Fallback to in-app notification
      }
    }

    // Notify in-app subscribers
    this.listeners.forEach(cb => cb(item));

    return item;
  }
}

export const pushService = PushNotificationService.getInstance();
