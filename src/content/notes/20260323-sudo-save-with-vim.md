---
date: 2026-03-23 17:05:58
last edited: 2026-03-23 17:06:14
title: Sudo Save a file as Regular User
slug: sudo-save-with-vim
cover-image: ./20260323-sudo-save-with-vim/cover-image.png
---
## The Problem

Know that feeling when you incorrectly open a file as a regular user but you just can't damn save the file because it's owned by root?

![Saving file with vim fails as regular user](20260323-sudo-save-with-vim/saving-file-with-vim-fails.mp4)
## The Simple Fix

Too late in my life I realised there is a very simple fix, it's simply to `sudo dd of` the output file like so:

```vim
:w !sudo dd of=%
```

`%` is simply the vim register that expands to the currently opened file.

![Saving file with vim suceeds](20260323-sudo-save-with-vim/saving-file-with-vim-sucessds.mp4)
This pretty much works everywhere, even with regular `vi`.

The other alternative is to use `tee` as:

```vim
:w !sudo tee %
```

But that has the disadvantage of all printing the contents of the file to `STDOUT`.