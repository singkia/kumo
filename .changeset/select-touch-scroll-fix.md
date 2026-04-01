---
"@cloudflare/kumo": patch
---

Select: restore scrollable popup behavior for touch-open menus

- add the missing popup scroll container semantics on `Select`
- keep the visual styling unchanged while restoring constrained mobile scrolling
- add a regression test that fails when the popup falls back to `overflow-hidden`
