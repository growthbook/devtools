# SDK health-check test page

A self-contained page for exercising the DevTools SDK tab without a real
GrowthBook account.

```sh
yarn test-page   # copies the SDK bundle in, serves on :8899
```

Then load `dist/` as an unpacked extension and open http://localhost:8899.

`apiHost` points at this same static server, and `api/features/local-test` is
a static payload, so `GET /api/features/local-test` returns 200 — which is
exactly the probe DevTools uses to decide "Connected". No API key needed.

## Switches

| URL         | Tracking Callback row |
| ----------- | --------------------- |
| `?params=2` | Found (2 params)      |
| `?params=3` | Found (3 params)      |
| `?params=1` | Found (issues)        |
| `?params=4` | Found (issues)        |

Add `&ofu=1` (or click the toggle) to supply an `onFeatureUsage` callback and
flip the "On Feature Usage Callback" row to Yes.

Note: the SDK dedupes feature usage by value, so re-evaluating a feature to the
same value fires `onFeatureUsage` only once.
