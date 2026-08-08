# Huajuan Workspace MCP

本目录描述当前工作区可能需要的 MCP，不安装、不启动、不授权任何服务器。

## 目录

- `servers/*.json`：不含秘密的服务器声明，格式见 `.harness/templates/MCP_SERVER.json`。
- `profiles/*.md`：说明某个 Agent 在什么任务中、以什么最小权限使用哪些服务器。

## 强制规则

1. 不保存 API Key、Token、密码、Cookie、私钥、完整连接串或个人敏感数据。
2. 不修改 Agent 全局配置；需要启用时先提供准确步骤、数据范围、外部目的地和撤销方式。
3. 新增、安装、登录、授权、启用、扩大权限和对外传输必须等待用户明确确认。
4. 声明必须使用唯一 `id`、固定 `transport`、清晰 `purpose`、最小 `capabilities` 和 `data_boundaries`。
5. Doctor 发现秘密模式、重复 ID、越界路径或无效 Schema 时，该 MCP 不得启用。
