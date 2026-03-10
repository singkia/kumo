/**
 * [INPUT]: 依赖 react-day-picker 的 DayPicker、DateRange、addToRange、rangeContainsModifiers，依赖 ../../utils/cn 的样式合并能力
 * [OUTPUT]: 对外提供 DatePicker 组件与 DatePickerProps 类型，补充可预测的 range 选择模式与完成回调
 * [POS]: components/date-picker 的核心适配层，负责把 react-day-picker 的选择语义收敛成 Kumo API
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import {
  DayPicker,
  type CustomComponents,
  type DateRange,
  type Modifiers,
  addToRange,
  type PropsBase,
  type PropsMulti,
  type PropsMultiRequired,
  type PropsRange,
  type PropsRangeRequired,
  rangeContainsModifiers,
  type PropsSingle,
  type PropsSingleRequired,
} from "react-day-picker";
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from "react";
import { useEffect, useState } from "react";
import { cn } from "../../utils/cn";

/**
 * Custom Chevron component using Phosphor icons
 */
const Chevron: CustomComponents["Chevron"] = ({ orientation, ...props }) => {
  const Icon = orientation === "left" ? CaretLeftIcon : CaretRightIcon;
  return <Icon size={16} {...props} />;
};

/** Base props shared across all DatePicker modes */
type BaseProps = Omit<PropsBase, "classNames"> & {
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
  /** Custom class names for internal elements */
  classNames?: PropsBase["classNames"];
};

/** Single date selection (optional) */
type SingleProps = BaseProps &
  Omit<PropsSingle, "onSelect" | "classNames"> & {
    onChange?: PropsSingle["onSelect"];
  };

/** Single date selection (required) */
type SingleRequiredProps = BaseProps &
  Omit<PropsSingleRequired, "onSelect" | "classNames"> & {
    onChange?: PropsSingleRequired["onSelect"];
  };

/** Multiple date selection (optional) */
type MultipleProps = BaseProps &
  Omit<PropsMulti, "onSelect" | "classNames"> & {
    onChange?: PropsMulti["onSelect"];
  };

/** Multiple date selection (required) */
type MultipleRequiredProps = BaseProps &
  Omit<PropsMultiRequired, "onSelect" | "classNames"> & {
    onChange?: PropsMultiRequired["onSelect"];
  };

/** Date range selection (optional) */
export type DatePickerRangeSelectionBehavior = "default" | "restart";

type RangeBehaviorProps = {
  /**
   * Controls how a completed range reacts to the next click.
   * - `"default"` — Keep extending/editing the current range like react-day-picker
   * - `"restart"` — Treat the next click as the start of a new draft range
   * @default "default"
   */
  rangeSelectionBehavior?: DatePickerRangeSelectionBehavior;
  /**
   * Fired when a range selection becomes complete (`from` and `to` are both set).
   * Useful for composed popover pickers that should close once the range is confirmed.
   */
  onRangeComplete?: (range: DateRange) => void;
};

type RangeProps = BaseProps &
  RangeBehaviorProps &
  Omit<PropsRange, "onSelect" | "classNames"> & {
    onChange?: PropsRange["onSelect"];
  };

/** Date range selection (required) */
type RangeRequiredProps = BaseProps &
  RangeBehaviorProps &
  Omit<PropsRangeRequired, "onSelect" | "classNames"> & {
    onChange?: PropsRangeRequired["onSelect"];
  };

/**
 * DatePicker props - discriminated union based on `mode`.
 * Uses `onChange` instead of `onSelect` for Kumo consistency.
 * Full type inference is preserved via the discriminated union.
 */
export type DatePickerProps =
  | SingleProps
  | SingleRequiredProps
  | MultipleProps
  | MultipleRequiredProps
  | RangeProps
  | RangeRequiredProps;

function isRangePickerProps(
  props: DatePickerProps,
): props is RangeProps | RangeRequiredProps {
  return props.mode === "range";
}

function isRestartingRangePickerProps(
  props: DatePickerProps,
): props is RangeProps | RangeRequiredProps {
  return (
    isRangePickerProps(props) && props.rangeSelectionBehavior === "restart"
  );
}

