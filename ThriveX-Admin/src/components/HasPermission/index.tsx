import { hasPermission } from '@/utils/permission';

interface Props {
    code: string;
    children: React.ReactNode;
}

export default ({ code, children }: Props) => {
    const allowed = hasPermission(code);
    return allowed ? children : null;
}