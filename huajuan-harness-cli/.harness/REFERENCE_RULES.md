# Reference Rules

本文件定义来源、引用、WikiLink、冲突与不确定关系。没有来源或用户原创标记的内容不能升级为正式知识。

```json
{
  "schema": "huajuan-reference-rules/v1",
  "status": "awaiting-agent-confirmation",
  "sourceRequired": true,
  "acceptedRelations": [
    "references",
    "related-to",
    "derived-from",
    "belongs-to",
    "uses",
    "depends-on"
  ],
  "unresolvedPolicy": "unresolved",
  "semanticSimilarity": "suggested-only",
  "conflictPolicy": "preserve-and-review"
}
```

## 来源要求

等待 Agent 根据来源类型补充领域规则；正式知识始终需要来源或用户原创标记。

## 引用格式

等待 Agent 确认来源页、网页、对话决策和本地文件的统一引用格式。

## WikiLink 与附件

内部知识使用 Obsidian WikiLink；附件使用相对路径，不能指向工作区外。

## 冲突与不确定关系

冲突保留双方证据并进入复审；语义相似只能生成建议，不能写成事实。

## 未决问题

- 等待来源类型和知识对象确认。

## 变更记录

- 尚未完成首次引用规则确认。
