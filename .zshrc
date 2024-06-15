# Path to your oh-my-zsh installation.
export ZSH="$HOME/.oh-my-zsh"

ZSH_THEME="ys"

# Uncomment the following line if pasting URLs and other text is messed up.
# DISABLE_MAGIC_FUNCTIONS="true"

# Uncomment the following line to enable command auto-correction.
# ENABLE_CORRECTION="true"

plugins=(
	git
	k
	zsh-autosuggestions
	# zsh-syntax-highlighting
    F-Sy-H
	dotnet
)

fpath+=${ZSH_CUSTOM:-${ZSH:-~/.oh-my-zsh}/custom}/plugings/zsh-completions/src

source $ZSH/oh-my-zsh.sh

source /usr/share/doc/pkgfile/command-not-found.zsh

[ -f $HOME/.local/bin/.imgurs_completions.zsh ] && source $HOME/.local/bin/.imgurs_completions.zsh
___MY_VMOPTIONS_SHELL_FILE="${HOME}/.jetbrains.vmoptions.sh"; if [ -f "${___MY_VMOPTIONS_SHELL_FILE}" ]; then . "${___MY_VMOPTIONS_SHELL_FILE}"; fi

alias vim=nvim

# pnpm
export PNPM_HOME="/home/delta/.local/share/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac
# pnpm end

export MANPAGER="bat -l man -p"
alias ls="eza"
alias rm="rmtrash"

source /usr/share/nvm/init-nvm.sh

[[ $TERMINAL_EMULATOR == "JetBrains-JediTerm" ]] && alias ls='ls --color'

# find-the-command
[[ -f /usr/share/doc/find-the-command/ftc.zsh ]] && source /usr/share/doc/find-the-command/ftc.zsh
