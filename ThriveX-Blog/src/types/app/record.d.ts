import type { Dayjs } from 'dayjs';

export interface Record {
    id?: number,
    content: string,
    images: string | string[],
    createTime?: string;
}