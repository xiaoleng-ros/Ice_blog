import gemoji from '@bytemd/plugin-gemoji';
import gfm from '@bytemd/plugin-gfm';
import highlight from '@bytemd/plugin-highlight';
import math from '@bytemd/plugin-math';
import type { BytemdPlugin } from 'bytemd';
import 'highlight.js/styles/vs2015.css';
import 'katex/dist/katex.css';
import rehypeCallouts from 'rehype-callouts';
import 'rehype-callouts/theme/obsidian';
import { remarkMark } from 'remark-mark-highlight';
import markerSvg from './icon/marker.svg?raw';
import calloutSvg from './icon/callout.svg?raw';
import noteSvg from './icon/note.svg?raw';
import tipSvg from './icon/tip.svg?raw';
import warningSvg from './icon/warning.svg?raw';
import checkSvg from './icon/check.svg?raw';
import dangerSvg from './icon/danger.svg?raw';
import imageSvg from './icon/image.svg?raw';

const markers = (): BytemdPlugin => {
  return {
    // @ts-expect-error unified 版本冲突导致 Plugin 类型不兼容，运行时正常
    remark: (processor) => processor.use(remarkMark),
    actions: [
      {
        title: '标记',
        icon: markerSvg,
        handler: {
          type: 'action',
          click: (ctx) => {
            ctx.wrapText('==', '==');
          }
        }
      }
    ]
  }
}

const callouts = (): BytemdPlugin => {
  const calloutTypes = [
    { title: 'Note', icon: noteSvg, blockType: '[!NOTE]' },
    { title: 'Tip', icon: tipSvg, blockType: '[!TIP]' },
    { title: 'Warning', icon: warningSvg, blockType: '[!WARNING]' },
    { title: 'Check', icon: checkSvg, blockType: '[!CHECK]' },
    { title: 'Danger', icon: dangerSvg, blockType: '[!DANGER]' }
  ];

  return {
    // @ts-expect-error unified 版本冲突导致 Plugin 类型不兼容，运行时正常
    rehype: (processor) => processor.use(rehypeCallouts),
    actions: [
      {
        icon: calloutSvg,
        handler: {
          type: 'dropdown',
          actions: calloutTypes.map(({ title, icon, blockType }) => ({
            title,
            icon,
            handler: {
              type: 'action',
              click: (ctx) => {
                // 在光标当前位置插入 callout 块
                const editor = ctx.editor;
                const cursor = editor.getCursor();
                editor.replaceRange(`> ${blockType} ${title}\n> `, cursor);
              }
            }
          }))
        }
      }
    ]
  }
}

const material = (): BytemdPlugin => {
  return {
    actions: [
      {
        title: '素材库',
        icon: imageSvg,
        handler: {
          type: 'action',
          click: (ctx) => {
            // 在弹窗打开前保存光标位置，避免弹窗导致编辑器失焦后光标丢失
            const editor = ctx.editor;
            const cursor = editor.getCursor();
            const event = new CustomEvent('openMaterialModal', {
              detail: { ctx, cursor }
            });
            window.dispatchEvent(event);
          }
        }
      }
    ]
  }
}

export default [
  gfm({ singleTilde: false }),
  markers(),
  gemoji(),
  math(),
  highlight(),
  callouts(),
  material()
];