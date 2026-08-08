# Memory：长期沉淀

固定类型为 Preference、Decision、Lesson 与 Bad Case。

- Preference：稳定个人偏好。
- Decision：用户确认的决策及原因。
- Lesson：可复用经验。
- Bad Case：错误模式、用户纠正、根因、正确行为与预防方式。

由 `.harness/skills/system/memory-distillation/SKILL.md` 判断是否值得沉淀，不把判断负担交给用户。

知识沉淀与 Harness Memory 分开：领域事实、方法、工具、脚本、素材和长期总结按 CONTENT_SCHEMA 进入知识区；跨任务稳定的用户偏好、决策、经验和错误模式进入 `.harness/memory/`。每次对话结束都必须判断，但不保存完整聊天。

Bad Case 按明确性、可重复性、可预防性、稳定性四项判断，至少三项成立才创建候选；未授权删除、覆盖或敏感信息泄露等高风险事件一次也要记录。每条记忆必须有真实证据、适用范围和复核时间。敏感信息只保存必要摘要，不保存完整聊天或秘密值。
