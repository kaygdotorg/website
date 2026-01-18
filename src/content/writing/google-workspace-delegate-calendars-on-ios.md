---
title: "Google Workspace Delegate Calendars on iOS"
description: "Google Workspace Delegated Calendars do not show up on the Apple Calendar on iPhone. It does so on my Mac though. Why?"
date: "2025-01-05T18:48:00.000+05:30"
last edited: "2025-09-04T17:06:47.000+05:30"
tags:
  - "Blog"
  - "iOS"
draft: false
image: "/images/ghost/google-workspace-delegate-calendars-on-ios-1768729026072.jpg"
---

## ❓ What?

Google Workspace Delegated Calendars do not show up on the Apple Calendar on iPhone. It does so on my Mac, under a "Delegated Calendars" section like so:

![./google-workspace-calendar-iphone/delegates-apple-calendar-macos.png](/images/ghost/google-workspace-delegate-calendars-on-ios-1768729026251.png)

But on my iPhone, not only do the shared calendars not show up under the account, moreso upon tapping on the "Delegate Calendars" button brings me to an empty page:

![./google-workspace-calendar-iphone/apple-calendar-iphone-ios-delegates.png](/images/ghost/google-workspace-delegate-calendars-on-ios-1768729026278.png)

## ❔ Why?

There's something wrong about how Google Workspace syncs with iOS. I don't know what exactly is wrong.

## 🎤 How?

To fix this, visit [https://www.google.com/calendar/syncselect](https://www.google.com/calendar/syncselect?ref=kayg.org) from your Google Workspace account and tick the calendars you wish to sync. In my case, the missing calendars were unticked and ticking them for sync, and triggering a refresh on my iPhone solved the problem.

It's still not clear to me what actually causes the problem. If you know more, please let me know.

## 👓 References

[https://www.reddit.com/r/ios/comments/1f18tgy/delegate\_calendar\_shows\_up\_on\_mac\_but\_not\_on/](https://www.reddit.com/r/ios/comments/1f18tgy/delegate_calendar_shows_up_on_mac_but_not_on/?ref=kayg.org)