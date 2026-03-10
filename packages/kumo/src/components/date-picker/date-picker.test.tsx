/**
 * [INPUT]: 依赖 testing-library 与 kumo 的 DatePicker/Popover/Button 组件，验证 rangeSelectionBehavior 的交互语义
 * [OUTPUT]: 对外提供 DatePicker range 模式的回归测试，覆盖 restart 草稿流与 popover 关闭时机
 * [POS]: components/date-picker 的行为护栏，防止第三击悄悄篡改已确认范围
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/button";
import { DatePicker } from "@/components/date-picker";
import { Popover } from "@/components/popover";

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatRange(range: DateRange | undefined) {
  if (!range?.from) {
    return "none";
  }

  const from = formatDate(range.from);
  const to = range.to ? formatDate(range.to) : "...";
  return `${from} -> ${to}`;
}

function findDayButton(label: RegExp) {
  return screen.getByRole("button", { name: label });
}

function RestartingRangeHarness() {
  const [range, setRange] = useState<DateRange | undefined>();

  return (
    <div>
      <DatePicker
        mode="range"
        selected={range}
        onChange={setRange}
        rangeSelectionBehavior="restart"
        defaultMonth={new Date(2026, 2, 1)}
        numberOfMonths={2}
      />
      <output data-testid="range-value">{formatRange(range)}</output>
    </div>
  );
}

function RangePopoverHarness() {
  const [open, setOpen] = useState(false);
  const [committedRange, setCommittedRange] = useState<DateRange | undefined>();
  const [draftRange, setDraftRange] = useState<DateRange | undefined>();

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        setDraftRange(committedRange);
      }}
    >
      <Popover.Trigger asChild>
        <Button>{formatRange(committedRange)}</Button>
      </Popover.Trigger>
      <Popover.Content className="p-3">
        <DatePicker
          mode="range"
          selected={draftRange}
          onChange={setDraftRange}
          onRangeComplete={(nextRange) => {
            setCommittedRange(nextRange);
            setOpen(false);
          }}
          rangeSelectionBehavior="restart"
          defaultMonth={new Date(2026, 2, 1)}
          numberOfMonths={2}
        />
      </Popover.Content>
    </Popover>
  );
}

describe("DatePicker", () => {
  it("restarts range selection from the next click after a completed range", async () => {
    const user = userEvent.setup();

    render(<RestartingRangeHarness />);

    await user.click(findDayButton(/Monday, March 9th, 2026/i));
    expect(screen.getByTestId("range-value").textContent).toBe(
      "2026-03-09 -> ...",
    );

    await user.click(findDayButton(/Thursday, March 12th, 2026/i));
    expect(screen.getByTestId("range-value").textContent).toBe(
      "2026-03-09 -> 2026-03-12",
    );

    await user.click(findDayButton(/Friday, March 20th, 2026/i));
    expect(screen.getByTestId("range-value").textContent).toBe(
      "2026-03-20 -> ...",
    );
  });

  it("supports popover range pickers that close on completion while preserving the committed range", async () => {
    const user = userEvent.setup();

    render(<RangePopoverHarness />);

    await user.click(screen.getByRole("button", { name: "none" }));
    await user.click(findDayButton(/Tuesday, March 10th, 2026/i));
    await user.click(findDayButton(/Sunday, March 15th, 2026/i));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    expect(
      screen.getByRole("button", { name: "2026-03-10 -> 2026-03-15" }),
    ).not.toBeNull();

    await user.click(
      screen.getByRole("button", { name: "2026-03-10 -> 2026-03-15" }),
    );
    await user.click(findDayButton(/Friday, March 20th, 2026/i));

    expect(
      screen.getByRole("button", { name: "2026-03-10 -> 2026-03-15" }),
    ).not.toBeNull();
    expect(
      screen.getByRole("button", { name: /Friday, March 20th, 2026/i }),
    ).not.toBeNull();
  });
});
