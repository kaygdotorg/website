---
type:
  - Permanent Note
tags:
  - macos/shortcuts
  - productivity/shortcuts
  - macos/bettertouchtool
date: 2024-06-07 12:27
last edited: 2025-04-10 16:01
title: Using Caps Lock as NOT the Hyper Key
---
## ❓ What?

Instead of going the regular route and using Caps Lock as a hyper key / hyper key layer, I tried to use it with the new feature from BetterTouchTool, which blocks (and releases) keyboard input temporarily. I discovered this because of [Frank1 on BTT Forums](https://community.folivora.ai/t/de-blocking-keyboard-as-hyperkey-replacement/34810?u=kayg04). 

## ❔ Why?

BetterTouchTool does not listen to keystrokes sent by BetterTouchTool when configuring shortcuts or key sequences in it. Shortcuts are basically one key combo, such as a Modifier (Cmd, Opt, Ctrl) + Any key that is not a Modifier (h, j, k, l). 

Using Caps Lock as Hyper Key would mean I have to press Four Modifiers when configuring a new shortcut every time, and this does not even work when defining a Key Sequence (which is what I use more because I am a fan of [[Namespaced Shortcuts]]) because [the modifier order is relevant and cannot be marked as irrelevant in BTT.](https://community.folivora.ai/t/how-to-use-caps-lock-as-hyper-key-in-key-sequences/36908/4?u=kayg04) 

## 🎤 How?

  I don't just want to use Caps Lock as a Keyboard Block / Release button. Sure, when pressed (and held), I want it to do that. However, when pressed (and released), I want it to send Escape. I have been recently trying to relearn QWERTY to type with all my fingers instead of all on my left + two on my right. 

I have spent quite a bit of time trying out different combinations of delays and such, trying to emulate a QMK tap-hold functionality and here is what worked finally.

- When Caps Lock is Pressed and Released:
	- Send Escape 
	- Toggle Caps Lock
	  
	  This is important because otherwise Caps Lock itself would turn on - meaning all CAPS.
	  ![caps-lock-press-and-release](<./caps-lock-not-hyper-key/caps-lock-press-and-release.png>)

- When Caps Lock is Pressed and *no further input is detected for the next 0.2 seconds* (that is, caps lock is not released OR any other key is NOT pressed):
	- Block keyboard input. 
	  
	  Initially, the delay was 0.3s, but I have reduced it to 0.2s. I'll try reducing it further in the future. 
	 ![caps-lock-release](<./caps-lock-not-hyper-key/caps-lock-release.png>)
- When Caps Lock is Released (*only when keyboard input is blocked* - I do not want it to trigger when caps lock is pressed with another key as I also configure shortcuts that are not key sequences):
	- Allow keyboard input 
	- Toggle Caps Lock 
	  
	  This is important because otherwise Caps Lock itself would turn on - meaning all CAPS.
	  ![caps-lock-press-and-release](<./caps-lock-not-hyper-key/caps-lock-press-and-release.png>)

		

## 👓 References

https://community.folivora.ai/t/de-blocking-keyboard-as-hyperkey-replacement/34810/17?u=kayg04