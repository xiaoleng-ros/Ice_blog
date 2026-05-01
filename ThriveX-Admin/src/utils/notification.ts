import { notification } from 'antd';
import type { NotificationInstance } from 'antd/es/notification/interface';

let instance: NotificationInstance | null = null;

export const setNotificationInstance = (api: NotificationInstance) => {
  instance = api;
};

export const getNotification = (): NotificationInstance => {
  return instance || notification;
};
