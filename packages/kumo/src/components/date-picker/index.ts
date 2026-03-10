/**
 * [INPUT]: 依赖 ./date-picker 的实现与 react-day-picker 的类型导出
 * [OUTPUT]: 对外提供 date-picker 模块的稳定入口与便捷类型导出
 * [POS]: components/date-picker 的 barrel 文件，给包级导出和按路径导出提供统一边界
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export { DatePicker } from "./date-picker";
export type {
  DatePickerProps,
  DatePickerRangeSelectionBehavior,
} from "./date-picker";

// Re-export useful types from react-day-picker for convenience
export type { DateRange, DayPickerProps } from "react-day-picker";
