---
date: 2024-03-08 00:03:00
last-edited: 2026-01-19 22:11:12
title: Firefox Profile Downgrade
---
## ❓ What?

  Sometimes it's useful to test stable versions of firefox as the beta and nightly versions may have some bugs that haven't made their way to stable yet. One such bug is the one I encountered today, an hour or so ago while watching the [podcast between Henselmans and Contreras](https://www.youtube.com/watch?v=KoGDWboi46U) where the video would skip frames randomly but the audio would play fine, and sometimes the audio would skip too. This happened on a brand new profile too, with no add-ons. However, I could not reproduce this on firefox stable (123.0.1 (64-bit), MacOS Sonoma 14.3.1).

I have reported the bug here: https://bugzilla.mozilla.org/show_bug.cgi?id=1650584#c3

## 🎤 How?

  If one tries to open the firefox profile (created on a newer version) directly on a previous version, firefox simply gets stuck trying to open it. The key is the flag: `--allow-downgrade`.

1. Open older firefox. It will open a new profile by default.
2. Make the preferred profile the default one by going to `about:profiles` and selecting "Set as default profile"
3. Close firefox completely, make sure it's not running through Activity Monitor.
4. Start firefox via command-line this time as follows: `/Applications/Firefox.app/Contents/MacOS/firefox --allow-downgrade`
5. Your preferred profile should open without a hitch!

The older version of firefox will try to access the application password created by the new version so you will get a prompt of Firefox asking for keychain access. Simply adding the application to always have access to this particular item will be sufficient.

![old-firefox-keychain-prompt](<./20240308-firefox-profile-downgrade/old-firefox-keychain-prompt.png>)

## 👓 References

https://shkspr.mobi/blog/2021/10/how-to-fix-an-upgraded-firefox-profile/
