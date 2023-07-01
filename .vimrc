set nocompatible
filetype off

set rtp+=~/.vim/bundle/Vundle.vim
call vundle#begin()

Plugin 'VundleVim/Vundle.vim'
Plugin 'tomasiser/vim-code-dark'
Plugin 'lambdalisue/suda.vim'

call vundle#end()
filetype plugin indent on

colorscheme codedark

set expandtab
set shiftwidth=4
set smartindent
set mouse=v
