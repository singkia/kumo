---
"@cloudflare/kumo": patch
---

fix(Checkbox): use Proxy instead of Object.assign to avoid crashing on read-only Event.target

The deprecated `onChange` handler used `Object.assign(event, { target: ... })` which throws
`TypeError: Cannot set property target of #<Event> which has only a getter` because `Event.target`
is a read-only getter property. Replaced with `Object.create` to create a new object that shadows
the prototype getter with an own `target` property.

Fixes #409
