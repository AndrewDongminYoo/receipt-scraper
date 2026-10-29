# Receipt scraper compatible maintenance

Refresh supported dependencies and selected quality tools without changing the React Native 0.84.1 runtime family or product behavior.
Patch vulnerable transitive packages within their requested major families and explicitly retain only vulnerabilities with no fixed release.
Preserve React/react-test-renderer 19.2.3, Reanimated/worklets compatibility, Babel 7, generated NativeWind declarations, native source/assets and Dependabot ownership.
TypeScript 6 is a candidate only after real compiler verification; do not move ambient CSS declarations without a failing reproduction.

## Acceptance

1. Existing staged Trunk changes are preserved as the starting input; selected tools are current and Pinact 4.1.1 exposes lint and upgrade.
2. CI-equivalent Yarn Classic 1.22.22 frozen installation, project lint and Jest pass; any typecheck addition must pass the real project.
3. OSV scans the resolved lock identities, patched packages retain parent-major compatibility, and every remaining no-patch exception has advisory evidence.
4. Run all enabled Trunk checks with --all --no-fix and verify actual scanner findings reach the consumer.
5. Reconcile affected README/CLAUDE/AGENTS and direct documentation, complete calibrated local review, and obtain publication approval.

## Limits

No native runtime migration, UI work, deployment, publication, ruleset/Dependabot edits or bot-PR modification is included.
No device or native-build result is implied by JS and mock-based gates.
