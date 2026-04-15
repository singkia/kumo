import { describe, expect, it, vi } from "vitest";
import { createLegacyCheckboxChangeEvent } from "./checkbox";

describe("Checkbox", () => {
  it("preserves native event APIs on deprecated onChange callbacks", () => {
    const nativeEvent = new MouseEvent("click", { cancelable: true });
    const onChange = vi.fn((event: React.ChangeEvent<HTMLInputElement>) => {
      expect(event.target.checked).toBe(true);
      expect(event.currentTarget.checked).toBe(true);
      expect(event instanceof Event).toBe(true);

      event.preventDefault();

      expect(event.defaultPrevented).toBe(true);
      expect(typeof event.timeStamp).toBe("number");
    });

    const event = createLegacyCheckboxChangeEvent(nativeEvent, true);

    expect(() => onChange(event)).not.toThrow();
    expect(onChange).toHaveBeenCalledWith(event);
  });
});
