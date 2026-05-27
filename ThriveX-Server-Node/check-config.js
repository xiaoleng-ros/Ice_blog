const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.webConfig.findUnique({
  where: { name: 'web' }
}).then(config => {
  console.log(JSON.stringify(config.value, null, 2));
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
