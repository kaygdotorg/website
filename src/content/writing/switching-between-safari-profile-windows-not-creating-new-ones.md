---
title: "Switching between Safari Profile Windows - Not Creating New Ones"
description: "Safari Profiles are a great power user tool. If you'd like to separate concerns like between work, personal, side projects – make a profile for each one; your context stays localised. Then, you can search for the website through Spotlight."
date: "2025-09-11T11:05:21.000+05:30"
last edited: "2025-09-11T11:06:35.000+05:30"
tags:
  - "Blog"
  - "MacOS"
  - "Safari"
draft: false
image: "/images/ghost/switching-between-safari-profile-windows-not-creating-new-ones-1768729024675.jpg"
---

## Intro

💡

If you don't care about the reasoning behind my use of Safari, you can skip to the next heading.

Safari Profiles are a great power user tool. If you'd like to separate concerns like between work, personal, side projects – make a profile for each one; your context stays localised. Then, you can search for the website through Spotlight or simply hit `CMD + Y` on the respective profile to search through history for that website. Simple enough, right?

Profiles have been a thing on browsers for ages, and almost every browser has them now. They're such a power-user loving utility that browsers like [Arc](https://arc.net/?ref=kayg.org) and [Zen](https://zen-browser.app/?ref=kayg.org) base their entire existence on making switching between contexts (aka profiles) easy and feel like second nature. It's moreso surprising when you realise that Profiles are native to the browsers themselves - like chromium for Arc and firefox for Zen, and that these new browsers are fine-tuning the experience to such a tantalizing extent that warrants switching to them.

However, Arc currently has a few problems:

-   The Browser Company has serious ADHD when it comes to building anything. They build great stuff, they suck at sticking to a product. With the recent pivot to [Dia](https://www.diabrowser.com/?ref=kayg.org) (which is also great btw, for other reasons), Arc is maintenance-only.
-   [The Browser Company got bought by Atlassian](https://x.com/browsercompany/status/1963579501129978167?ref=kayg.org) which further undermines my confidence in them building a product that I can trust and use for multiple years.
-   The iOS equivalent of Arc Browser has nothing to do with the desktop product. It's fancy (very beautifully made) AI slop search.

Zen Browser doesn't have those problems. In fact, it's not just good – it's great. If I had to put my money behind a project, it would absolutely be Zen because:

-   [The project is open source](https://github.com/zen-browser?ref=kayg.org).
-   [The project it is based on is open source](https://github.com/mozilla-firefox/firefox?ref=kayg.org).
-   They have a discord where they actually listen to user feedback and implement features that are requested. For example, [the recent feature release is tab groups / folders that behave exactly like in Arc Browser](https://github.com/zen-browser/desktop/releases/tag/1.15b?ref=kayg.org).

But:

-   Firefox on iOS sucks.
-   Firefox on iOS has no extensions, no profiles.
-   It's not realistic for the Zen Browser team to build a browser on mobile where the power users are far fewer than on the desktop.
-   Firefox does not integrate with Spotlight.

Perhaps, the spotlight complaint is the one that bugs me the most, and is the leading reason why I stick to Apple default tools – even though they are inferior in many ways.

Safari, on the other hand, has many problems. I would say, more problems than both of the above browsers combined. I mean, think about [discovering this crap when you're in an important meeting](https://kayg.org/blog/keep-playing-audio-in-safari-when-switching-to-another-tab-group/). Or [experiencing this when you want to chill after said important meeting](https://kayg.org/blog/safari-goes-nuts-everytime-i-watch-a-youtube-video/).

But Safari also has many good things going for it too:

-   There is a feature update, for sure, in an annual cadence.
-   It's supported by Apple which means that it's for sure, for sure, not going anywhere. There will be no acquisition, no AI enshittification, no lack of funds to recover from.
-   The mobile app has feature parity with desktop, which means profiles, extensions AND sync! Sync includes extensions and settings too!
-   You can query history, bookmarks and reading lists directly from spotlight.

And again, spotlight search is the most calling feature for me. Recalling information is HUGE. Finding that website which you are talking about to somebody in-real-life but one which you forgot to bookmark is also HUGE.

## Safari Profiles

### The Problem

Safari has a problem with Profiles. It's that there is no easy way to switch between them. I am aware that there exists a menubar item that you can assign a shortcut to:

![Safari Menubar File → New Window](/images/ghost/switching-between-safari-profile-windows-not-creating-new-ones-1768729024692.png)

From System Settings → Keyboard → Keyboard Shortcuts

![MacOS Keyboard Shortcuts section from System Settings](/images/ghost/switching-between-safari-profile-windows-not-creating-new-ones-1768729024859.png)

I am also aware that the great folks from Macstories have an [article](https://www.macstories.net/tutorials/how-i-fixed-switching-between-safari-profiles-with-bettertouchtool-and-a-hyper-key/?ref=kayg.org) about Profile Switching that make use of Bettertouchtool to basically do the above with Hyperkey instead.

However, neither of these approaches address the key concern – which is that everytime you hit whatever shortcut you have for "New <Profile> Window", it does exactly that. It opens a New Profile Window instead of switching to an existing one that was previously opened by the same shortcut!

That gets old really fast. When you're deep in work and want to quickly check if your client has replied, you don't want to open a new window in the current workspace, you want to switch to the already opened window in the workspace you put it in.

### Do The Right Thing

The answer is actually pretty simple. It goes like this:

1.  Open an invalid page like: http://personal.page/ on your Personal Profile. Safari will fail to load it. **Don't close the page yet!**
2.  Goto Settings → Websites → Open Links with Profile

![](/images/ghost/switching-between-safari-profile-windows-not-creating-new-ones-1768729024933.png)

3.  Assign the page to the Personal Profile.

Now repeat this procedure for however many profiles you have and would like to switch between. Once done, you would need [BetterTouchTool](https://folivora.ai/?ref=kayg.org) to configure something very simple:

1.  Create a Named Trigger: "Switch Safari Window to Personal"
2.  Use the "Open URL" action as the first action to open "http://personal.page"
3.  Use the "Wait for Change of Focused Window" as the second action with the "Check Interval" set to 1. Adjust it to 1.25 later if it does not work.
4.  Use the "Menubar-Item" action to trigger the File → Close Tab action.

0:00

/0:09

 1× 

BetterTouchTool Configuration for Safari Profile Switching

If you don't wanna configure it yourself, use the following preset and import it into BetterTouchTool:

[

switch-safari-profile-window

switch-safari-profile-window.bttpreset

2 KB

.a{fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.5px;}download-circle

](https://kayg.org/content/files/2025/09/switch-safari-profile-window.bttpreset "Download")

Copy the trigger and change the dummy webpage for as many profiles you have and would like to switch between.

Let's look at the procedure in action. I am using `CTRL X` and `CTRL Z` to switch between Profiles.

0:00

/0:10

 1× 

This works even if you spam the same keyboard shortcut multiple times.

If it does not work for you, you can try the following things:

1.  Change the "Check Interval" to a higher number.
2.  Make sure the dummy page (http://personal.page) resolves to something instead of leaving Safari to try and load it. I used a dummy page here because I did not want the page to actually be available for the shortcut to work.

If the procedure still does not work, please let me know in the comments and we can figure out a better solution. If you have a faster workflow than this, I would also love to know it in the comments.

## Credits

-   [Andreas Hegenberg](https://community.folivora.ai/badges/30/famous-link?username=andreas_hegenberg&ref=kayg.org) for creating a swiss army knife like BetterTouchTool.
-   [Anwes Panda](https://anwespanda.com/?ref=kayg.org) for coming up with the problem statement.