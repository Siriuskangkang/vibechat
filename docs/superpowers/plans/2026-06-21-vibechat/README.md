# VibeChat 实现计划（总览）

> **For agentic workers:** REQUIRED SUB-SKILL: 用 `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans` 按任务逐个实现。所有步骤用 `- [ ]` 复选框跟踪。
>
> 配套设计文档：`docs/superpowers/specs/2026-06-21-vibechat-design/`（必读，本计划是其执行展开）。

**Goal:** 实现一款 AI 驱动的情绪社交 Web 应用——输入心情→AI 解析情绪向量→匹配进情绪同频的匿名房间→WebSocket 匿名群聊（AI 主持 + 兜底 bot）→离场情绪旅程，并支持 OpenAI/Anthropic 双标准接口切换、线上部署。

**Architecture:** FastAPI（async）后端 + Next.js（App Router）前端，SQLite 零依赖；LLM 走统一适配层双实现（OpenAI 标准=百炼 / Anthropic 标准=DeepSeek `/anthropic`），`LLM_PROVIDER` 环境变量切换；情绪用 VAD 维度向量做匹配（加权 cosine）+ 房间集体情绪场（实时聚合）；WebSocket 做房间多人实时。

**Tech Stack:** Python 3.11+ / FastAPI / SQLAlchemy 2.0 / SQLite / httpx / pytest；Node 18+ / Next.js / React / TypeScript / Tailwind；nginx + 现有 SSL 部署到 `vibechat.wukangkang.com`。

---

## 1. 里程碑路线图（对齐 8:30–16:00 时间盒）

| 里程碑 | 时段 | 产出 | 文档 |
|---|---|---|---|
| **M0 脚手架** | 8:30–9:30 | 前后端骨架、config、DB 模型、seed、health、git init | [M0](./M0-脚手架.md) |
| **M1 核心纯逻辑** | 9:30–10:15 | matching/mood_field/identity/safety 纯函数 + 单测 | [M1](./M1-核心纯逻辑.md) |
| **M2 双接口适配层** | 10:15–11:00 | OpenAI/Anthropic 双实现 + factory + 单测 | [M2](./M2-双接口适配层.md) |
| **M3 情绪分析与匹配** | 11:00–12:00 | 情绪分析编排、规则降级、rooms seed、repos、REST 路由 | [M3](./M3-情绪分析与匹配.md) |
| **M4 房间实时** | 12:00–12:45 | WebSocket 连接池、房间广播、消息收发、在线状态 | [M4](./M4-房间实时.md) |
| — 午休 — | 12:45–13:00 | | |
| **M5 AI 主持·安全** | 13:00–13:45 | host 工作流（破冰/总结）、匿名身份集成、求助卡片 | [M5](./M5-AI主持安全.md) |
| **M6 差异化情绪场** | 13:45–14:15 | room_mood/resonance WS 推送、离场旅程 mood_end | [M6](./M6-差异化情绪场.md) |
| **M7 前端** | 14:15–15:15 | 首页/色盘/房间/情绪场/旅程组件 + WS 客户端 | [M7](./M7-前端.md) |
| **M8 部署·验收** | 15:15–16:00 | 全链路降级、部署 kang、mock 多用户、README、烟测 | [M8](./M8-部署验收.md) |

> 时间盒是建议节奏；**M0–M4 是 MVP 保命线**（对应赛题必做 7 项），M5–M6 是差异化，M7–M8 是交付。若时间紧，保 M0–M4 + M7 核心 + M8 部署即可拿主要分。

---

## 2. 文件结构总览（实现完成后）

```
vibechat/
├─ backend/
│  ├─ app/
│  │  ├─ main.py                 FastAPI 入口（路由+WS+CORS+init_db）
│  │  ├─ database.py             engine/SessionLocal/Base/init_db/get_db
│  │  ├─ models.py               SQLAlchemy 模型（5 表）
│  │  ├─ schemas.py              Pydantic 契约
│  │  ├─ core/{config,exceptions,logging}.py
│  │  ├─ llm/{base,openai_client,anthropic_client,factory,prompts}.py
│  │  ├─ services/{emotion_service,matching,mood_field,identity,host_service,safety}.py
│  │  ├─ repositories/{session,emotion,room,message}_repo.py
│  │  ├─ routers/{health,session,emotion,rooms}.py
│  │  ├─ ws/{connection_manager,rooms_ws}.py
│  │  └─ seeds/rooms.seed.json
│  ├─ tests/                     pytest 单测（纯逻辑 + 适配层）
│  ├─ .env.example
│  └─ requirements.txt
├─ frontend/
│  ├─ app/{layout,page,analyze,room/[slug]}.tsx + globals.css
│  ├─ components/{EmotionInput,EmotionColorWheel,RoomChat,MessageBubble,
│  │             MoodField,ResonanceBadge,MoodJourney,HostBubble,Avatar,HelpCard}.tsx
│  └─ lib/{api,ws,types,color}.ts
└─ docs/                         设计文档 + 本计划
```

---

## 3. 执行约定（所有里程碑遵守）

1. **TDD（纯逻辑必须）**：matching / mood_field / identity / safety / llm clients / factory —— 先写失败测试→验证失败→最小实现→验证通过。其余（脚手架/路由/前端组件）用"创建 + 验证可运行/可编译"。
2. **频繁提交**：每个 task 结束 `git commit`（Conventional Commits：feat/fix/test/chore）。M0 Task 1 含 `git init`。
3. **每个里程碑有验收点**：各 M 文档末尾"验收"小节，满足后才进下一个 M。
4. **降级优先**：任何依赖 LLM 的环节都要有"无 key/失败也能跑"的降级（赛题硬性）。
5. **安全**：key 只进 `.env`（gitignore），代码用占位符。
6. **轻量化**：不引组件库/重型图表库；可视化纯 SVG/Canvas/CSS。

---

## 4. 全局前置

- Python 3.11+、Node 18+ 已装。
- `cd /Users/kang/Desktop/VibeChat`。
- 从 M0 Task 1 开始 `git init`，后续每个 task 提交。
