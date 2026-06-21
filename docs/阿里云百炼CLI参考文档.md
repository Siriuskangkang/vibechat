# 阿里云百炼 CLI 参考文档

> 命令行工具 `bl` / `bailian`（npm 包名 `bailian-cli`），用于在终端调用阿里云百炼平台的大模型能力。
>
> 本文档涵盖三部分：**① 平台能做什么 + 怎么收费**（认知层）、**② 本机安装与配置**（环境层）、**③ 常用命令速查与示例**（操作层）。
>
> 数据来源：百炼官方文档知识库（`bailian-docs-llm-wiki` skill，截至 2026-06-20 共 **164 个模型家族 / 367 个主干模型**）。

---

## 目录

- [一、平台能力全景](#一平台能力全景)
- [二、图片识别与 PDF/文档识别](#二图片识别与-pdf文档识别)
- [三、计费模式与开通](#三计费模式与开通)
- [四、安装情况（本机）](#四安装情况本机)
- [五、鉴权配置](#五鉴权配置)
- [六、命令速查](#六命令速查)
- [七、快速上手示例](#七快速上手示例)
- [八、已安装的 Skills](#八已安装的-skills)
- [九、常见问题排障](#九常见问题排障)
- [十、安全注意事项](#十安全注意事项)
- [十一、相关链接](#十一相关链接)

---

## 一、平台能力全景

百炼是一个「**全模态模型市场 + 应用开发平台**」。下表按官方能力分桶列出全部能力及代表模型（来源：`models/index.md`）。

### 1. 基础 AI 服务确认（你最初关心的五项，全部齐备 ✅）

| 能力 | 是否支持 | 家族数 | 代表模型 |
| --- | --- | --- | --- |
| **大模型（LLM）/ 文生文** | ✅ | 文本生成 33 | Qwen3.7-Max、Qwen3.6-Plus、DeepSeek-V3.2、GLM-5.2、Kimi、MiniMax-M3 |
| **文生图** | ✅ | 图像生成 29 | Qwen-Image-2.0-Pro、Wan 万相、Z-Image-Turbo、AI 试衣 |
| **文生视频** | ✅ | 视频生成 25 | HappyHorse-T2V、Wan 万相、PixVerse、Vidu、可灵 |
| **文字转语音（TTS）** | ✅ | 语音合成 16 | CosyVoice、Qwen3-TTS、Sambert、百聆音乐生成 |

### 2. 完整能力分桶

| 能力（代码） | 家族数 | 说明与代表 |
| --- | --- | --- |
| 文本生成 `TG` | 33 | 通用对话 + 专项：代码（Qwen3-Coder）、数学（Qwen-Math）、长文档（Qwen-Long，最高 1000 万 tokens）、翻译（Qwen-MT）、角色扮演、法律（通义法睿）、深入研究（qwen-deep-research） |
| 深度推理 `Reasoning` | 14 | DeepSeek-R1、QwQ-Plus、QVQ-Max（视觉推理） |
| 图像生成 `IG` | 29 | 文生图、图像编辑、局部重绘、画面扩展、虚拟模特、AI 试衣、海报、艺术字 |
| 视频生成 `VG` | 25 | 文/图/参考生视频、视频编辑、数字人（EMO、LivePortrait、AnimateAnyone、VideoRetalk） |
| 语音合成 `TTS` | 16 | CosyVoice、Qwen3-TTS、Sambert（40+ 音色）、**声音复刻**（5 秒克隆）、**音乐/歌曲生成** |
| 语音识别 `ASR` | 12 + 实时 7 | Fun-ASR、Paraformer、Qwen3-ASR，支持中文七大方言、多语种、热词、实时同传 |
| 视觉理解 `VU` | 10 | Qwen-VL-Max/Plus、OCR、GUI 界面交互（可操作手机/电脑） |
| 全模态 `Omni` | 5 + 实时 4 | Qwen3.5-Omni：文本+图片+音频+视频统一理解，可语音输出 |
| 向量 / 重排 `ME`/`TR` | 2 + 2 | Qwen-Embedding、Qwen-VL-Embedding、Qwen-Rerank（构建 RAG 用） |
| 3D 生成 | 1 | Tripo（文/图 → 3D 模型，秒级） |

### 3. 平台级能力（不止调模型，还能搭应用）

| 能力 | 说明 |
| --- | --- |
| 智能体应用 | 零代码搭建 Agent 与工作流（`bl app call` / `app list`） |
| 知识库 + RAG | 上传文档自动向量化，检索增强问答（`bl knowledge retrieve`） |
| 长期记忆 | 跨会话用户记忆（`bl memory ...`） |
| 插件 & MCP | 接入外部工具与 MCP 服务器（`bl mcp ...`） |
| 联网搜索 | DashScope WebSearch（`bl search web`） |
| 模型定制 | 微调、压缩、专属部署、高速推理 |
| 评测与监控 | 应用/模型评测、调用监控、权限管理、发布分享 |
| 多端接入 | OpenAI 兼容接口、DashScope SDK、各类 Chat 客户端 |

> 💡 想看某模型的具体上下文长度、QPM 限流、价格和示例代码，可查 `bailian-docs-llm-wiki` skill 中的 `models/groups/<slug>.json`。

---

## 二、图片识别与 PDF/文档识别

图片识别和 PDF 识别都支持，但走**两条不同路线**。

### 1. 图片识别（直接支持，最强）

| 你想做的 | 用什么 | 命令 |
| --- | --- | --- |
| **提取图片里的文字（OCR）** | `qwen3.5-ocr`、`qwen-vl-ocr` | 走 OpenAI 兼容 API（见下） |
| **理解图片内容**（看图说话、图表、卡证） | `qwen3-vl-plus/max`、`qwen-vl-max` | `bl vision describe --image x.jpg --prompt "..."` |

**两个 OCR 专项模型规格**（来源：`models/groups/qwen3.5-ocr.json`、`qwen-vl-ocr.json`）：

| 模型 | 强项 | 输入 | 上下文 | 价格（元/百万 token） |
| --- | --- | --- | --- | --- |
| `qwen3.5-ocr` | 文档解析、文本定位、**关键信息抽取**（身份证/驾驶证等卡证） | 图片 | 65536 | 输入 0.5 / 输出 2 |
| `qwen-vl-ocr` | 统一图文识别，便宜，**支持批量** | 图片+文本 | 38192 | 输入 0.3 / 输出 0.5 |

**CLI 直接看图**（已核实 `bl vision describe --help`）：

```bash
bl vision describe --image photo.jpg --prompt "提取图中所有文字"
bl vision describe --image id-card.jpg --model qwen-vl-plus
```

### 2. PDF / 文档识别（走「文档解析」路线）

百炼处理 PDF 不是直接塞进视觉命令，而是通过**文档解析**，主要服务于知识库与 RAG。

- **文件解析** `DashScopeParse`：解析 `.doc`、`.docx`、`.pdf`（单文件 100M / 1000 页以内）（`wiki/guides/use-cases.md`）。
- **五种解析方式**：电子文档解析、文档智能解析、大模型文档解析、Qwen VL 解析、音视频解析（`wiki/concepts/rag.md`）。
- **DOCMIND 系列**（应用组件 API）：`DOCMIND` 智能文档解析、`DOCMIND_DIGITAL` 电子文档解析、`DOCMIND_LLM_VERSION` 大模型文档解析。
- **关键差异**：电子文档解析**不支持**插图与图表；大模型文档解析**支持**对插图/图表提问。

| 场景 | 推荐做法 |
| --- | --- |
| PDF 是**扫描件/图片型** | PDF 转图片 → `qwen3.5-ocr` / `bl vision describe` 逐页 OCR |
| PDF 是**可选中文字的电子文档** | 文档解析（DashScopeParse/DOCMIND）抽文本，或喂 `qwen-long`（1000 万 tokens / 1.5 万页）做长文档问答 |
| 想**对 PDF 内容提问/建知识库** | 上传到百炼知识库 → `bl knowledge retrieve` |
| 需要**保留图表/插图信息** | 选「大模型文档解析」或「Qwen VL 解析」 |

> [!NOTE]
> `bl vision describe` 和 `bl file upload` 目前直接接受**图片/视频/音频**；PDF 走 CLI 需用知识库（`bl knowledge retrieve`）或应用（`bl app call`）路线，或先转图片。

---

## 三、计费模式与开通

### 1. 核心结论

**可以直接消耗阿里云账户余额（按量付费），不必买任何套餐。** 本机当前用的 `sk-d...` 是百炼**通用按量计费 Key**，调任何模型都走这条路：先用免费额度，用完自动扣账户余额。

### 2. 三种计费体系（API Key 与 Base URL 互不相通，勿混用）

| 体系 | Key 格式 | 怎么扣费 | 支持范围 |
| --- | --- | --- | --- |
| **百炼按量计费** | `sk-xxx`（本机当前） | 扣**阿里云账户余额**（先免费额度） | **全部模型** |
| Token Plan 团队版 | 专属 Key | 订阅制，按 Credits（198–1398 元/坐席/月） | 仅部分文本 + 图像模型 |
| Coding Plan | `sk-sp-xxx` | 订阅制，按调用次数（Pro 200 元/月） | 仅文本，面向编程 |

### 3. 扣费抵扣顺序（来源：`wiki/concepts/token.md`）

```
免费额度  →  资源包(预购)  →  节省计划  →  按量付费(扣账户余额)
```

- **免费额度**：首次开通百炼送各模型新人额度，有效期 30–90 天，**仅抵扣华北2（北京）地域实时推理**。
- **按量单价举例**：qwen3.7-max 输入 12 元 / 输出 36 元（每百万 token）；qwen3.7-plus 输入 2 / 输出 8；轻量 qwen3.6-flash 更低。部分模型阶梯计费（输入越长单价越高）。
- **批量推理**：支持 Batch 的模型，价格为实时的 50%（非实时大批量任务适用）。
- **上下文缓存**：缓存命中的输入 token 可打折（Qwen 约 20% 折算）。

### 4. 要不要额外「开通」？

| 能力 | 要不要单独开通 |
| --- | --- |
| 文本/图像/视频/语音/OCR/向量等**模型调用** | **不用**，开通百炼 + 通用 Key 即可按量调用（本机已开通） |
| **知识库** | 2026-01-04 起计费（规格费 + 模型调用费） |
| **MCP 广场服务**（如联网搜索） | 部分需单独开通，如联网搜索前 2000 次免费、之后 29 元/千次 |
| Token Plan / Coding Plan 套餐 | **纯可选**，不买也能用 |

### 5. 省钱建议

1. 开启「**免费额度用完即停**」，避免额度耗尽后自动按量扣余额（百炼控制台设置）。
2. **简单任务用轻量模型**（如 `qwen3.6-flash`），复杂任务再用旗舰 `qwen3.7-max`。
3. 非实时大批量任务用 **Batch 批量推理**（半价）。

> 查看用量需控制台登录：`bl auth login --console`，之后用 `bl usage free` / `bl usage stats`。

---

## 四、安装情况（本机）

| 项目 | 值 |
| --- | --- |
| CLI 版本 | `1.4.0` |
| 安装方式 | `npm install -g bailian-cli` |
| 可执行文件 | `/opt/homebrew/bin/bl`、`/opt/homebrew/bin/bailian` |
| 包管理器 | npm 11.11.1（**仅支持 npm**，勿用 pnpm/yarn 安装） |
| Node 版本 | v25.8.2（要求 ≥ 22.12.0） |
| npm registry | `https://registry.npmjs.org/`（默认，网络可达） |

校验命令：

```bash
bl --version      # 输出: bl 1.4.0
which bl          # /opt/homebrew/bin/bl
```

> [!NOTE]
> 两个命令 `bl`（短别名）与 `bailian`（全名）等价，下文统一使用 `bl`。

---

## 五、鉴权配置

当前机器已完成 API Key 登录，凭据保存在 `config.json`（已落盘，重启后仍生效）。

```bash
bl auth status --output json
```

输出关键字段：

```json
{
  "authenticated": true,
  "api_key": {
    "configured": true,
    "source": "config.json",
    "masked": "sk-d...383f"
  }
}
```

配置文件位置：`/Users/kang/.bailian/config.json`（权限 600，仅本机用户可读写，内含明文 Key）。

> [!IMPORTANT]
> 当前配置的 API Key 为 `sk-d...383f`（出于安全仅显示掩码）。完整 Key 请妥善保管，不要泄露到公开渠道。

### 鉴权的四种方式

| 方式 | 命令 | 说明 |
| --- | --- | --- |
| **交互/参数登录**（推荐） | `bl auth login --api-key <你的_API_Key>` | 会先校验 Key 是否有效，再落盘到配置文件 |
| **环境变量** | 在 shell 中设置环境变量（变量名见 `bl auth status --help`） | 不落盘到配置文件，适合 CI |
| **写入配置文件** | `bl config set --key api_key --value <你的_API_Key>` | 持久化，但**不校验** Key 是否可用 |
| **命令行临时传入** | `bl text chat --api-key <你的_API_Key> --message "你好"` | 仅本次生效，不落盘 |
| **浏览器登录** | `bl auth login --console` | 用于 `app list`、`usage free` 等控制台能力，可与 API Key 并存 |

登出（清除凭据）：

```bash
bl auth logout
```

### Region（地域）

全局参数 `--region cn|us|intl`，默认 `cn`。如遇鉴权或网络异常可尝试切换。

---

## 六、命令速查

通用格式：

```bash
bl <资源> <命令> [参数] [全局参数]
```

全局参数：`--api-key <key>`（临时指定 Key）、`--region cn|us|intl`。

### 鉴权 / 配置

| 命令 | 作用 |
| --- | --- |
| `bl auth login --api-key <key>` | 用 API Key 登录 |
| `bl auth login --console` | 浏览器控制台登录 |
| `bl auth status --output json` | 查看当前鉴权状态 |
| `bl auth logout` | 清除凭据 |
| `bl config show` | 查看当前配置 |
| `bl config set --key <k> --value <v>` | 设置配置项 |
| `bl config export-schema` | 导出命令为 Anthropic/OpenAI 兼容的 JSON 工具 schema |
| `bl update` | 升级到最新版本 |

### 文本对话

| 命令 | 作用 |
| --- | --- |
| `bl text chat --message "..." --non-interactive --output json` | OpenAI 兼容的 Chat Completion |
| `bl omni` | 多模态对话（文本 + 音频输出，Qwen-Omni） |

### 图像 / 视频 / 视觉

| 命令 | 作用 |
| --- | --- |
| `bl image generate` | 文生图（Qwen-Image / wan2.x） |
| `bl image edit` | 图像编辑（Qwen-Image） |
| `bl video generate` | 文/图生视频（happyhorse-1.0-t2v/i2v、wan2.6-t2v） |
| `bl video edit` | 视频编辑（风格迁移、对象替换等） |
| `bl video ref` | 参考图生视频（多主体、多镜头 + 语音） |
| `bl video task get` | 查询异步任务状态 |
| `bl video download` | 按 task ID 下载完成的视频 |
| `bl vision describe` | 用 Qwen-VL 描述图片/视频（支持 `--image`/`--video`，默认模型 qwen3-vl-plus） |

### 语音

| 命令 | 作用 |
| --- | --- |
| `bl speech synthesize` | 文本转语音（CosyVoice TTS） |
| `bl speech recognize` | 语音识别（FunAudio-ASR） |

### 应用 / 知识 / 记忆 / MCP

| 命令 | 作用 |
| --- | --- |
| `bl app call` | 调用百炼应用（智能体 / 工作流） |
| `bl app list` | 列出百炼应用 |
| `bl knowledge retrieve` | 从百炼知识库检索（PDF/文档问答走这里） |
| `bl memory add\|search\|list\|update\|delete` | 记忆节点增删改查 |
| `bl memory profile create\|get` | 用户画像 |
| `bl mcp list\|tools\|call` | MCP 服务器与工具 |
| `bl search web` | DashScope MCP WebSearch |

### 用量 / 配额 / 工作区

| 命令 | 作用 |
| --- | --- |
| `bl usage free [--model <m>]` | 查询免费额度（需控制台登录） |
| `bl usage freetier [--off]` | 开关免费模型自动停用 |
| `bl usage stats` | 用量统计 |
| `bl quota list\|request\|history\|check` | 速率限制（RPM/TPM）管理 |
| `bl workspace list` | 列出工作区 |
| `bl advisor recommend` | 按用途推荐最佳模型 |

### 其它

| 命令 | 作用 |
| --- | --- |
| `bl file upload` | 上传本地文件到 DashScope 临时存储（48h，支持 image/video/audio） |
| `bl pipeline run\|validate` | 运行 / 校验工作流定义 |
| `bl console call` | 通过 CLI 网关调用百炼控制台 API |

> [!TIP]
> 每个子命令都支持 `--help`，例如 `bl text chat --help` 可查看完整参数。

---

## 七、快速上手示例

### 1. 一次文本对话（已验证可用）

```bash
bl text chat --message "用一句话介绍阿里云百炼" --non-interactive --output json
```

> 本机已实测：发送 `ping` 返回 `Pong! 🏓`，调用模型为 `qwen3.7-max`。

### 2. 文生图

```bash
bl image generate --help      # 先看可用模型与参数
```

### 3. 文生视频（异步）

```bash
bl video generate --help      # 生成后用 bl video task get 查询，bl video download 下载
```

### 4. 图片识别 / OCR

```bash
bl vision describe --image photo.jpg --prompt "提取图中所有文字"
```

### 5. 查看免费额度

```bash
bl auth login --console        # 先控制台登录（首次）
bl usage free                  # 查看所有模型的免费额度
```

### 6. 模型选型推荐

```bash
bl advisor recommend --help   # 描述场景，由 CLI 推荐合适模型
```

---

## 八、已安装的 Skills

通过 `npx skills add modelstudioai/skills --all -g` 全局安装到 `~/.agents/skills/`，共 5 个：

| Skill | 用途 |
| --- | --- |
| `bailian-docs-llm-wiki` | 百炼平台技术文档知识库：模型列表、API 参数、错误码、定价、多模态能力等 |
| `bailian-model-recommend` | 模型选型与推荐，按场景/功能需求决策用哪个模型 |
| `financial-expert` | 金融数据分析（A 股、基金、债券、研报、公告等，中国市场） |
| `happyhorse-prompt-studio` | HappyHorse 1.0 视频生成提示词工作室（多语言生产级提示词） |
| `spark-video-episode` | 一键式视频剧集编排（编剧↔导演并行 → 渲染 → 拼接） |

> [!NOTE]
> 安装时 `Eve` 与 `PromptScript` 两个 agent 因不支持全局 skill 安装而失败（共 10 项），其余 72 个 agent 全部安装成功，**不影响正常使用**。这些 skills 以完整 agent 权限运行，使用前请先审阅其内容。

---

## 九、常见问题排障

| 现象 | 可能原因 | 处理 |
| --- | --- | --- |
| `bl: command not found` | 全局 bin 不在 PATH | 检查 `npm prefix -g`，将其下 `bin` 目录加入 PATH |
| 安装报 engines 错误 | Node 版本过低 | 升级到 ≥ 22.12 |
| 401 / 鉴权失败 | 未登录或 Key 无效 | 重新 `bl auth login --api-key <新Key>` |
| `401 InvalidApiKey` | 混用了不同计费体系的 Key/Base URL | 通用按量用 `sk-xxx`；套餐用各自专属 Key，勿混用 |
| `429 quota exceeded` | 免费额度或套餐额度用尽 | 加购资源包/共享包，或等待下一周期；按量则检查账户余额 |
| `404 model not found` | 模型名拼错或不在当前体系白名单 | 核对模型 ID；套餐仅支持白名单内模型 |
| `No API key found` | 未配置鉴权 | 用鉴权表任一方式配置 Key |
| `bl usage free` 报 `No console access token` | 未做控制台登录 | 先 `bl auth login --console` |
| 企业网络无法访问 npm | 代理 / 镜像 | 配置 npm registry 或代理后重装 |
| 只有 pnpm 没有 npm | 误用 pnpm 安装 | 先装/修好 **npm**，再 `npm install -g bailian-cli` |

排障时优先看 JSON 输出里的 `hint` / `message` 字段：

```bash
bl auth status --output json
```

---

## 十、安全注意事项

> [!WARNING]
> - **切勿**把完整 API Key 写入仓库、日志、聊天记录或任何可公开内容。
> - CI / 非交互环境：使用 `bl ... --non-interactive`，通过密钥管理或环境变量注入 Key，不要在脚本中硬编码。
> - 如怀疑 Key 泄露，立即到[百炼控制台](https://bailian.console.aliyun.com/)吊销并重新生成。
> - 本机配置文件 `/Users/kang/.bailian/config.json` 中存有明文 Key（权限 600），请勿提交到版本控制系统或同步到公开云盘。

---

## 十一、相关链接

- 安装说明（AI Agent 版）：https://bailian.aliyun.com/cli/install.md
- 百炼控制台 API Key：https://bailian.console.aliyun.com/cn-beijing/?tab=app#/api-key
- 百炼 Skills 仓库：https://github.com/modelstudioai/skills
- Token Plan 购买：https://common-buy.aliyun.com/token-plan/
- Coding Plan 购买：https://common-buy.aliyun.com/coding-plan
- 升级 CLI：`bl update`

---

*文档创建/更新：2026-06-20 · 本机环境：macOS (Darwin) / Node v25.8.2 / bl 1.4.0*
*能力与计费数据来源：百炼官方文档知识库（bailian-docs-llm-wiki skill）*
