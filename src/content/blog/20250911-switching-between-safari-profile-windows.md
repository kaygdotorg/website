---
title: Switching between Safari Profile Windows - Not Creating New Ones
slug: switching-between-safari-profile-windows-not-creating-new-ones
description: Safari Profiles are a great power user tool. If you'd like to separate concerns like between work, personal, side projects – make a profile for each one.
date: 2025-09-11 11:05:21
last-edited: 2026-01-19 21:58:20
tags:
  - Blog
  - MacOS
  - Safari
cover-image: https://images.unsplash.com/photo-1683113028948-4b716d1a18d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=2000
last edited: 2026-02-02 22:57:09
---
## Intro

> [!NOTE] 
> If you don't care about the reasoning behind my use of Safari, you can skip to the next heading.

Safari Profiles are a great power user tool. If you'd like to separate concerns like between work, personal, side projects – make a profile for each one; your context stays localised. Then, you can search for the website through Spotlight or simply hit `CMD + Y` on the respective profile to search through history for that website. Simple enough, right?

Profiles have been a thing on browsers for ages, and almost every browser has them now. They're such a power-user loving utility that browsers like [Arc](https://arc.net/) and [Zen](https://zen-browser.app/) base their entire existence on making switching between contexts (aka profiles) easy and feel like second nature. It's moreso surprising when you realise that Profiles are native to the browsers themselves - like chromium for Arc and firefox for Zen, and that these new browsers are fine-tuning the experience to such a tantalizing extent that warrants switching to them.

However, Arc currently has a few problems:

- The Browser Company has serious ADHD when it comes to building anything. They build great stuff, they suck at sticking to a product. With the recent pivot to [Dia](https://www.diabrowser.com/) (which is also great btw, for other reasons), Arc is maintenance-only.
- [The Browser Company got bought by Atlassian](https://x.com/browsercompany/status/1963579501129978167) which further undermines my confidence in them building a product that I can trust and use for multiple years.
- The iOS equivalent of Arc Browser has nothing to do with the desktop product. It's fancy (very beautifully made) AI slop search.

Zen Browser doesn't have those problems. In fact, it's not just good – it's great. If I had to put my money behind a project, it would absolutely be Zen because:

- [The project is open source](https://github.com/zen-browser).
- [The project it is based on is open source](https://github.com/mozilla-firefox/firefox).
- They have a discord where they actually listen to user feedback and implement features that are requested. For example, [the recent feature release is tab groups / folders that behave exactly like in Arc Browser](https://github.com/zen-browser/desktop/releases/tag/1.15b).

But:

- Firefox on iOS sucks.
- Firefox on iOS has no extensions, no profiles.
- It's not realistic for the Zen Browser team to build a browser on mobile where the power users are far fewer than on the desktop.
- Firefox does not integrate with Spotlight.

Perhaps, the spotlight complaint is the one that bugs me the most, and is the leading reason why I stick to Apple default tools – even though they are inferior in many ways.

Safari, on the other hand, has many problems. I would say, more problems than both of the above browsers combined. I mean, think about [discovering this crap when you're in an important meeting](https://kayg.org/blog/keep-playing-audio-in-safari-when-switching-to-another-tab-group/). Or [experiencing this when you want to chill after said important meeting](https://kayg.org/blog/safari-goes-nuts-everytime-i-watch-a-youtube-video/).

But Safari also has many good things going for it too:

1. There is a feature update, for sure, in an annual cadence.
2. It's supported by Apple which means that it's for sure, for sure, not going anywhere. There will be no acquisition, no AI enshittification, no lack of funds to recover from.
3. The mobile app has feature parity with desktop, which means profiles, extensions AND sync! Sync includes extensions and settings too!
4. You can query history, bookmarks and reading lists directly from spotlight.

And again, spotlight search is the most calling feature for me. Recalling information is HUGE. Finding that website which you are talking about to somebody in-real-life but one which you forgot to bookmark is also HUGE.

## Safari Profiles

### The Problem

Safari has a problem with Profiles. It's that there is no easy way to switch between them. I am aware that there exists a menubar item that you can assign a shortcut to:

![Safari Menubar File → New Window](<./20250911-switching-between-safari-profile-windows/safari-1.png>)

From System Settings → Keyboard → Keyboard Shortcuts:

![MacOS Keyboard Shortcuts section from System Settings](<./20250911-switching-between-safari-profile-windows/safari-2.png>)

I am also aware that the great folks from Macstories have an [article](https://www.macstories.net/tutorials/how-i-fixed-switching-between-safari-profiles-with-bettertouchtool-and-a-hyper-key/) about Profile Switching that make use of Bettertouchtool to basically do the above with Hyperkey instead.

However, neither of these approaches address the key concern – which is that everytime you hit whatever shortcut you have for "New \<Profile\> Window", it does exactly that. It opens a New Profile Window instead of switching to an existing one that was previously opened by the same shortcut!

That gets old really fast. When you're deep in work and want to quickly check if your client has replied, you don't want to open a new window in the current workspace, you want to switch to the already opened window in the workspace you put it in.

### Do The Right Thing

The answer is actually pretty simple. It goes like this:

1. Open an invalid page like: `http://personal.page/` on your Personal Profile. Safari will fail to load it. **Don't close the page yet!**
2. Goto Settings → Websites → Open Links with Profile

![Safari Settings for Open Links with Profile](<./20250911-switching-between-safari-profile-windows/safari-3.png>)

3. Assign the page to the Personal Profile.

Now repeat this procedure for however many profiles you have and would like to switch between. Once done, you would need [BetterTouchTool](https://folivora.ai/) to configure something very simple:

1. Create a Named Trigger: "Switch Safari Window to Personal"
2. Use the "Open URL" action as the first action to open `http://personal.page`
3. Use the "Wait for Change of Focused Window" as the second action with the "Check Interval" set to 1. Adjust it to 1.25 later if it does not work.
4. Use the "Menubar-Item" action to trigger the File → Close Tab action.

![BetterTouchTool Configuration for Safari Profile Switching](<./20250911-switching-between-safari-profile-windows/safari-btt-config.mp4>)

If you don't wanna configure it yourself, use the following preset and import it into BetterTouchTool:

**[Download: switch-safari-profile-window.bttpreset](<./20250911-switching-between-safari-profile-windows/switch-safari-profile-window.bttpreset>)** (2 KB)

Copy the trigger and change the dummy webpage for as many profiles you have and would like to switch between.

Let's look at the procedure in action. I am using `CTRL X` and `CTRL Z` to switch between Profiles.

![This works even if you spam the same keyboard shortcut multiple times.](./20250911-switching-between-safari-profile-windows/safari-demo.mp4)

If it does not work for you, you can try the following things:

1. Change the "Check Interval" to a higher number.
2. Make sure the dummy page (`http://personal.page`) resolves to something instead of leaving Safari to try and load it. I used a dummy page here because I did not want the page to actually be available for the shortcut to work.

If the procedure still does not work, please let me know in the comments and we can figure out a better solution. If you have a faster workflow than this, I would also love to know it in the comments.

## Credits

- [Andreas Hegenberg](https://community.folivora.ai/badges/30/famous-link?username=andreas_hegenberg) for creating a swiss army knife like BetterTouchTool.
- [Anwes Panda](https://anwespanda.com/) for coming up with the problem statement.