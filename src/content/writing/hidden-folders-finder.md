---
type:
  - Permanent Note
tags:
  - macos
  - macos/defaults
  - macos/finder
date: 2025-07-29 22:31:14
last edited: 2026-01-18 15:33:12
title: Hidden Folders in Finder
---
## ❓ What?

Hidden folders are disabled by default on MacOS, which means it won't see any files and folders starting a `.` (period/dot). 

## ❔ Why?

Sometimes when I want to open a new folder from VSCode, I am at a loss on how to proceed with opening a config file which typically resides in `~/.config`.

![hidden-folders-in-finder-1](<./hidden-folders-finder/hidden-folders-in-finder-1.png>)

## 🎤 How?

Press `CMD + SHIFT + .`

![hidden-folders-in-macos-2](<./hidden-folders-finder/hidden-folders-in-macos-2.mp4>)

Of course, this can also be toggled globally with a `defaults` command, like when enabling [key spam](<./key-spam-macos.md>).
## 👓 References

https://apple.stackexchange.com/a/402026

https://macos-defaults.com/finder/appleshowallfiles.html