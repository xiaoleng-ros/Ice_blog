import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { Modal } from 'antd';
import { useUserStore } from '@/stores';
import { getNotification } from '@/utils/notification';

// 配置项目API域名
// 最新调整：在本地 .env 文件配置你的后端API地址
export const baseURL = import.meta.env.VITE_PROJECT_API;

// 创建 axios 实例
export const instance = axios.create({
    // 项目API根路径
    baseURL,
    // 请求超时的时间
    timeout: 10000,
});

// 标记是否已经处理过401错误
let isHandling401Error = false;

// 请求取消控制器：401 时批量取消进行中的请求，但不影响后续新请求
let abortController = new AbortController();

/** 取消所有进行中的请求，并重置控制器供后续请求使用 */
const cancelAllRequests = (reason: string) => {
    abortController.abort(reason);
    // 重新创建控制器，后续新请求不受影响
    abortController = new AbortController();
};

// 请求拦截
instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // 获取token
        const token = JSON.parse(localStorage.getItem('user_storage') || '{}')?.state.token

        // 如果有token就把赋值给请求头
        if (token) config.headers['Authorization'] = `Bearer ${token}`;

        // 注入 AbortController 的 signal，用于 401 时批量取消请求
        config.signal = abortController.signal;

        return config;
    },
    (err: AxiosError) => {
        getNotification().error({
            title: '请求异常',
            description: err.message,
        })

        return Promise.reject(err);
    }
);

// 响应拦截
instance.interceptors.response.use(
    (res: AxiosResponse) => {
        if (res.data?.code === 600) return res.data

        // 检测 Token 过期（服务器返回 code 400 + Token 过期消息）
        if (res.data?.code === 400 && res.data?.message?.includes('Token')) {
            if (isHandling401Error) return Promise.reject(res.data);

            isHandling401Error = true;
            // 取消所有进行中的请求，避免无效请求继续发送
            cancelAllRequests('Token 已过期，取消所有请求');

            Modal.error({
                title: '登录已过期',
                content: '🔒 登录状态已失效，请重新登录',
                okText: '去登录',
                onOk: () => {
                    const store = useUserStore.getState()
                    store.quitLogin()
                    isHandling401Error = false;
                }
            });

            return Promise.reject(res.data);
        }

        // 只要code不等于200, 就相当于响应失败
        if (res.data?.code !== 200) {
            getNotification().error({
                title: '响应异常',
                description: res.data?.message || '未知错误',
            })

            return Promise.reject(res.data);
        }

        return res.data;
    },
    (err: AxiosError) => {
        // 被取消的请求静默处理，不弹出错误提示
        if (axios.isCancel(err)) return Promise.reject(err);

        if (isHandling401Error) return;

        // 如果code为401就证明认证失败
        if (err.response?.status === 401) {
            isHandling401Error = true; // 标记为正在处理401错误
            // 取消所有进行中的请求，避免无效请求继续发送
            cancelAllRequests('认证失败，取消所有请求');

            Modal.error({
                title: '暂无权限',
                content: '🔒️ 登录已过期，请重新登录?',
                okText: '去登录',
                onOk: () => {
                    const store = useUserStore.getState()
                    store.quitLogin()
                    isHandling401Error = false; // 重置标记
                }
            });

            return Promise.reject(err.response?.data);
        }

        getNotification().error({
            title: '程序异常',
            description: err.message || '未知错误',
        })

        return Promise.reject(err);
    }
);

const request = <T>(method: string, url: string, reqParams?: object) => {
    return instance.request<Response<T>, Response<T>>({
        method,
        url,
        ...reqParams,
    });
};

export default request;