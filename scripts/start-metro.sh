#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# If there is an existing Metro instance running 8081, first attempt to shut it down properly
if lsof -ti:8081 >/dev/null 2>&1; then
	lsof -ti:8081 | xargs kill >/dev/null 2>&1 || true
	sleep 1
fi

# If it's still running, force it to close only then
if lsof -ti:8081 >/dev/null 2>&1; then
	lsof -ti:8081 | xargs kill -9 >/dev/null 2>&1 || true
fi

# Clean up only when the Watchman state is corrupted
watchman watch-del "$PROJECT_ROOT" >/dev/null 2>&1 || true
watchman watch-project "$PROJECT_ROOT" >/dev/null

exec npx react-native start --reset-cache
