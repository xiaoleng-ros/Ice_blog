import express from 'express';
import cors from 'cors';
import compression from 'compression';
import multer from 'multer';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import config from './config';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { logRequest } from './middlewares/logger.middleware';

const app = express();

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ThriveX API Documentation',
      version: '2.0.0',
      description: 'ThriveX Blog Server API - Node.js + Express + Prisma + Neon PostgreSQL',
    },
    servers: [
      {
        url: `http://localhost:${config.server.port}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

app.use(compression());

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.file.maxSize,
  },
});
app.use(upload.any());

app.use((req, res, next) => {
  logRequest(req);
  next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>云岫小筑</title>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700;900&family=Noto+Sans+SC:wght@300;400;500&display=swap" rel="stylesheet">
      <style>
        :root {
          --primary: #2d3436;
          --accent: #e17055;
          --accent-light: #fab1a0;
          --bg-deep: #0a0a0f;
          --bg-card: rgba(255, 255, 255, 0.03);
          --border: rgba(255, 255, 255, 0.08);
          --text: #f5f5f5;
          --text-muted: rgba(255, 255, 255, 0.5);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'Noto Sans SC', sans-serif;
          background: var(--bg-deep);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text);
          overflow: hidden;
          position: relative;
        }

        /* 动态背景 */
        .bg-gradient {
          position: fixed;
          inset: 0;
          background: 
            radial-gradient(ellipse at 20% 50%, rgba(225, 112, 85, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(108, 92, 231, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 80%, rgba(0, 206, 209, 0.05) 0%, transparent 50%);
          animation: bgShift 20s ease-in-out infinite alternate;
        }

        @keyframes bgShift {
          0% { transform: scale(1) rotate(0deg); }
          100% { transform: scale(1.1) rotate(2deg); }
        }

        /* 粒子效果 */
        .particles {
          position: fixed;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: float linear infinite;
        }

        @keyframes float {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-10vh) scale(1); opacity: 0; }
        }

        /* 主容器 */
        .container {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 60px 50px;
          max-width: 700px;
          width: 90%;
          animation: fadeInUp 1s ease-out;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* 装饰线 */
        .divider {
          width: 60px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          margin: 0 auto 30px;
          animation: expandLine 1.5s ease-out 0.5s both;
        }

        @keyframes expandLine {
          from { width: 0; opacity: 0; }
          to { width: 60px; opacity: 1; }
        }

        /* 标题 */
        h1 {
          font-family: 'Noto Serif SC', serif;
          font-size: 3.5rem;
          font-weight: 900;
          letter-spacing: 0.15em;
          margin-bottom: 12px;
          background: linear-gradient(135deg, #f5f5f5 0%, var(--accent-light) 50%, var(--accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: titleGlow 3s ease-in-out infinite alternate;
        }

        @keyframes titleGlow {
          0% { filter: drop-shadow(0 0 20px rgba(225, 112, 85, 0.1)); }
          100% { filter: drop-shadow(0 0 30px rgba(225, 112, 85, 0.2)); }
        }

        .subtitle {
          font-size: 1rem;
          color: var(--text-muted);
          letter-spacing: 0.3em;
          margin-bottom: 50px;
          font-weight: 300;
        }

        /* 链接网格 */
        .links {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 40px;
        }

        .link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 18px 24px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--text);
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 400;
          letter-spacing: 0.05em;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .link::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(225, 112, 85, 0.1), transparent);
          opacity: 0;
          transition: opacity 0.4s;
        }

        .link:hover {
          border-color: rgba(225, 112, 85, 0.3);
          transform: translateY(-3px);
          box-shadow: 0 10px 40px rgba(225, 112, 85, 0.1);
        }

        .link:hover::before { opacity: 1; }

        .link-icon {
          font-size: 1.2rem;
          position: relative;
          z-index: 1;
        }

        .link-text {
          position: relative;
          z-index: 1;
        }

        /* 状态栏 */
        .status {
          padding: 16px 24px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 10px;
          font-size: 0.85rem;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          transition: all 0.4s;
        }

        .status.success {
          border-color: rgba(0, 206, 209, 0.3);
          color: #00cec9;
        }

        .status.error {
          border-color: rgba(225, 112, 85, 0.3);
          color: var(--accent);
        }

        /* 底部装饰 */
        .footer {
          margin-top: 50px;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.2);
          letter-spacing: 0.2em;
        }

        /* 响应式 */
        @media (max-width: 600px) {
          h1 { font-size: 2.5rem; }
          .links { grid-template-columns: 1fr; }
          .container { padding: 40px 25px; }
        }
      </style>
    </head>
    <body>
      <div class="bg-gradient"></div>
      <div class="particles" id="particles"></div>
      
      <div class="container">
        <h1>云岫小筑</h1>
        <p class="subtitle">云端栖息之所</p>
        <div class="divider"></div>
        
        <div class="links">
          <a href="/api-docs" class="link">
            <span class="link-icon">📖</span>
            <span class="link-text">API 文档</span>
          </a>
          <a href="/health" class="link">
            <span class="link-icon">💚</span>
            <span class="link-text">健康检查</span>
          </a>
          <a href="/api/article" class="link">
            <span class="link-icon">📝</span>
            <span class="link-text">文章列表</span>
          </a>
          <a href="/api/user" class="link">
            <span class="link-icon">👤</span>
            <span class="link-text">用户列表</span>
          </a>
        </div>
        
        <div class="status" id="status">正在检查服务状态...</div>
        
        <div class="footer">THRIVEX BLOG SERVER</div>
      </div>

      <script>
        // 生成粒子
        const particlesContainer = document.getElementById('particles');
        for (let i = 0; i < 50; i++) {
          const particle = document.createElement('div');
          particle.className = 'particle';
          particle.style.left = Math.random() * 100 + '%';
          particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
          particle.style.animationDelay = (Math.random() * 10) + 's';
          particle.style.width = particle.style.height = (Math.random() * 3 + 1) + 'px';
          particlesContainer.appendChild(particle);
        }

        // 检查服务状态并实时更新时钟
        const statusEl = document.getElementById('status');
        let baseTime = null;
        let startTime = null;

        function updateClock() {
          if (!baseTime || !startTime) return;
          const now = new Date(baseTime.getTime() + (Date.now() - startTime));
          statusEl.innerHTML = '✅ 服务运行正常 · ' + now.toLocaleString('zh-CN');
        }

        fetch('/health')
          .then(res => res.json())
          .then(data => {
            baseTime = new Date(data.timestamp);
            startTime = Date.now();
            statusEl.className = 'status success';
            updateClock();
            setInterval(updateClock, 1000);
          })
          .catch(() => {
            statusEl.className = 'status error';
            statusEl.innerHTML = '❌ 服务异常';
          });
      </script>
    </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
