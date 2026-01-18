---
title: "Unsupported File Formats in iOS Photos - H264 Main-L6"
slug: "unsupported-file-formats-in-ios-photos-h264-main-l6"
description: "It turns out iOS Photos does not support H264 files that have the profile Main@L6 and apparently, also SVG. For a list of supported formats for Photos, Apple says this."
date: "2025-01-05T19:08:00.000+05:30"
last edited: "2025-09-04T17:06:30.000+05:30"
tags:
  - "Blog"
draft: false
image: "/images/ghost/unsupported-file-formats-in-ios-photos-h264-main-l6-1768729025566.jpg"
---

## ❓ What?

It turns out iOS Photos does not support H264 files that have the profile `Main@L6` and apparently, [also SVG](https://github.com/localsend/localsend/issues/1309?ref=kayg.org). For a list of supported formats for Photos, Apple says this:

💡

Your photos and videos are stored in iCloud in their original format at full resolution. Formats include HEIF, JPEG, RAW, PNG, GIF, TIFF, HEVC and MP4, as well as special formats you capture with your iPhone or iPad, such as slo-mo, time-lapse, 4K videos and Live Photos. The photos and videos you capture with these devices are in [HEIF and HEVC](https://support.apple.com/en-gb/116944?ref=kayg.org) format.

[https://support.apple.com/en-gb/108782](https://support.apple.com/en-gb/108782?ref=kayg.org)

Some apps like [Localsend](https://github.com/localsend/localsend?ref=kayg.org) have an option in Settings that goes like, "Save Media to Gallery," which, for convenience reasons, tries to save media to the Photos app where most people are likely to look. However, this does mean that you can't easily drop your remuxes or whatever media you have on-hand to your iphone and expect the transfer to succeed. Worse, the error surprises you only at the end of the file transfer.

![./unsupported-format-ios-photos/localsend-h264-fail.png](/images/ghost/unsupported-file-formats-in-ios-photos-h264-main-l6-1768729025992.png)

## 🎤 How?

The simplest option is to, of course, disable options like "Save Media to Gallery" which would then save that file into the Files app, which would play the media in a supported app. Everything works well then.

But what if you want the media in Photos? The only answer to that is you cannot. You need to convert the file into a supported format to do that. I read it as Photos being solely meant for personal media and videos (which are obviously stored in different formats - in my experience, Main@L5.2 with H264), but this is not entirely in-line with iOS apps because Instagram, for example, can only access Photos to look for media.

What if I want to upload some H264 encoded media that's not supported by Photos? I cannot, and that kinda sucks on a premium phone. Hey, but I can always share from Files, right? Nope.

![./unsupported-format-ios-photos/instagram-share-from-files.jpg](/images/ghost/unsupported-file-formats-in-ios-photos-h264-main-l6-1768729026019.jpg)

So what are my options if I want to upload unsupported media from Files to apps like Instagram?

1.  Use another device.
2.  Convert file into a supported format such as H264 Main@L5.2 or reexport it from your video editor if it's creative content.

What are my options to share unsupported media to an iOS device?

1.  Airdrop if you have another Apple device. It will save supported media to Photos and unsupported media to Files automatically!
2.  Localsend (with Save Media to Gallery turned off) - [https://localsend.org](https://localsend.org/?ref=kayg.org)
3.  Snapdrop - [https://snapdrop.net](https://snapdrop.net/?ref=kayg.org)

Okay but do you know that you can drag and drop things from Files to Photos? Yup, but it does not make unsupported file types magically work.

![./unsupported-format-ios-photos/photos-some-items-not-slupported.jpg](/images/ghost/unsupported-file-formats-in-ios-photos-h264-main-l6-1768729026044.jpg)

If you have other leads, please let me know.

💡

****Adobe Premiere Pro on MacOS****  
One more interesting detail is that I wanted to produce a H264 Main@L6 video for myself and confirm which formats are supported in the Photos app. However, even if I select Levels 6, 6.1, 6.2 - Adobe Premiere Pro on MacOS ends up exporting the video in Main L5.2 which then obviously works in Photos.app.

## 👓 References

[https://github.com/localsend/localsend](https://github.com/localsend/localsend?ref=kayg.org)

[https://support.apple.com/en-gb/108782](https://support.apple.com/en-gb/108782?ref=kayg.org)

[https://old.reddit.com/r/premiere/comments/1bwkvvg/exporting\_h264\_video\_and\_saving\_to\_iphone/](https://old.reddit.com/r/premiere/comments/1bwkvvg/exporting_h264_video_and_saving_to_iphone/?ref=kayg.org)