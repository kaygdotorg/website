---
title: "Keep Playing Audio in Safari When Switching to Another Tab Group"
slug: "keep-playing-audio-in-safari-when-switching-to-another-tab-group"
description: "❓ What? Safari has this annoying issue as a feature, and it gets increasingly frustrating the more I ignore it - when content (like YouTube, a Google Meet sessi"
date: "2024-09-09T16:35:00.000+05:30"
last edited: "2025-09-03T12:13:23.000+05:30"
tags:
  - "Blog"
  - "MacOS"
  - "Safari"
draft: false
---

## ❓ What?

Safari has this annoying issue as a feature, and it gets increasingly frustrating the more I ignore it - when content (like YouTube, a Google Meet session, etc) has audio playback in one tab, and you switch to another **tab group**, the audio playback stops. Or if I'm in a meeting, I don't hear anything from the meeting even if I switch back to the tab. Reloading only partially helps where I can hear only certain participants.

## ❔ Why?

I don't know. It's a design choice, perhaps to prevent hidden tabs (or lost tabs) from playing audio when they're not foregrounded.

## 🎤 How?

The fix is to pin the tab, as pointed out by one generous member of the Apple feedback community but they missed one important bit of info. The fix is to instead pin the tab outside of a tab group, that is in the root of the profile.

Now switching to another tab or tab group will retain audio playback or meeting sessions as I would expect them to.

## 👓 References

[https://discussions.apple.com/thread/254193168](https://discussions.apple.com/thread/254193168?ref=kayg.org)

[https://discussions.apple.com/thread/254958427](https://discussions.apple.com/thread/254958427?ref=kayg.org)