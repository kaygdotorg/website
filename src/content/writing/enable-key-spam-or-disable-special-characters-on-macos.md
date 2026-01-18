---
title: "Enable Key Spam or Disable Special Characters on MacOS"
description: "❓ What?

MacOS has this behaviour where if you hold a key, such as in my case, holding k to move up in VSCode, a special character popup appears where you can choose an alternative character for the key pressed.
























0:00

/0:13


1×


















🎤 The fix

defaults write -g ApplePressAndHoldEnabled -bool false


Run the command in your terminal app of choice, close/reopen app or logout/login or simply reboot. Since I am an uptime masochist, I simply close and reopen app"
date: "2024-04-22T13:20:00.000+05:30"
last edited: "2025-09-03T12:02:52.000+05:30"
tags:
  - "Blog"
  - "MacOS"
draft: true
---

## ❓ What?

MacOS has this behaviour where if you hold a key, such as in my case, holding `k` to move up in VSCode, a special character popup appears where you can choose an alternative character for the key pressed.

0:00

/0:13

 1× 

## 🎤 The fix

```bash
defaults write -g ApplePressAndHoldEnabled -bool false
```

Run the command in your terminal app of choice, close/reopen app or logout/login or simply reboot. Since I am an uptime masochist, I simply close and reopen apps.

I am not sure if a help page exists inside MacOS to query the different values of the keys for `defaults`. However, in my search, I found this page which serves as an alternative: [https://macos-defaults.com/](https://macos-defaults.com/?ref=kayg.org)

## 👓 References

[https://macos-defaults.com/keyboard/applepressandholdenabled.html](https://macos-defaults.com/keyboard/applepressandholdenabled.html?ref=kayg.org)

[https://superuser.com/questions/363252/how-to-enable-keyboard-repeat-on-a-mac](https://superuser.com/questions/363252/how-to-enable-keyboard-repeat-on-a-mac?ref=kayg.org)