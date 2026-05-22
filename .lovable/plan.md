# Double the hero logo tile size

Change `BusinessDetailHero.tsx` so the `BusinessIcon` size prop goes from `80` to `160` (double). Keep the rounded-2xl tile styling and existing layout — the hero row already flex-wraps, so the larger logo will sit beside the heading on desktop and stack above on mobile.

No other components change. `BusinessIcon` already requests a 256px favicon and uses `object-contain`, so it will render crisply at the larger size.
