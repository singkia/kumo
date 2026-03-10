# date-picker/
> L2 | 父级: /Users/luo/Desktop/ClaudeCode/oss/kumo/packages/kumo/AGENTS.md

成员清单
CLAUDE.md: 模块地图，记录 date-picker 目录的职责边界与成员清单，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
date-picker.tsx: DatePicker 核心适配层，封装 react-day-picker，提供 single/multiple/range 三种模式与 restart range 语义，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
date-picker.test.tsx: range 行为回归测试，验证 restart 草稿流、popover 自动关闭与已确认范围保留，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
index.ts: 模块 barrel，导出 DatePicker 与相关类型，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

架构决策
range 的底层渲染继续委托 react-day-picker，Kumo 只在 `rangeSelectionBehavior="restart"` 时收敛点击语义，避免把 inline 日历和 popover 选择器混成一个状态机。

开发规范
所有对外 API 变更先补测试，再同步文档 demo；新增文件必须带 L3 头部，并回看本文件是否仍与目录现实一致。

变更日志
2026-03-10: 新增 range restart 行为测试，并补齐模块级文档。
