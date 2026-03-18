import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ColorPicker } from "./color-picker";

describe("ColorPicker", () => {
  it("renders current hex value by default", () => {
    render(<ColorPicker value="#336699" />);
    expect(screen.getByText("#336699")).toBeTruthy();
  });

  it("commits hex input on Enter", () => {
    const onChange = vi.fn();
    render(<ColorPicker value="#336699" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button"));
    const input = screen.getByLabelText("Hex color value");

    fireEvent.change(input, { target: { value: "#ffffff" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith("#FFFFFF");
  });

  it("syncs the trigger value when the controlled value changes externally", () => {
    const { rerender } = render(<ColorPicker value="#336699" />);

    expect(screen.getByText("#336699")).toBeTruthy();

    rerender(<ColorPicker value="#ff8800" />);

    expect(screen.getByText("#FF8800")).toBeTruthy();
    expect(screen.queryByText("#336699")).toBeNull();
  });

  it("keeps hex commit output normalized after switching format", async () => {
    const onChange = vi.fn();
    render(<ColorPicker value="#336699" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button"));

    const formatSelect = screen.getByRole("combobox");

    await act(async () => {
      fireEvent.mouseDown(formatSelect);
    });

    fireEvent.click(await screen.findByText("RGB"));

    const input = screen.getByLabelText("Hex color value");
    fireEvent.change(input, { target: { value: "#ff8800" } });
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith("#FF8800");
  });

  it("hides trigger hex label when showValue is false", () => {
    render(<ColorPicker value="#123abc" showValue={false} />);
    expect(screen.queryByText("#123abc")).toBeNull();
  });

  it("renders a square swatch-only trigger without stretching to full width", () => {
    render(<ColorPicker value="#123abc" showValue={false} />);

    const trigger = screen.getByRole("button");
    const swatch = screen.getByRole("img", { name: /blue/i });

    expect(trigger.className).not.toContain("w-full");
    expect(swatch.className).toContain("size-6");
    expect(swatch.className).not.toContain("w-full");
  });

  it("respects disabled state on trigger", () => {
    render(<ColorPicker value="#123abc" disabled />);
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
  });
});
