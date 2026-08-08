# Ingest Relations：来源与显式关系

- 入库内容必须尽量保留来源、原始文件和用户确认的归属。
- 工作区必须已经 READY；未确认主题、目录角色、分类和格式时只能扫描，不得执行正式入库。
- 入库前按 STRUCTURE、TAXONOMY 与 CONTENT_SCHEMA 判断位置、类型、分类、受控标签和文档格式。
- 正式关系只来自 WikiLink、Markdown Link、受支持 Frontmatter、Harness 资产显式引用或用户确认。
- 关系类型：`references`、`related-to`、`derived-from`、`belongs-to`、`uses`、`depends-on`。
- 状态：`resolved`、`unresolved`、`external`、`suggested`；证据必须记录。
- 语义相似只能生成 `suggested`，不得当作正式关系。
- 非 Markdown 文件保持原样，并创建同名 `.huajuan.md` Sidecar。
- 入库后更新分类索引、Manifest、反向关系与质量报告，并执行对话沉淀判断。
- 关系只写入 Huajuan 受管区块，不覆盖用户正文。
