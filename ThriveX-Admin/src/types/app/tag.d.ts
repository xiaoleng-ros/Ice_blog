export interface Tag {
  id?: number;
  /** 标签名称 */
  name: string;
  /** 标签图标 */
  icon?: string;
  /** 标签标识（唯一），不传则自动从 name 生成 */
  mark?: string;
}
