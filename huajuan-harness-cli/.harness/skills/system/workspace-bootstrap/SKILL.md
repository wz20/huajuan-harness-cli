---
id: huajuan.workspace-bootstrap
name: Workspace Bootstrap
version: 1
scope: system
status: active
---

# Workspace Bootstrap

用于 Agent 第一次理解当前目录或工作区发生明显变化时。

## 流程

1. 读取 Harness 核心、WORKSPACE、六份知识契约、系统规则和对应 Agent 适配文件。
2. 只读扫描顶层路径、主要文件类型、已有结构和用户资产；不读取保护路径内容。
3. 判断目录为空、已有知识库、已有工作区或混合状态，不要求用户解释可由扫描得出的目录细节。
4. 第一轮输出结构事实、推断依据、不确定项和只针对长期约定的确认问题，不直接实施。
5. 与用户多轮确认目录职责、文件放置、命名、保护、归档和新增顶层目录规则。
6. 输出最终方案：最小目标结构、保留内容、拟新增或修改资产、风险、验证和回滚；等待确认后实施。
7. 结构确认后继续执行 `knowledge-bootstrap`，完成主题、分类、文档格式、引用和生命周期；不能只确认 STRUCTURE 就结束。
8. 把确认结果沉淀到六份知识契约、WORKSPACE 任务区块和必要的用户 Rule / Skill / Workflow。空目录只创建经确认的最小结构。
9. 用户完成最终确认后，运行 `node .harness/.huajuan.mjs finalize`；由 CLI 校验契约、知识质量、Doctor 和 Dashboard，并把状态更新为 READY。
