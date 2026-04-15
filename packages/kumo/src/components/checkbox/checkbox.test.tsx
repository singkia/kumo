import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("preserves native event APIs on deprecated onChange callbacks", () => {
    const events: Array<React.ChangeEvent<HTMLInputElement>> = [];

    render(
      <Checkbox
        label="Accept terms"
        onChange={(event) => {
          events.push(event);
        }}
      />,
    );

    expect(() => fireEvent.click(screen.getByRole("checkbox"))).not.toThrow();
    expect(events.length).toBeGreaterThan(0);

    const event = events[0];

    expect(event).toBeDefined();
    expect(event.target.checked).toBe(true);
    expect(event.currentTarget.checked).toBe(true);
    expect(event instanceof Event).toBe(true);

    expect(() => event.preventDefault()).not.toThrow();
    expect(event.defaultPrevented).toBe(true);
    expect(typeof event.timeStamp).toBe("number");
  });
});
