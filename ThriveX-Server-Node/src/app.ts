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
          --accent: #818cf8;
          --accent-light: #a5b4fc;
          --accent-glow: rgba(129, 140, 248, 0.35);
          --accent-soft: rgba(129, 140, 248, 0.1);
          --bg-base: #161825;
          --bg-mid: #1c1f30;
          --bg-surface: #1e2135;
          --bg-card: rgba(255, 255, 255, 0.05);
          --bg-card-hover: rgba(255, 255, 255, 0.08);
          --border: rgba(255, 255, 255, 0.08);
          --border-hover: rgba(129, 140, 248, 0.45);
          --text: #e8ecf4;
          --text-muted: rgba(232, 236, 244, 0.55);
          --text-dim: rgba(232, 236, 244, 0.28);
          --success: #34d399;
          --success-glow: rgba(52, 211, 153, 0.3);
          --cyan: #22d3ee;
          --cyan-glow: rgba(34, 211, 238, 0.22);
          --purple: #a78bfa;
          --purple-glow: rgba(167, 139, 250, 0.18);
          --pink: #f472b6;
          --pink-glow: rgba(244, 114, 182, 0.15);
          --shadow-card: 0 2px 12px rgba(0, 0, 0, 0.35), 0 1px 3px rgba(0, 0, 0, 0.25);
          --shadow-card-hover: 0 12px 48px rgba(0, 0, 0, 0.45), 0 0 24px var(--accent-soft);
          --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
          --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--bg-base);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text);
          overflow: hidden;
          position: relative;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* 深邃渐变背景 */
        .bg-gradient {
          position: fixed;
          inset: 0;
          background: 
            radial-gradient(ellipse 70% 50% at 30% 20%, rgba(129, 140, 248, 0.08) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 75% 80%, rgba(34, 211, 238, 0.05) 0%, transparent 50%),
            radial-gradient(ellipse 40% 40% at 50% 50%, rgba(167, 139, 250, 0.04) 0%, transparent 45%),
            linear-gradient(180deg, var(--bg-mid) 0%, var(--bg-base) 50%, var(--bg-surface) 100%);
          animation: bgBreath 25s ease-in-out infinite alternate;
          z-index: 0;
        }

        @keyframes bgBreath {
          0% { transform: scale(1) rotate(0deg); }
          33% { transform: scale(1.02) rotate(0.3deg); }
          66% { transform: scale(0.99) rotate(-0.2deg); }
          100% { transform: scale(1.01) rotate(0.1deg); }
        }

        /* 极细网格 */
        .grid-overlay {
          position: fixed;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
          background-size: 80px 80px;
          z-index: 1;
          pointer-events: none;
          mask-image: radial-gradient(ellipse 50% 50% at 50% 50%, black 5%, transparent 60%);
        }

        /* 极光光线 */
        .light-beam {
          position: fixed;
          width: 250%;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, var(--accent-glow) 30%, var(--cyan-glow) 50%, var(--accent-glow) 70%, transparent 100%);
          z-index: 1;
          pointer-events: none;
          opacity: 0.5;
          filter: blur(0.5px);
        }

        .light-beam-1 {
          top: 25%;
          left: -75%;
          animation: beamDrift1 20s linear infinite;
        }

        .light-beam-2 {
          top: 55%;
          left: -75%;
          animation: beamDrift2 25s linear infinite;
          animation-delay: -8s;
        }

        .light-beam-3 {
          top: 75%;
          left: -75%;
          animation: beamDrift3 30s linear infinite;
          animation-delay: -15s;
        }

        @keyframes beamDrift1 {
          0% { transform: translateX(0) rotate(-3deg); }
          100% { transform: translateX(75%) rotate(-3deg); }
        }

        @keyframes beamDrift2 {
          0% { transform: translateX(0) rotate(2deg); }
          100% { transform: translateX(75%) rotate(2deg); }
        }

        @keyframes beamDrift3 {
          0% { transform: translateX(0) rotate(-1.5deg); }
          100% { transform: translateX(75%) rotate(-1.5deg); }
        }

        /* 光晕 */
        .glow-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          z-index: 1;
        }

        .glow-orb-1 {
          width: 400px;
          height: 400px;
          background: var(--accent-glow);
          top: -100px;
          right: 15%;
          animation: orbFloat1 22s ease-in-out infinite alternate;
        }

        .glow-orb-2 {
          width: 350px;
          height: 350px;
          background: var(--cyan-glow);
          bottom: -80px;
          left: 20%;
          animation: orbFloat2 18s ease-in-out infinite alternate;
        }

        .glow-orb-3 {
          width: 250px;
          height: 250px;
          background: var(--purple-glow);
          top: 45%;
          left: 55%;
          animation: orbFloat3 16s ease-in-out infinite alternate;
        }

        @keyframes orbFloat1 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 25px) scale(1.08); }
          100% { transform: translate(15px, -15px) scale(0.95); }
        }

        @keyframes orbFloat2 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(25px, -30px) scale(1.1); }
          100% { transform: translate(-15px, 15px) scale(0.92); }
        }

        @keyframes orbFloat3 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          50% { transform: translate(-20px, -15px) scale(1.15); opacity: 0.7; }
          100% { transform: translate(15px, 20px) scale(0.88); opacity: 0.4; }
        }

        /* 星尘粒子 */
        .particles {
          position: fixed;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 2;
        }

        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: var(--accent-light);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--accent-glow);
          animation: particleDrift linear infinite;
        }

        @keyframes particleDrift {
          0% { transform: translateY(100vh) translateX(0) scale(0); opacity: 0; }
          5% { opacity: 1; transform: translateY(95vh) translateX(5px) scale(1); }
          50% { transform: translateY(50vh) translateX(-8px) scale(0.8); }
          95% { opacity: 0.8; }
          100% { transform: translateY(-5vh) translateX(-12px) scale(0.3); opacity: 0; }
        }

        /* 主容器 */
        .container {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 70px 60px;
          max-width: 720px;
          width: 90%;
          animation: fadeInUp 1.2s var(--ease-out-expo);
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* 装饰线 */
        .divider {
          width: 60px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent), var(--cyan), var(--accent), transparent);
          margin: 0 auto 40px;
          border-radius: 1px;
          animation: expandLine 1.8s var(--ease-out-expo) 0.6s both;
          box-shadow: 0 0 12px var(--accent-glow);
        }

        @keyframes expandLine {
          from { width: 0; opacity: 0; }
          to { width: 60px; opacity: 1; }
        }

        /* 标题 */
        h1 {
          font-family: 'Noto Serif SC', serif;
          font-size: 3.8rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          margin-bottom: 14px;
          background: linear-gradient(135deg, #ffffff 0%, var(--accent-light) 25%, var(--cyan) 50%, var(--accent) 75%, #ffffff 100%);
          background-size: 400% 400%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: titleShimmer 8s ease-in-out infinite;
          filter: drop-shadow(0 0 25px var(--accent-glow));
        }

        @keyframes titleShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .subtitle {
          font-size: 0.9rem;
          color: var(--text-muted);
          letter-spacing: 0.4em;
          margin-bottom: 55px;
          font-weight: 300;
          text-transform: uppercase;
        }

        /* 链接网格 */
        .links {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          margin-bottom: 45px;
        }

        .link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 18px 22px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--text);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 400;
          letter-spacing: 0.08em;
          transition: all 0.5s var(--ease-out-expo);
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          cursor: pointer;
          box-shadow: var(--shadow-card);
        }

        .link::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--accent-soft), rgba(34, 211, 238, 0.03));
          opacity: 0;
          transition: opacity 0.5s;
        }

        .link::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(129, 140, 248, 0.08), transparent);
          transition: left 1s var(--ease-out-expo);
        }

        .link:hover {
          border-color: var(--border-hover);
          transform: translateY(-3px);
          box-shadow: var(--shadow-card-hover);
          background: var(--bg-card-hover);
        }

        .link:hover::before { opacity: 1; }
        .link:hover::after { left: 150%; }

        .link-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          position: relative;
          z-index: 1;
          transition: all 0.4s var(--ease-out-expo);
        }

        .link:hover .link-icon {
          transform: scale(1.15);
          filter: drop-shadow(0 0 8px var(--accent-glow));
        }

        .link-icon svg {
          width: 18px;
          height: 18px;
          stroke: var(--accent-light);
          fill: none;
          stroke-width: 1.5;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .link-text {
          position: relative;
          z-index: 1;
        }

        /* 状态栏 */
        .status {
          padding: 14px 22px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 10px;
          font-size: 0.82rem;
          color: var(--text-muted);
          letter-spacing: 0.06em;
          transition: all 0.5s var(--ease-out-expo);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: var(--shadow-card);
        }

        .status.success {
          border-color: rgba(52, 211, 153, 0.25);
          color: var(--success);
          background: rgba(52, 211, 153, 0.04);
          box-shadow: 0 0 12px var(--success-glow);
        }

        .status.error {
          border-color: rgba(244, 114, 182, 0.25);
          color: var(--pink);
          background: rgba(244, 114, 182, 0.04);
        }

        .status-icon {
          display: inline-block;
          margin-right: 6px;
          vertical-align: middle;
        }

        .status-icon svg {
          width: 14px;
          height: 14px;
          vertical-align: middle;
        }

        /* 底部装饰 */
        .footer {
          margin-top: 55px;
          font-size: 0.65rem;
          color: var(--text-dim);
          letter-spacing: 0.3em;
          text-transform: uppercase;
        }

        /* 响应式 */
        @media (max-width: 600px) {
          h1 { font-size: 2.5rem; }
          .links { grid-template-columns: 1fr; }
          .container { padding: 45px 25px; }
          .glow-orb { display: none; }
          .light-beam { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="bg-gradient"></div>
      <div class="grid-overlay"></div>
      <div class="light-beam light-beam-1"></div>
      <div class="light-beam light-beam-2"></div>
      <div class="light-beam light-beam-3"></div>
      <div class="glow-orb glow-orb-1"></div>
      <div class="glow-orb glow-orb-2"></div>
      <div class="glow-orb glow-orb-3"></div>
      <div class="particles" id="particles"></div>
      
      <div class="container">
        <h1>云岫小筑</h1>
        <p class="subtitle">云端栖息之所</p>
        <div class="divider"></div>
        
        <div class="links">
          <a href="/api-docs" class="link">
            <span class="link-icon">
              <svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </span>
            <span class="link-text">API 文档</span>
          </a>
          <a href="/health" class="link">
            <span class="link-icon">
              <svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </span>
            <span class="link-text">健康检查</span>
          </a>
          <a href="/api/article" class="link">
            <span class="link-icon">
              <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </span>
            <span class="link-text">文章列表</span>
          </a>
          <a href="/api/user" class="link">
            <span class="link-icon">
              <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
            <span class="link-text">用户列表</span>
          </a>
        </div>
        
        <div class="status" id="status">
          <span class="status-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </span>
          正在检查服务状态...
        </div>
        
        <div class="footer">THRIVEX BLOG SERVER</div>
      </div>

      <script>
        // 生成粒子
        const particlesContainer = document.getElementById('particles');
        for (let i = 0; i < 35; i++) {
          const particle = document.createElement('div');
          particle.className = 'particle';
          particle.style.left = Math.random() * 100 + '%';
          particle.style.animationDuration = (Math.random() * 12 + 12) + 's';
          particle.style.animationDelay = (Math.random() * 12) + 's';
          const size = Math.random() * 1.5 + 0.8;
          particle.style.width = size + 'px';
          particle.style.height = size + 'px';
          particle.style.opacity = Math.random() * 0.5 + 0.2;
          particlesContainer.appendChild(particle);
        }

        // 检查服务状态并实时更新时钟
        const statusEl = document.getElementById('status');
        let baseTime = null;
        let startTime = null;

        function updateClock() {
          if (!baseTime || !startTime) return;
          const now = new Date(baseTime.getTime() + (Date.now() - startTime));
          const timeStr = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
          statusEl.innerHTML = '<span class="status-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></span>服务运行正常 · ' + timeStr;
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
            statusEl.innerHTML = '<span class="status-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></span>服务异常';
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
