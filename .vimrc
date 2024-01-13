set nocompatible
filetype off

set rtp+=~/.vim/bundle/Vundle.vim
call vundle#begin()

Plugin 'VundleVim/Vundle.vim'
Plugin 'tomasiser/vim-code-dark'
Plugin 'lambdalisue/suda.vim'
Plugin 'williamboman/mason.nvim'
Plugin 'williamboman/mason-lspconfig.nvim'
Plugin 'neovim/nvim-lspconfig'
Plugin 'simrat39/rust-tools.nvim'
Plugin 'vimsence/vimsence'
Plugin 'nvim-lua/plenary.nvim'
Plugin 'jose-elias-alvarez/null-ls.nvim'
Plugin 'zioroboco/nu-ls.nvim'

call vundle#end()

filetype plugin indent on

colorscheme codedark

set expandtab
set shiftwidth=4
set smartindent
set mouse=v
set number
set cursorline

