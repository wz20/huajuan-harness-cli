# Huajuan Workspace

此文件是用户、工作区与 Agent 的长期契约。请通过花卷初始化器或 `node .harness/.huajuan.mjs init` 配置。

<!-- HUAJUAN:CONFIG:START -->
```json
{
  "schema": "huajuan-workspace/v4",
  "status": "unconfigured",
  "mode": null,
  "owner": {},
  "workspace": {},
  "agents": [],
  "paths": {},
  "safety": {
    "protectedPaths": [],
    "protectedPathPolicy": "read-only",
    "coreIntegrity": "guarded",
    "harnessCustomization": "explicit-user-request",
    "highRiskOperations": "confirm"
  },
  "knowledge": {
    "contract": "huajuan-knowledge-contract/v1",
    "readiness": "blocked",
    "relationPolicy": "explicit-only",
    "preserveSources": true,
    "unknownPlacement": "agent-propose",
    "noBulkProjectCopy": true
  },
  "evolution": {
    "enabled": true,
    "autoCapture": true,
    "badCaseCapture": "candidate-auto",
    "proposalGeneration": true,
    "autoApply": false,
    "retirement": "proposal-only",
    "deletion": "never-auto"
  }
}
```
<!-- HUAJUAN:CONFIG:END -->

<!-- HUAJUAN:ANSWERS:START -->
## 初始化回答

尚未配置。
<!-- HUAJUAN:ANSWERS:END -->

<!-- HUAJUAN:SCAN:START -->
```json
{
  "generatedAt": null,
  "topLevel": [],
  "fileCount": 0
}
```
<!-- HUAJUAN:SCAN:END -->

<!-- HUAJUAN:TASK:START -->
## Agent 计划与结果

初始化后由 Agent 在用户确认下维护本区块。
<!-- HUAJUAN:TASK:END -->
