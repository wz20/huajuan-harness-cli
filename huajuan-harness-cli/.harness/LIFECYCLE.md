# Knowledge Lifecycle

本文件定义知识的准入、更新、合并、复审、对话沉淀和淘汰。淘汰永远不等于自动删除。

```json
{
  "schema": "huajuan-knowledge-lifecycle/v1",
  "status": "awaiting-agent-confirmation",
  "states": [
    "raw",
    "candidate",
    "active",
    "review",
    "deprecated",
    "quarantined"
  ],
  "reviewPolicy": "",
  "retirement": "proposal-only",
  "deletion": "never-auto",
  "conversationDistillation": true,
  "scheduledIngest": true
}
```

## 状态与准入

等待 Agent 明确每种状态的进入条件和升级门槛。

## 更新与合并

等待 Agent 明确查重、别名、冲突和来源保留规则。

## 复审与淘汰

等待 Agent 根据知识类型定义复审触发；deprecated 必须记录原因与替代项，文件保留。

## 对话沉淀

每次任务完成前必须判断：无需沉淀、新增、合并、更新、淘汰候选或沉淀为 Rule / Skill / Workflow。

## 定时入库

新闻等定时来源必须去重、记录来源与时间、区分事实和分析，并判断是否编译为长期知识。

## 未决问题

- 等待主题、知识类型和复审周期确认。

## 变更记录

- 尚未完成首次生命周期确认。
