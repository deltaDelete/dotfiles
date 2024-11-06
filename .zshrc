
if [[ -v OH_MY_ZSH_ENABLED ]]; then
    Path to your oh-my-zsh installation.
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
        eza)

    # FPATH+=${ZSH_CUSTOM:-${ZSH:-~/.oh-my-zsh}/custom}/plugings/zsh-completions/src

    source $ZSH/oh-my-zsh.sh
else
    source ~/.zinitrc
fi


# BINDS
bindkey -r '^K'
bindkey '^K' kill-whole-line
bindkey -r '^U'dd
bindkey '^U' kill-line
bindkey '^H' backward-kill-word

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

# export MANPAGER="bat -l man -p"
export LESS_TERMCAP_mb=$'\e[1;31m'     # begin bold
export LESS_TERMCAP_md=$'\e[1;33m'     # begin blink
export LESS_TERMCAP_so=$'\e[01;44;37m' # begin reverse video
export LESS_TERMCAP_us=$'\e[01;37m'    # begin underline
export LESS_TERMCAP_me=$'\e[0m'        # reset bold/blink
export LESS_TERMCAP_se=$'\e[0m'        # reset reverse video
export LESS_TERMCAP_ue=$'\e[0m'        # reset underline
export GROFF_NO_SGR=1
export LESS="-R --use-color"
export MANPAGER='less -s -M +Gg'

export EZA_ICONS_AUTO=''
alias ls="eza"
alias rm="rmtrash"

source /usr/share/nvm/init-nvm.sh

[[ $TERMINAL_EMULATOR == "JetBrains-JediTerm" ]] && alias ls='ls --color'

# find-the-command
[[ -f /usr/share/doc/find-the-command/ftc.zsh ]] && source /usr/share/doc/find-the-command/ftc.zsh

#THIS MUST BE AT THE END OF THE FILE FOR SDKMAN TO WORK!!!
export SDKMAN_DIR="$HOME/.sdkman"
[[ -s "$HOME/.sdkman/bin/sdkman-init.sh" ]] && source "$HOME/.sdkman/bin/sdkman-init.sh"

