---
id: huajuan.memory-distillation
name: Memory Distillation
version: 1
scope: system
status: active
---

# Memory Distillation

用于任务完成前判断是否存在值得长期沉淀的 Preference、Decision、Lesson 或 Bad Case。

## 判断

- Preference：跨任务稳定、明确由用户表达，且未来会改变 Agent 行为。
- Decision：用户已确认选择，并存在上下文、理由或权衡。
- Lesson：至少可复用于一个未来场景，包含证据与适用边界。
- Bad Case：明确性、可重复性、可预防性、稳定性至少三项成立；未授权删除、覆盖或泄密一次即记录。

## 禁止

- 不保存完整聊天、秘密值、一次性状态、未经确认的推测或文件内容副本。
- 不因为“可能有用”创建记忆。
- 自动进化关闭时不写入文件，除非用户明确要求。

记录必须包含 `id`、`status`、`created_at`、`updated_at`、`evidence`、`scope` 和 `review_after`。

## 与知识沉淀的分流

- 领域事实、方法、工具、脚本、素材和总结 → 按 CONTENT_SCHEMA 进入知识目录。
- 稳定用户偏好、已确认决策、跨领域经验和错误模式 → Harness Memory。
- 可执行重复能力 → Rule / Skill / Workflow。
- 一次性上下文、过程闲聊、无来源推测 → 无需沉淀。

每次任务结束都必须明确选择一种结果，不把完整对话复制进知识库。
