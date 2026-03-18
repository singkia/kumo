import { ColorPicker } from "@cloudflare/kumo";
import { useState } from "react";

/**
 * Basic hex-in, hex-out color selection with the default trigger display.
 */
export function ColorPickerBasicDemo() {
  const [value, setValue] = useState("#F48120");

  return (
    <div className="flex w-full flex-col items-center">
      <ColorPicker value={value} onChange={setValue} />
    </div>
  );
}

/**
 * Controlled usage where the selected hex value also drives external UI.
 */
export function ColorPickerControlledDemo() {
  const [value, setValue] = useState("#1D4ED8");

  return (
    <div className="flex w-full max-w-sm flex-col items-center space-y-3">
      <ColorPicker value={value} onChange={setValue} />
      <div className="inline-flex items-center gap-3 rounded-lg border border-kumo-line bg-kumo-elevated p-3">
        <div
          className="size-8 rounded-md ring ring-kumo-line"
          style={{ backgroundColor: value }}
        />
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-kumo-subtle">
            Selected value
          </p>
          <code className="font-mono text-sm text-kumo-default">{value}</code>
        </div>
      </div>
    </div>
  );
}

/**
 * Swatch-only trigger mode keeps the popover while hiding the hex label.
 */
export function ColorPickerSwatchOnlyDemo() {
  const [value, setValue] = useState("#16A34A");

  return (
    <div className="flex w-full flex-col items-center">
      <ColorPicker value={value} onChange={setValue} showValue={false} />
    </div>
  );
}

/**
 * Disabled state prevents opening the popover and editing the color.
 */
export function ColorPickerDisabledDemo() {
  return (
    <div className="flex w-full flex-col items-center">
      <ColorPicker value="#94A3B8" disabled />
    </div>
  );
}

/**
 * Format switching affects the panel inputs, while committed output remains normalized hex.
 */
export function ColorPickerFormatDemo() {
  const [value, setValue] = useState("#7C3AED");

  return (
    <div className="flex w-full max-w-sm flex-col items-center space-y-3">
      <ColorPicker value={value} onChange={setValue} />
      <div className="inline-flex flex-col rounded-lg border border-kumo-line bg-kumo-elevated px-3 py-2">
        <span className="text-xs uppercase tracking-wide text-kumo-subtle">
          Last committed hex
        </span>
        <div className="mt-1 font-mono text-sm text-kumo-default">{value}</div>
      </div>
    </div>
  );
}
