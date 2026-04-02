# Task completion checklist

- Run `yarn lint` and `yarn test` before claiming code work is complete when those checks are relevant.
- For native dependency changes, run `cd ios && bundle exec pod install` and re-verify iOS.
- Keep changes aligned with BLUEPRINT.md implementation order and do not introduce planned dependencies ahead of schedule.
- Preserve minimal structure and state-management rules from BLUEPRINT.md, AGENTS.md, and CLAUDE.md.
- Verify platform-specific changes on the relevant platform when possible.
- Update documentation when project state or working rules materially change.
