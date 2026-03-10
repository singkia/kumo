"use client";

/**
 * [INPUT]: 依赖 react 的 useState，依赖 @cloudflare/kumo 的 DatePicker/Popover/Button 组合能力
 * [OUTPUT]: 对外提供 DatePicker 文档页的所有 demo 组件
 * [POS]: kumo-docs-astro/components/demos 的 DatePicker 示例集合，展示推荐交互而不是底层原始状态机
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from "react";
import { DatePicker, Popover, Button, type DateRange } from "@cloudflare/kumo";
import { CalendarDotsIcon } from "@phosphor-icons/react";

function formatRange(range: DateRange | undefined) {
  if (!range?.from) return "Select dates";
  if (!range.to) return range.from.toLocaleDateString();
  return `${range.from.toLocaleDateString()} – ${range.to.toLocaleDateString()}`;
}

/**
 * Single date selection.
 */
export function DatePickerSingleDemo() {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <div className="flex flex-col gap-4">
      <DatePicker mode="single" selected={date} onChange={d => {
        if (d) {
          setDate(d);
        }
      }} />
      <p className="text-sm text-kumo-subtle">
        Selected: {date ? date.toLocaleDateString() : "None"}
      </p>
    </div>
  );
}

/**
 * Multiple date selection with a maximum of 5 dates.
 */
export function DatePickerMultipleDemo() {
  const [dates, setDates] = useState<Date[] | undefined>();

  return (
    <div className="flex flex-col gap-4">
      <DatePicker
        mode="multiple"
        selected={dates}
        onChange={setDates}
        max={5}
      />
      <p className="text-sm text-kumo-subtle">
        Selected: {dates?.length ?? 0} date(s)
      </p>
    </div>
  );
}

/**
 * Date range selection with two months displayed.
 */
export function DatePickerRangeDemo() {
  const [range, setRange] = useState<DateRange | undefined>();

  return (
    <div className="flex flex-col gap-4">
      <DatePicker
        mode="range"
        selected={range}
        onChange={setRange}
        numberOfMonths={2}
      />
      <p className="text-sm text-kumo-subtle">
        Range:{" "}
        {range?.from
          ? `${range.from.toLocaleDateString()} - ${range.to?.toLocaleDateString() ?? "..."}`
          : "None"}
      </p>
    </div>
  );
}

/**
 * Date range with minimum 3 nights and maximum 7 nights.
 */
export function DatePickerRangeMinMaxDemo() {
  const [range, setRange] = useState<DateRange | undefined>();

  return (
    <div className="flex flex-col gap-4">
      <DatePicker
        mode="range"
        selected={range}
        onChange={setRange}
        min={3}
        max={7}
        footer={
          <span className="text-xs text-kumo-subtle">Select 3-7 nights</span>
        }
      />
    </div>
  );
}

/**
 * Date picker composed with a Popover for dropdown behavior.
 */
export function DatePickerPopoverDemo() {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="outline" icon={CalendarDotsIcon}>
          {date ? date.toLocaleDateString() : "Pick a date"}
        </Button>
      </Popover.Trigger>
      <Popover.Content className="p-3">
        <DatePicker mode="single" selected={date} onChange={setDate} />
      </Popover.Content>
    </Popover>
  );
}

/**
 * Date range picker composed with a Popover for dropdown behavior.
 */
export function DatePickerRangePopoverDemo() {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>();
  const [draftRange, setDraftRange] = useState<DateRange | undefined>();

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        setDraftRange(range);
      }}
    >
      <Popover.Trigger asChild>
        <Button variant="outline" icon={CalendarDotsIcon}>
          {formatRange(range)}
        </Button>
      </Popover.Trigger>
      <Popover.Content className="p-3">
        <DatePicker
          mode="range"
          selected={draftRange}
          onChange={setDraftRange}
          onRangeComplete={(nextRange) => {
            setRange(nextRange);
            setOpen(false);
          }}
          rangeSelectionBehavior="restart"
          numberOfMonths={2}
        />
      </Popover.Content>
    </Popover>
  );
}

