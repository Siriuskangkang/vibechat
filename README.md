# VibeChat · 情绪同频的匿名房间

> 先说说此刻的心情，让情绪替你找到同频的人。

VibeChat 是一个 **AI 情绪社交 Web 应用**：用户写下此刻的心情 → AI 分析情绪色彩（VAD 维度）→ 按情绪相似度匹配到一间**匿名情绪房间** → 与同频的人 WebSocket 实时群聊，房间里有 **AI 主持**破冰、接住冷场、离场总结。

每一间房都是一个「情绪场」——成员的情绪向量实时聚合成房间的氛围色与共鸣度，让你直观感受到「此刻这里，有人和我一样」。

## ✨ 产品亮点

- **情绪向量匹配**：心情文本经 LLM 解析为 `valence / arousal / intensity / social` 四维向量，与 12 间预设情绪房做加权 cosine 相似度匹配，落点最同频的那间。
- **双标准 LLM 接口**：同时实现 OpenAI `/chat/completions` 与 Anthropic `/v1/messages` 两套适配，环境变量一键切换，业务代码零改动（默认接入 DeepSeek `deepseek-v4-pro`）。
- **实时情绪场**：WebSocket 聚合在线成员的情绪向量，房间氛围色与共鸣度随进出实时变化。
- **AI 房间主持**：破冰开场、冷场接话、离场总结；自然语调 + few-shot，弱化「AI 感」。
- **匿名与安全**：进房即分配情绪化的匿名昵称与几何头像（颜色/形状随情绪连续变化），关键词风险标记 + 求助卡片兜底。
- **情绪轨迹**：本地记录每一次情绪分析与离场总结，支持导出为精美的情绪卡片图（纯 Canvas，无依赖）。

## 🧱 技术栈

| 层 | 技术 |
|----|------|
| 后端 | FastAPI（异步）· SQLAlchemy 2.0 · SQLite（零配置）· WebSocket |
| 前端 | Next.js 16（App Router）· React 19 · TypeScript · Tailwind v4 |
| LLM | DeepSeek `deepseek-v4-pro`（OpenAI / Anthropic 双标准适配层） |
| 进程/部署 | pm2 · nginx（通配符 SSL + 反代）|

## 🏗️ 架构

```
浏览器 ──HTTPS/WS──▶ nginx (vibechat.wukangkang.com, 通配符证书)
                        ├── /            ─▶ Next.js (3001)   前端 SSR
                        ├── /api/        ─▶ FastAPI (8000)    REST
                        └── /api/ws/     ─▶ FastAPI (8000)    WebSocket 升级

FastAPI ──▶ DeepSeek（OpenAI 或 Anthropic 端点，环境变量切换）
        └─▶ SQLite（会话/情绪分析/房间/消息）
```

后端核心模块：`llm/`（双接口适配层）· `services/`（情绪匹配 `matching`、情绪场 `mood_field`、AI 主持 `host_service`、匿名身份 `identity`、安全 `safety`）· `routers/`（REST）· `ws/`（房间实时聊天）。

## 🚀 本地运行

### 后端

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # 填入真实的 LLM key
python -m uvicorn app.main:app --reload --port 8000
```

### 前端

```bash
cd frontend
npm install
npm run dev                    # http://localhost:3000
```

打开 http://localhost:3000 即可。测试：`cd backend && python -m pytest`（45 个用例）。

## 🔑 环境变量

复制 `backend/.env.example` 为 `backend/.env` 并填入（**.env 已在 .gitignore，绝不提交**）：

```ini
LLM_PROVIDER=anthropic                 # openai | anthropic
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_API_KEY=sk-***
OPENAI_MODEL=deepseek-v4-pro
ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
ANTHROPIC_API_KEY=sk-***
ANTHROPIC_MODEL=deepseek-v4-pro
CORS_ORIGINS=http://localhost:3000,https://vibechat.wukangkang.com
HOST=127.0.0.1
PORT=8000
LLM_MAX_TOKENS=4096
```

前端 `frontend/.env.local` 仅本地开发用（指向 `localhost:8000`）；**生产构建时留空**，前端走同源，由 nginx 统一反代。

## 📂 项目结构

```
VibeChat/
├── backend/
│   ├── app/
│   │   ├── llm/            # OpenAI / Anthropic 双标准适配层
│   │   ├── services/       # matching · mood_field · host_service · identity · safety
│   │   ├── routers/        # REST: session · emotion · rooms
│   │   ├── ws/             # WebSocket 房间聊天
│   │   ├── seeds/          # 12 间预设情绪房间
│   │   └── models.py       # Session / EmotionAnalysis / Room / Message ...
│   └── tests/              # 45 个 pytest 用例
├── frontend/
│   ├── app/                # 首页 · 分析页 · 房间页 · 历史页
│   ├── components/         # StarField · EmotionColorWheel · MoodField · MessageBubble ...
│   └── lib/                # ws · api · history(导出卡片) · color · session
└── docs/superpowers/       # 设计文档(10) + 实现计划(11)
```

## 🚢 部署（kang 服务器 · vibechat.wukangkang.com）

```bash
# 后端：rsync 源码 → 服务器 venv + pip + .env → pm2 守护 uvicorn (8000)
# 前端：服务器 npm install + build（PUBLIC env 留空走同源）→ pm2 next start (3001)
# nginx：新建 vibechat.wukangkang.com，复用通配符 SSL，反代 /api/ws→8000、/api→8000、/→3001
```

## 📌 赛题对齐

「第三期灵治擂台赛」——AI 情绪疗愈社交。详细的产品设计、情绪匹配引擎、双接口适配、AI 主持与安全、测试验收见 `docs/superpowers/specs/`，实现计划见 `docs/superpowers/plans/`。

## License

MIT
