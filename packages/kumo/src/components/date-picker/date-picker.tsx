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
import {
  useEffect,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { cn } from "../../utils/cn";

/**
 * Custom Chevron component using Phosphor icons
 */
const Chevron: CustomComponents["Chevron"] = ({ orientation, ...props }) => {
  const Icon = orientation === "left" ? CaretLeftIcon : CaretRightIcon;
  return <Icon size={16} {...props} />;
};

export type DatePickerRangeSelectionBehavior = "default" | "restart";

/** Base props shared across all DatePicker modes */
type BaseProps = Omit<PropsBase, "classNames"> & {
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
  /** Custom class names for internal elements */
  classNames?: PropsBase["classNames"];
  /**
   * Controls how a completed range reacts to the next click.
   * Only applies when `mode="range"`.
   * - `"default"` — Keep extending/editing the current range like react-day-picker
   * - `"restart"` — Treat the next click as the start of a new draft range
   * @default "default"
   */
  rangeSelectionBehavior?: DatePickerRangeSelectionBehavior;
  /**
   * Fired when a range selection becomes complete (`from` and `to` are both set).
   * Only applies when `mode="range"`.
   * Useful for composed popover pickers that should close once the range is confirmed.
   */
  onRangeComplete?: (range: DateRange) => void;
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

type RangeProps = BaseProps &
  Omit<PropsRange, "onSelect" | "classNames"> & {
    onChange?: PropsRange["onSelect"];
  };

/** Date range selection (required) */
type RangeRequiredProps = BaseProps &
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

function getNextRestartingRange(
  triggerDate: Date,
  selectedRange: DateRange | undefined,
  props: RangeProps | RangeRequiredProps,
) {
  let nextRange: DateRange | undefined;

  // Empty range or completed range: start a new draft from the clicked date
  if (!selectedRange?.from || selectedRange.to) {
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
 * Internal component for range pickers with restart behavior.
 * Isolated so that the uncontrolled-range state and sync effect
 * are only mounted when actually needed.
 */
function RestartingRangePicker({
  className,
  classNames,
  ...props
}: RangeProps | RangeRequiredProps) {
  const { onChange, onRangeComplete, rangeSelectionBehavior: _, ...rest } = props;
  const controlledRange = props.selected;
  const [uncontrolledRange, setUncontrolledRange] = useState<
    DateRange | undefined
  >(controlledRange);

  const shouldSync = !onChange;
  useEffect(() => {
    if (shouldSync) {
      setUncontrolledRange(controlledRange);
    }
  }, [controlledRange, shouldSync]);

  const selectedRange = onChange ? controlledRange : uncontrolledRange;

  return (
    <DayPicker
      showOutsideDays
      animate
      {...rest}
      selected={selectedRange}
      onSelect={(
        _: DateRange | undefined,
        triggerDate: Date,
        modifiers: Modifiers,
        event: ReactMouseEvent | ReactKeyboardEvent,
      ) => {
        const nextRange = getNextRestartingRange(triggerDate, selectedRange, props);

        if (!onChange) {
          setUncontrolledRange(nextRange);
        }

        (onChange as RangeProps["onChange"])?.(nextRange, triggerDate, modifiers, event);

        if (nextRange?.from && nextRange.to) {
          onRangeComplete?.({ from: nextRange.from, to: nextRange.to });
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
        ...rest.components,
      }}
    />
  );
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
  if (isRangePickerProps(props) && props.rangeSelectionBehavior === "restart") {
    return (
      <RestartingRangePicker
        className={className}
        classNames={classNames}
        onChange={onChange as RangeProps["onChange"]}
        {...props}
      />
    );
  }

  // For range pickers with default behavior, wrap onSelect to fire onRangeComplete
  let onSelect: DatePickerProps["onChange"] = onChange;
  if (isRangePickerProps(props) && props.onRangeComplete) {
    const { onRangeComplete, rangeSelectionBehavior: _, ...rangeRest } = props;
    const rangeOnChange = onChange as RangeProps["onChange"];
    onSelect = ((
      selected: DateRange | undefined,
      triggerDate: Date,
      modifiers: Modifiers,
      event: ReactMouseEvent | ReactKeyboardEvent,
    ) => {
      rangeOnChange?.(selected, triggerDate, modifiers, event);
      if (selected?.from && selected.to) {
        onRangeComplete({ from: selected.from, to: selected.to });
      }
    }) as DatePickerProps["onChange"];
    props = rangeRest as typeof props;
  }

  // Strip range-specific props that DayPicker doesn't understand
  const { onRangeComplete: _orc, rangeSelectionBehavior: _rsb, ...dayPickerProps } = props;

  return (
    <DayPicker
      showOutsideDays
      animate
      {...dayPickerProps}
      onSelect={onSelect as never}
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
        ...dayPickerProps.components,
      }}
    />
  );
}

DatePicker.displayName = "DatePicker";