/**
 * Date range picker with preset options in a popover.
 */
export function DatePickerRangeWithPresetsDemo() {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>();
  const [draftRange, setDraftRange] = useState<DateRange | undefined>();
  const [month, setMonth] = useState<Date>(new Date());

  const today = new Date();

  const presets = [
    {
      label: "Today",
      range: { from: today, to: today },
    },
    {
      label: "Last 7 days",
      range: {
        from: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
        to: today,
      },
    },
    {
      label: "Last 30 days",
      range: {
        from: new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000),
        to: today,
      },
    },
    {
      label: "Last 90 days",
      range: {
        from: new Date(today.getTime() - 89 * 24 * 60 * 60 * 1000),
        to: today,
      },
    },
    {
      label: "This month",
      range: {
        from: new Date(today.getFullYear(), today.getMonth(), 1),
        to: new Date(today.getFullYear(), today.getMonth() + 1, 0),
      },
    },
    {
      label: "Last month",
      range: {
        from: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        to: new Date(today.getFullYear(), today.getMonth(), 0),
      },
    },
  ];

  const handlePresetClick = (preset: { range: DateRange }) => {
    setRange(preset.range);
    setDraftRange(preset.range);
    setOpen(false);
    // Navigate calendar to show the start of the range
    if (preset.range.from) {
      setMonth(preset.range.from);
    }
  };

  const isPresetActive = (preset: { range: DateRange }) => {
    if (!range?.from || !range?.to || !preset.range.from || !preset.range.to)
      return false;
    // Compare dates only (ignore time)
    const sameFrom =
      range.from.toDateString() === preset.range.from.toDateString();
    const sameTo = range.to.toDateString() === preset.range.to.toDateString();
    return sameFrom && sameTo;
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        setDraftRange(range);
        if (range?.from) {
          setMonth(range.from);
        }
      }}
    >
      <Popover.Trigger asChild>
        <Button variant="outline" icon={CalendarDotsIcon}>
          {formatRange(range)}
        </Button>
      </Popover.Trigger>
      <Popover.Content className="p-0">
        <div className="flex">
          <div className="flex flex-col gap-1 border-r border-kumo-line p-2 text-sm">
            {presets.map((preset) => {
              const isActive = isPresetActive(preset);
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className={`rounded-md px-3 py-1.5 text-left whitespace-nowrap ${isActive
                    ? "bg-kumo-bg-inverse text-kumo-text-inverse"
                    : "text-kumo-strong hover:bg-kumo-control"
                    }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
          <div className="p-3">
            <DatePicker
              mode="range"
              selected={draftRange}
              onChange={setDraftRange}
              onRangeComplete={(nextRange) => {
                setRange(nextRange);
                setOpen(false);
              }}
              rangeSelectionBehavior="restart"
              month={month}
              onMonthChange={setMonth}
              numberOfMonths={2}
            />
          </div>
        </div>
      </Popover.Content>
    </Popover>
  );
}

/**
 * Date picker with disabled dates and a footer showing usage limits.
 */
export function DatePickerDisabledWithFooterDemo() {
  const [dates, setDates] = useState<Date[] | undefined>();
  const today = new Date();

  // Example: some dates are already used/unavailable
  const unavailableDates = [
    new Date(today.getFullYear(), today.getMonth(), 5),
    new Date(today.getFullYear(), today.getMonth(), 12),
    new Date(today.getFullYear(), today.getMonth(), 18),
    new Date(today.getFullYear(), today.getMonth(), 25),
  ];

  const selectedCount = dates?.length ?? 0;
  const maxDays = 5;

  return (
    <DatePicker
      mode="multiple"
      selected={dates}
      onChange={setDates}
      max={maxDays}
      disabled={unavailableDates}
      fixedWeeks
      footer={
        <p className="text-xs text-kumo-subtle pt-2 w-full">
          {selectedCount}/{maxDays} days selected. Grayed dates are unavailable.
        </p>
      }
    />
  );
}
