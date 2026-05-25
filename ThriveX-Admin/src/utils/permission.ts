import { Permission } from '@/types/app/permission';

// 判断是否有权限（非 Hook，可以直接在模块作用域使用）
export const hasPermission = (code: string) => {
    const permission = JSON.parse(localStorage.getItem('user_storage') || '{}')?.state?.permission;
    return permission?.some((permission: Permission) => permission.name === code);
}

export default {
    user: {
        add: hasPermission('user:add'),
        del: hasPermission('user:del'),
        edit: hasPermission('user:edit'),
        info: hasPermission('user:info'),
        list: hasPermission('user:list'),
        pass: hasPermission('user:pass')
    },
    data: {
        add: hasPermission('data:add'),
        del: hasPermission('data:del')
    },
    article: {
        add: hasPermission('article:add'),
        del: hasPermission('article:del'),
        reduction: hasPermission('article:reduction'),
        edit: hasPermission('article:edit')
    },
    cate: {
        add: hasPermission('cate:add'),
        del: hasPermission('cate:del'),
        edit: hasPermission('cate:edit')
    },
    comment: {
        del: hasPermission('comment:del'),
        edit: hasPermission('comment:edit'),
        audit: hasPermission('comment:audit')
    },
    config: {
        edit: hasPermission('config:edit')
    },
    email: {
        dismiss: hasPermission('email:dismiss')
    },
    file: {
        info: hasPermission('file:info'),
        dir: hasPermission('file:dir'),
        list: hasPermission('file:list'),
        add: hasPermission('file:add'),
        del: hasPermission('file:del')
    },
    oss: {
        add: hasPermission('oss:add'),
        del: hasPermission('oss:del'),
        edit: hasPermission('oss:edit'),
        info: hasPermission('oss:info'),
        list: hasPermission('oss:list'),
        enable: hasPermission('oss:enable'),
        getEnableOss: hasPermission('oss:getEnableOss'),
        getPlatform: hasPermission('oss:getPlatform')
    },
    record: {
        add: hasPermission('record:add'),
        del: hasPermission('record:del'),
        edit: hasPermission('record:edit')
    },
    role: {
        add: hasPermission('role:add'),
        del: hasPermission('role:del'),
        edit: hasPermission('role:edit'),
        info: hasPermission('role:info'),
        list: hasPermission('role:list'),
        bindingRoute: hasPermission('role:bindingRoute')
    },
    route: {
        add: hasPermission('route:add'),
        del: hasPermission('route:del'),
        edit: hasPermission('route:edit'),
        info: hasPermission('route:info'),
        list: hasPermission('route:list')
    },
    swiper: {
        add: hasPermission('swiper:add'),
        del: hasPermission('swiper:del'),
        edit: hasPermission('swiper:edit')
    },
    tag: {
        add: hasPermission('tag:add'),
        del: hasPermission('tag:del'),
        edit: hasPermission('tag:edit')
    },
    wall: {
        del: hasPermission('wall:del'),
        edit: hasPermission('wall:edit'),
        audit: hasPermission('wall:audit')
    },
    permission: {
        add: hasPermission('permission:add'),
        del: hasPermission('permission:del'),
        edit: hasPermission('permission:edit'),
        info: hasPermission('permission:info'),
        list: hasPermission('permission:list')
    }
}