import { Permission } from '@/types/app/permission';
import useUserStore from '@/stores/modules/user';

/**
 * 判断当前用户是否拥有指定权限码
 * 直接从 Zustand store 读取，确保权限变更后立即生效
 * @param code 权限码，如 'user:add'
 * @returns 是否拥有该权限
 */
export const hasPermission = (code: string): boolean => {
    const { permission } = useUserStore.getState();
    return permission?.some((p: Permission) => p.name === code) ?? false;
}
