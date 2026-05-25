import { useEffect, useState } from 'react';
import { createAvatar } from '@dicebear/core';

// 使用指定风格头像
import { pixelArt } from '@dicebear/collection';

export default ({ className }: { className?: string }) => {
    const [avatar, setAvatar] = useState('');

    useEffect(() => {
        const seed = Math.random().toString(36).substring(2, 15);
        createAvatar(pixelArt, { seed, size: 128 }).toDataUri().then(setAvatar);
    }, []);

    if (!avatar) return null;
    return <img src={avatar} alt="Avatar" className={className} />
}