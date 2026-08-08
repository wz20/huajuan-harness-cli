---
id: huajuan.knowledge-ingest
name: Knowledge Ingest
version: 1
scope: system
status: active
---

# Knowledge Ingest

用于把文件或目录纳入 Huajuan 的显式关系治理。

## 流程

1. 先检查工作区 READY；未 READY 时停止并执行 Knowledge Bootstrap。
2. 按 STRUCTURE、TAXONOMY 与 CONTENT_SCHEMA 确定位置、类型、主分类、标签和格式，先搜索重复与冲突。
3. 保留原始文件和来源；非 Markdown 创建同名 Sidecar。
4. 识别 WikiLink、Markdown Link、受支持 Frontmatter 和 Harness 资产引用。
5. 正式关系必须有显式证据或用户确认；歧义保持 `unresolved`，语义相似保持 `suggested`。
6. 只更新 Huajuan 受管关系区块，不覆盖用户正文。
7. 跳过 `.harness`、保护路径、子 Harness、`.git`、`node_modules`、`dist` 和 `build`。
8. 更新分类索引与 Manifest，运行 knowledge lint 和 Doctor，报告 resolved、unresolved、external、suggested 与 Sidecar 数量。
