# Content Schema

本文件定义正式知识页面、来源、方法、脚本、素材与索引的格式。所有正式知识必须是 Obsidian 可打开的 Markdown，非 Markdown 文件使用 Sidecar。

```json
{
  "schema": "huajuan-content-schema/v1",
  "status": "awaiting-agent-confirmation",
  "documentTypes": [],
  "requiredFrontmatter": [
    "id",
    "title",
    "type",
    "status",
    "category",
    "tags",
    "sources",
    "created_at",
    "updated_at"
  ],
  "obsidian": {
    "wikilinks": true,
    "relativeAttachments": true,
    "sidecarSuffix": ".huajuan.md"
  }
}
```

## 文档类型

等待 Agent 根据主题定义 source、concept、tool、method、script、asset、case、synthesis、index 等实际需要的类型。

## 通用 Frontmatter

必须保留 JSON 契约中的基础字段；Agent 可以按领域增加字段，不能删除来源与生命周期字段。

## 分类型格式

等待 Agent 为每种正式类型定义必需章节和质量标准。

## 非 Markdown Sidecar

图片、视频、音频、PDF、脚本等原文件保持不变，以同名 `.huajuan.md` 记录元数据、来源、授权、说明和关联知识。

## Obsidian 兼容

使用 YAML Frontmatter、`[[WikiLink]]`、相对附件与 UTF-8 Markdown；不得把专有数据库作为唯一事实源。

## 未决问题

- 等待主题、目录角色和知识对象确认。

## 变更记录

- 尚未完成首次文档格式确认。
