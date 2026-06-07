import fs from 'fs';
import path from 'path';

interface TrieNode {
  children: Map<string, TrieNode>;
  isEnd: boolean;
}

let trie: TrieNode = { children: new Map(), isEnd: false };
let loaded = false;

const CURATED_WORDS = [
  '傻逼', '你妈', '他妈', '尼玛', '草泥马', '操你妈', '操你',
  '日你妈', '日你', '干你', '淦你', '艹你',
  '你妈死了', '你妈逼', '妈逼', '妈批', '麻痹', '妈卖批',
  'cnm', 'nmd', 'tmd', 'wqnmlgb', 'qnmd', 'sb', 'nc',
  '狗日的', '狗娘养的', '畜生', '杂种', '狗杂种',
  '去死', '去你妈的', '滚蛋', '滚粗', '废柴', '废物',
  '脑残', '智障', '傻逼玩意', '傻b', '傻叉',
  '死全家', '全家死光', '婊子', '贱人', '贱货', '骚货',
  '鸡巴', '屌', '肏', '操蛋', '王八蛋', '龟孙子',
  '不要脸', '臭不要脸', '恶心', '变态', '神经病',
  '垃圾', '人渣', '败类', '流氓', '无赖', '混蛋',
  '杀人', '强奸', '抢劫', '放火', '吸毒', '贩毒', '赌博',
  '卖淫', '嫖娼', '诈骗', '传销', '投毒', '爆炸', '恐吓',
  '祖宗',
  'fuck', 'fucking', 'fucker', 'shit', 'bitch', 'asshole',
  'bastard', 'damn', 'dick', 'piss', 'slut', 'whore',
  'cock', 'cunt', 'douche', 'dumbass', 'jackass',
  'motherfucker', 'nigga', 'pussy', 'screw you',
  'son of a bitch', 'suck my', 'bullshit', 'crap',
  'cao', 'caonima', 'mdzz', 'rnm', 'qnmlgb',
];

function insertWord(node: TrieNode, word: string) {
  for (const ch of word) {
    if (!node.children.has(ch)) {
      node.children.set(ch, { children: new Map(), isEnd: false });
    }
    node = node.children.get(ch)!;
  }
  node.isEnd = true;
}

function buildTrie(words: string[]): TrieNode {
  const root: TrieNode = { children: new Map(), isEnd: false };
  for (const w of words) {
    const trimmed = w.trim().toLowerCase();
    if (trimmed) {
      insertWord(root, trimmed);
    }
  }
  return root;
}

function loadFiles(): string[] {
  const dataDir = path.resolve(process.cwd(), 'src', 'data');
  if (!fs.existsSync(dataDir)) {
    console.warn(`[sensitive] Data directory not found: ${dataDir}`);
    return [];
  }

  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.txt'));
  if (files.length === 0) {
    console.warn(`[sensitive] No .txt files found in ${dataDir}`);
    return [];
  }

  const words: string[] = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(dataDir, file), 'utf-8');
    const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('//') && !l.startsWith('#'));
    words.push(...lines);
    console.log(`[sensitive] Loaded ${lines.length} words from ${file}`);
  }

  return words;
}

export function init(): void {
  const fileWords = loadFiles();
  const allWords = [...new Set([...fileWords, ...CURATED_WORDS])];
  trie = buildTrie(allWords);
  loaded = true;
  console.log(`[sensitive] Trie initialized with ${allWords.length} unique words (${fileWords.length} from files + ${CURATED_WORDS.length} curated)`);
}

export function hasSensitiveWord(text: string): string | null {
  if (!loaded) {
    init();
  }

  const chars = [...text.toLowerCase()];
  const len = chars.length;

  for (let i = 0; i < len; i++) {
    let node = trie;
    for (let j = i; j < len; j++) {
      const ch = chars[j];
      if (!node.children.has(ch)) break;
      node = node.children.get(ch)!;
      if (node.isEnd) {
        return chars.slice(i, j + 1).join('');
      }
    }
  }

  return null;
}
