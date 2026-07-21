'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import ICPIcon from '../../images/ICP.png';

interface ICPBeianProps {
  icp?: string;
}

/**
 * 安全执行受控的 <script> 标签
 * 仅执行 src 为工信部备案官方域名的脚本，防止 XSS 注入恶意外链脚本
 */
function safeExecuteScripts(container: HTMLElement, icpHtml: string) {
  // 白名单：仅允许工信部官方域名脚本（用于工信部 ICP 备案点击统计）
  const ALLOWED_SCRIPT_SRC = ['beian.miit.gov.cn', 'cdn.beian.miit.gov.cn'];
  const ALLOWED_ATTRS = ['src', 'type', 'charset', 'async', 'defer'];

  const scripts = container.getElementsByTagName('script');
  Array.from(scripts).forEach((oldScript) => {
    const newScript = document.createElement('script');

    // 仅复制白名单属性，过滤 onerror/onload 等事件属性
    for (const attr of Array.from(oldScript.attributes)) {
      if (ALLOWED_ATTRS.includes(attr.name)) {
        // src 必须在白名单域名内
        if (attr.name === 'src') {
          try {
            const srcUrl = new URL(attr.value, window.location.origin);
            if (!ALLOWED_SCRIPT_SRC.some((allowed) => srcUrl.hostname.endsWith(allowed))) {
              // 非白名单域名：拒绝执行，防止 XSS
              continue;
            }
          } catch {
            continue;
          }
        }
        newScript.setAttribute(attr.name, attr.value);
      }
    }

    // 仅允许脚本内容为空（外部脚本）或纯工信部备案统计代码
    // 不允许执行任意内联脚本，防止注入
    const textContent = oldScript.textContent?.trim();
    if (textContent) {
      // 内联脚本：仅允许极简的统计代码（必须通过简单字符校验，无敏感 API 调用）
      if (/^[a-zA-Z0-9_\s.();'"]{0,500}$/.test(textContent) && !/fetch|XMLHttpRequest|eval|Function|document\.cookie/.test(textContent)) {
        newScript.textContent = textContent;
      } else {
        // 不符合白名单的内联脚本：丢弃
      }
    }

    oldScript.parentNode?.replaceChild(newScript, oldScript);
  });

  void icpHtml; // 标记参数已使用（保留参数便于未来扩展校验逻辑）
}

/**
 * 清理 HTML：移除事件属性和非白名单标签
 * 防止管理员后台被攻破后，向访客博客注入 onerror、onclick 等事件型 XSS
 */
function sanitizeHtml(html: string): string {
  // 移除所有 on 开头的事件属性（onerror、onclick、onload 等）
  let sanitized = html.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, ' ');
  // 移除 javascript: 伪协议
  sanitized = sanitized.replace(/(href|src)\s*=\s*["']javascript:[^"']*["']/gi, '$1="#"');
  // 移除 data: URI 中的脚本（保留图片 data URI）
  sanitized = sanitized.replace(/(href|src)\s*=\s*["']data:text\/html[^"']*["']/gi, '$1="#"');
  return sanitized;
}

export default function ICPBeian({ icp }: ICPBeianProps) {
  const icpRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 处理ICP备案HTML+JavaScript代码
    if (icp && icpRef.current) {
      // 检查是否包含HTML标签或script标签
      if (icp.includes('<') || icp.includes('script')) {
        // 修复 P2：先对 HTML 进行白名单清理，移除事件属性和危险协议
        const sanitized = sanitizeHtml(icp);
        icpRef.current.innerHTML = sanitized;
        // 执行受控的 script 标签（仅允许工信部官方域名）
        safeExecuteScripts(icpRef.current, sanitized);
      }
    }
  }, [icp]);

  // 如果没有ICP，不渲染
  if (!icp) {
    return null;
  }

  // 判断是否为HTML代码
  const isHtml = icp.includes('<') || icp.includes('script');

  return (
    <div className="flex flex-col items-center gap-2 pb-4">
      {/* ICP备案 - 纯文本显示图标+链接，HTML直接渲染 */}
      <div className="group flex justify-center items-center space-x-2 cursor-pointer">
        {!isHtml && (
          <Image src={ICPIcon} alt="ICP" width={20} height={22} className="w-5 h-[22px]" />
        )}
        {isHtml ? (
          <div ref={icpRef} className="group-hover:text-primary flex items-center" />
        ) : (
          <a
            href="https://beian.miit.gov.cn"
            target="_blank"
            rel="noopener noreferrer"
            className="group-hover:text-primary"
          >
            {icp}
          </a>
        )}
      </div>
    </div>
  );
}
