local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git",
    "clone",
    "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable", -- latest stable release
    lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

require("lazy").setup({
    "tomasiser/vim-code-dark",
    "lambdalisue/suda.vim",
    "vimsence/vimsence",
    "nvim-lua/plenary.nvim",
    "jose-elias-alvarez/null-ls.nvim",
    "zioroboco/nu-ls.nvim",
    {
        "nvim-treesitter/nvim-treesitter",
        config = function()
            -- setup treesitter with config
        end,
        dependencies = {
            -- NOTE: additional parser
            { "nushell/tree-sitter-nu" },
        },
        build = ":TSUpdate",
    },
})

-- require("mason").setup()
-- require("mason-lspconfig").setup()

-- local rt = require("rust-tools")

--[=====[ rt.setup({
    server = {
        on_attach = function(_, bufnr)
            -- Hover actions 
            vim.keymap.set("n", "<C-space>", rt.hover_actions.hover_actions, { buffer = bufnr })
            -- Code action groups
            vim.keymap.set("n", "<Leader>a", rt.code_action_group.code_action_group, { buffer = bufnr })
        end,
    },
})
--]=====]

require("null-ls").setup({
  sources = {
    require("nu-ls"),
  },
})

vim.filetype.add({
  extension = {
    nu = "nu",
  },
})

vim.filetype.add({
  pattern = {
    [".*"] = {
      priority = -math.huge,
      function(path, bufnr)
        local content = vim.filetype.getlines(bufnr, 1)
        if vim.filetype.matchregex(content, [[^#!/usr/bin/env nu]]) then
          return "nu"
        end
      end,
    },
  },
})
