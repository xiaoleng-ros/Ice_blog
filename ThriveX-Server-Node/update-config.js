const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 使用原始 SQL 更新，确保 UTF-8 编码
prisma.$executeRaw`
  UPDATE web_config 
  SET value = '{"title":"Cloud","subhead":"云岫小筑","url":"https://liuyuyang.net","favicon":"/favicon.ico","description":"也许会是最好用的博客管理系统","keyword":"Cloud,博客,Blog","footer":"© 2026 Cloud All rights reserved.","icp":""}'::jsonb
  WHERE name = 'web'
`.then(() => {
  console.log('updated');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
