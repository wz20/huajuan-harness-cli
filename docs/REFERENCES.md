# 参考项目与设计来源

本项目的交互和实现原则参考以下类型的成熟实践，但 Runtime 保持独立且无第三方依赖：

- Claude Code：聚焦式终端问题、方向键选择、清楚的下一步交付；
- Codex / Agent 工作区协议：目录内规则、任务计划、验证与交接；
- Obsidian / Markdown 知识库：WikiLink、Markdown Link、Sidecar 与文件系统可移植性；
- Git 式审阅流程：Diff、证据、批准、验证、回滚和保留历史；
- 静态本地控制台：数据快照与操作界面分离，不让网页获得 Shell 权限。

本项目不会复制这些产品的专属运行时、云能力或全局配置。所有可执行行为以本仓库 PRD、技术设计、System Prompt 与测试为准。

## LLM Wiki / Obsidian 实现参考

- [praneybehl/llm-wiki-plugin](https://github.com/praneybehl/llm-wiki-plugin)：参考“可读 Markdown 是唯一真实数据源”、跨 Agent Skill、来源可追溯、Lint 与知识健康度；不引入其 Python、向量索引或插件安装方式。
- [NiharShrotri/llm-wiki](https://github.com/NiharShrotri/llm-wiki)：参考 raw / wiki 分层、不可变来源、结构约定、合并而非重复创建、索引与来源页面；具体目录仍由 Huajuan Agent 与用户确认。
- [Ar9av/obsidian-wiki](https://github.com/Ar9av/obsidian-wiki)：参考由 Agent Skills 维护 Obsidian Vault、WikiLink 和图谱浏览；Huajuan 不修改全局 Agent 配置。
- [arturseo-geo/llm-knowledge-base](https://github.com/arturseo-geo/llm-knowledge-base)：参考 AGENTS 约定、页面 Schema 与个人笔记和 Agent 合成内容的边界意识。
- [VectifyAI/OpenKB](https://github.com/VectifyAI/OpenKB)：参考可编辑的工作区约定、Obsidian 原生 Markdown 与 Agent Skill 接入；云 OCR、模型调用和外部运行时不是第一版依赖。

这些参考共同支持四个设计判断：原始来源和编译知识要区分；每次写入要先搜索并决定新建或合并；知识必须可追溯且能被 Lint；具体主题、分类和结构不能由通用 CLI 硬编码。

Huajuan 的终端交互与 Dashboard 均已在仓库测试中固化；不依赖本地概念稿、截图或开发机绝对路径。
