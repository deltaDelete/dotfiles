return {
    { "shapeoflambda/dark-purple.vim" },
    {
        "lambdalisue/suda.vim",
        init = function()
            vim.g.suda_smart_edit = 1
        end,
    },
    {
        "echasnovski/mini.comment",
        version = "*",
    },
    {
        "tomasiser/vim-code-dark",
        init = function()
            vim.g.codedark_modern = 1
            vim.g.codedark_transparent = 0
            vim.g.codedark_italics = 1
        end,
    },
    {
        "lervag/vimtex",
        init = function()
            vim.g.vimtex_compiler_method = "latexmk"
        end,
    },
    {
        "doums/darcula",
    },

    {
        "LazyVim/LazyVim",
        opts = {
            -- colorscheme = "codedark",
            colorscheme = "darcula",
        },
    },

    {
        "akinsho/bufferline.nvim",
        opts = {
            always_show_bufferline = true,
        },
    },
}
