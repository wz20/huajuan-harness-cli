# File Placement：文件归属

- 创建文件前先只读扫描并判断归属；不要求用户预先解释所有目录语义。
- 创建或移动工作区内容前先确认工作区 READY，并读取 `STRUCTURE.md`、`TAXONOMY.md` 与 `CONTENT_SCHEMA.md`；已确认的目录职责、分类和格式优先于 Agent 自己的偏好。
- 无法判断时先在方案中提出最小位置选择，不擅自创建新的顶层目录。
- 新增顶层目录、改变目录职责或批量迁移前，先向用户确认并同步 `STRUCTURE.md`。
- 工作区级 Rule、Skill、Workflow、MCP、Memory、Bad Case 和 Proposal 只能进入 `.harness` 对应用户目录。
- 不在工作区根目录创建临时目录；临时文件使用操作系统 temp 并在完成后清理。
- 不复制已经存在的重复内容或资产；优先引用、合并或更新。
- 混合模式不得把整个项目目录复制到长期知识目录；空目录只提出最小结构方案。
- 正式知识文件必须进入 STRUCTURE 声明的 knowledge role；无法分类时保持候选，不擅自创建分类、标签或顶层目录。
