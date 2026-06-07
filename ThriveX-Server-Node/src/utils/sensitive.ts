const defaultWords = [
  // === 中文脏话 ===
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

  // === 英文脏话 ===
  'fuck', 'fucking', 'fucker', 'shit', 'bitch', 'asshole',
  'bastard', 'damn', 'dick', 'piss', 'slut', 'whore',
  'cock', 'cunt', 'douche', 'dumbass', 'jackass',
  'motherfucker', 'nigga', 'pussy', 'screw you',
  'son of a bitch', 'suck my', 'bullshit', 'crap',

  // === 拼音/缩写变体 ===
  'cao', 'caonima', 'fuck', 'sb', 'nc', 'tmd', 'nmd',
  'mdzz', 'rnm', 'wqnmlgb', 'qnmlgb', 'qnmd',
];

let words: string[] = [];

export function setSensitiveWords(list: string[]) {
  words = list;
}

export function hasSensitiveWord(text: string): string | null {
  const list = words.length > 0 ? words : defaultWords;
  const lower = text.toLowerCase();
  for (const word of list) {
    if (lower.includes(word)) {
      return word;
    }
  }
  return null;
}
