---
date: 2025-01-05 18:48:00
last edited: 2026-01-18 15:33:11
title: Google Workspace Delegate Calendars on iPhone
---
## ❓ What?

  Google Workspace Delegated Calendars do not show up on the Apple Calendar on iPhone. It does so on my Mac, under a "Delegated Calendars" section like so:

![delegates-apple-calendar-macos](<./20250105-google-workspace-calendar-iphone/delegates-apple-calendar-macos.png>)

But on my iPhone, not only do the shared calendars not show up under the account, moreso upon tapping on the "Delegate Calendars" button brings me to an empty page:

![apple-calendar-iphone-ios-delegates](<./20250105-google-workspace-calendar-iphone/apple-calendar-iphone-ios-delegates.png>)

## ❔ Why?

  There's something wrong about how Google Workspace syncs with iOS. I don't know what exactly is wrong.

## 🎤 How?

  To fix this, visit https://www.google.com/calendar/syncselect from your Google Workspace account and tick the calendars you wish to sync. In my case, the missing calendars were unticked and ticking them for sync, and triggering a refresh on my iPhone solved the problem.

It's still not clear to me what actually causes the problem. If you know more, please let me know.

## 👓 References

https://www.reddit.com/r/ios/comments/1f18tgy/delegate_calendar_shows_up_on_mac_but_not_on/
