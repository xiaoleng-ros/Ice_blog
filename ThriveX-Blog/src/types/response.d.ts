interface ResponseData<T> {
    code: number,
    message: string
    // 请求失败时 data 为 undefined，调用方需使用 ?? 等默认值处理
    data: T | undefined
}

interface Paginate<T> {
    next: boolean,
    prev: boolean,
    page: number,
    size: number,
    pages: number,
    total: number,
    result: T
}

interface Page {
    page?: number,
    size?: number,
}

interface FilterData {
    key?: string | null,
    startDate?: number | null,
    endDate?: number | null
}

interface QueryData {
    // 通用的
    sort?: 'asc' | 'desc',
    pattern?: 'list' | 'tree',
    query?: FilterData,
    pagination?: Page,
}