function getNextRestartingRange(
  triggerDate: Date,
  selectedRange: DateRange | undefined,
  props: RangeProps | RangeRequiredProps,
) {
  let nextRange: DateRange | undefined;

  if (!selectedRange?.from && !selectedRange?.to) {
    nextRange = { from: triggerDate, to: undefined };
  } else if (selectedRange?.from && selectedRange.to) {
    nextRange = { from: triggerDate, to: undefined };
  } else {
    nextRange = addToRange(
      triggerDate,
      selectedRange,
      props.min,
      props.max,
      Boolean(props.required),
    );
  }

  if (
    props.excludeDisabled &&
    props.disabled &&
    nextRange?.from &&
    nextRange.to &&
    rangeContainsModifiers(
      { from: nextRange.from, to: nextRange.to },
      props.disabled,
    )
  ) {
    nextRange = { from: triggerDate, to: undefined };
  }

  return nextRange;
}

/**
 * DatePicker — a date selection calendar.
 *
 * Built on [react-day-picker](https://daypicker.dev) with Kumo styling.
 * Supports three selection modes: single, multiple, and range.
 *
 * @example
 * ```tsx
 * // Single date selection
 * const [date, setDate] = useState<Date>();
 * <DatePicker mode="single" selected={date} onChange={setDate} />
 *
 * // Multiple date selection
 * const [dates, setDates] = useState<Date[]>([]);
 * <DatePicker mode="multiple" selected={dates} onChange={setDates} max={5} />
 *
 * // Date range selection
 * const [range, setRange] = useState<DateRange>();
 * <DatePicker mode="range" selected={range} onChange={setRange} numberOfMonths={2} />
 * ```
 */
export function DatePicker({
  className,
  classNames,
  onChange,
  ...props
}: DatePickerProps) {
  const controlledRange = isRangePickerProps(props) ? props.selected : undefined;
  const shouldSyncControlledRange = isRangePickerProps(props) && !onChange;
  const [uncontrolledRange, setUncontrolledRange] = useState<
    DateRange | undefined
  >(
    controlledRange,
  );

  useEffect(() => {
    if (shouldSyncControlledRange) {
      setUncontrolledRange(controlledRange);
    }
  }, [controlledRange, shouldSyncControlledRange]);

  if (isRestartingRangePickerProps(props)) {
    const selectedRange = onChange ? controlledRange : uncontrolledRange;
    const rangeOnChange = onChange as
      | ((
          selected: DateRange | undefined,
          triggerDate: Date,
          modifiers: Modifiers,
          event: ReactMouseEvent | ReactKeyboardEvent,
        ) => void)
      | undefined;

    return (
      <DayPicker
        showOutsideDays
        animate
        {...props}
        selected={selectedRange}
        onSelect={(
          _: DateRange | undefined,
          triggerDate: Date,
          modifiers: Modifiers,
          event: ReactMouseEvent | ReactKeyboardEvent,
        ) => {
          const nextRange = getNextRestartingRange(
            triggerDate,
            selectedRange,
            props,
          );

          if (!onChange) {
            setUncontrolledRange(nextRange);
          }

          rangeOnChange?.(nextRange, triggerDate, modifiers, event);

          if (nextRange?.from && nextRange.to) {
            props.onRangeComplete?.(nextRange);
          }
        }}
        classNames={{
          ...classNames,
          root: cn(
            "rdp-root select-none rounded-xl bg-kumo-base",
            classNames?.root,
            className,
          ),
        }}
        components={{
          Chevron,
          ...props.components,
        }}
      />
    );
  }

  return (
    <DayPicker
      showOutsideDays
      animate
      {...props}
      onSelect={onChange as never}
      classNames={{
        ...classNames,
        root: cn(
          "rdp-root select-none rounded-xl bg-kumo-base",
          classNames?.root,
          className,
        ),
      }}
      components={{
        Chevron,
        ...props.components,
      }}
    />
  );
}

DatePicker.displayName = "DatePicker";
