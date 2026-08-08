#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
CLI="$SCRIPT_DIR/.harness/.huajuan.mjs"
MARKER="$SCRIPT_DIR/.harness/.huajuan.json"

if [ ! -f "$CLI" ] || [ ! -f "$MARKER" ]; then
  printf '%s\n' '初始化器当前目录缺少完整的 .harness。请保持 Release 文件结构不变。' >&2
  exit 1
fi

NODE=$(command -v node 2>/dev/null || true)
if [ -z "$NODE" ]; then
  for candidate in /opt/homebrew/bin/node /usr/local/bin/node "$HOME/.volta/bin/node" "$HOME/.asdf/shims/node"; do
    if [ -x "$candidate" ]; then NODE=$candidate; break; fi
  done
fi
if [ -z "$NODE" ] || [ ! -x "$NODE" ]; then
  printf '%s\n' '未找到 Node.js 20+。请安装后重试。' >&2
  printf '按回车关闭…'
  IFS= read -r _unused || true
  exit 1
fi

NODE_MAJOR=$($NODE -p "Number(process.versions.node.split('.')[0])" 2>/dev/null || printf '0')
case "$NODE_MAJOR" in
  ''|*[!0-9]*) NODE_MAJOR=0 ;;
esac
if [ "$NODE_MAJOR" -lt 20 ]; then
  printf '%s\n' 'Node.js 版本过低，需要 20 或更高版本。' >&2
  printf '按回车关闭…'
  IFS= read -r _unused || true
  exit 1
fi

if [ -n "${HUAJUAN_INIT_ANSWERS_FILE:-}" ]; then
  "$NODE" "$CLI" install-parent --answers "$HUAJUAN_INIT_ANSWERS_FILE"
else
  "$NODE" "$CLI" install-parent
fi

if [ "${HUAJUAN_NO_PAUSE:-0}" != "1" ] && [ -t 0 ]; then
  printf '\n按回车关闭…'
  IFS= read -r _unused || true
fi
