---
"@cloudflare/kumo": patch
---

Add an opt-in `rangeSelectionBehavior="restart"` mode to `DatePicker` so popover range pickers can restart from the next click after a completed range instead of mutating the previous selection. Also add `onRangeComplete` to support closing the popover when the second date confirms the range, and update the range picker docs demos to use the new committed-vs-draft pattern.
