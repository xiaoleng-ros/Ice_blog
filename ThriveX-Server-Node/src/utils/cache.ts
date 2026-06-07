import NodeCache from 'node-cache';

/**
 * 缁熶竴缂撳瓨宸ュ叿
 * 鐢ㄤ簬缂撳瓨楂橀 API 鏌ヨ缁撴灉锛屽噺灏戞暟鎹簱鏌ヨ鍘嬪姏
 * stdTTL: 缂撳瓨杩囨湡鏃堕棿锛堢锛夛紝榛樿 30 绉? * checkperiod: 瀹氭湡妫€鏌ヨ繃鏈熺紦瀛樼殑鏃堕棿闂撮殧锛堢锛? */
const cache = new NodeCache({
  stdTTL: 300,
  checkperiod: 60,
});

export default cache;
