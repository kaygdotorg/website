---
title: "Safari goes nuts everytime I watch a YouTube Video"
description: "So I was watching kitze's latest video on why you shouldn't build in public maybe on Safari and my Airpods Pro 2 make the same stuttering / chopping sound with the audio and video falling out of sync, as it always has, every so often. The behaviour repeats consistently."
date: "2025-04-30T15:48:00.000+05:30"
last edited: "2025-09-04T17:05:27.000+05:30"
tags:
  - "Blog"
  - "MacOS"
  - "Safari"
draft: true
image: "/images/ghost/safari-goes-nuts-everytime-i-watch-a-youtube-video-1768729025002.jpg"
---

## The Problem

So I was watching kitze's latest video on [why you shouldn't build in public maybe](https://youtu.be/rbqkbh3GsvQ?ref=kayg.org) on Safari and my Airpods Pro 2 make the same stuttering / chopping sound with the audio and video falling out of sync, as it always has, every so often. The behaviour repeats consistently. I thought, "what the hell?" Apple should just really solve this with the Airpods Pro 2. So I go ahead and turn bluetooth on and off, which is known and has been proven (n=1 sample size) to solve this issue.

![raycast-toggle-bluetooth](/images/ghost/safari-goes-nuts-everytime-i-watch-a-youtube-video-1768729025007.png)

And somehow it did not. I thought, "what the hell?" again and I disconnected and reconnected my airpods pro 2 again. That trick has also proven to solve this issue.

After multiple retries and finishing my food, I came back to my table and I dug deeper. The last time I tried looking for a solution to this problem, I found this thread: [https://apple.stackexchange.com/questions/434829/bluetooth-audio-is-choppy-stuttering](https://apple.stackexchange.com/questions/434829/bluetooth-audio-is-choppy-stuttering?ref=kayg.org) and this is where I got the idea from to toggle bluetooth state or toggle the connection to my airpods pro 2.

Unlike the thread suggests, I am connected to two bluetooth devices simultaneously at max:

![macos-bluetooth-airpods-pro-2](/images/ghost/safari-goes-nuts-everytime-i-watch-a-youtube-video-1768729025088.png)

The second being my magic trackpad.

This time though, I moved the laptop to in front of me and I tried my girlfriend's Airpods Max - which had the _same_ issue!

## The Solution

I tried another browser - Firefox via Zen Browser - watched the whole video again, and nope, nada, zilch, zero stuttering. All variables remained the same.

On a quick search about "safari youtube audio stuttering," I found:

-   [https://old.reddit.com/r/MacOS/comments/19emfkf/youtube\_lagging\_on\_safari\_anyone\_else/](https://old.reddit.com/r/MacOS/comments/19emfkf/youtube_lagging_on_safari_anyone_else/?ref=kayg.org)
-   [https://old.reddit.com/r/MacOS/comments/1bpv2k5/safari\_stuttering/](https://old.reddit.com/r/MacOS/comments/1bpv2k5/safari_stuttering/?ref=kayg.org)
-   [https://old.reddit.com/r/MacOS/comments/cpocev/youtube\_audio\_stutterscrackles\_every\_few\_seconds/](https://old.reddit.com/r/MacOS/comments/cpocev/youtube_audio_stutterscrackles_every_few_seconds/?ref=kayg.org)

I tried again with Safari on a new profile with:

-   0 extensions
-   Content blockers off

But I can still reproduce the problem.

I tried recording the stuttering on OBS for this post but as soon as I hit "start recording," on OBS, the problem disappeared; likely due to the airpods pro 2 switching to the HFP profile.

Along with Safari's annoying behaviour during meetings and now this, it might be time to start looking for a new browser.

Filed under _coming-soon_ Apple Software is Frustrating to Use.