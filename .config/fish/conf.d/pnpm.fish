#! /usr/bin/env fish
export PNPM_HOME="$HOME/.local/share/pnpm"

if not contains $PNPM_HOME $PATH
    set -gxa PATH $PNPM_HOME
end
