---
date: 2025-01-05 19:08:00
last edited: 2026-01-18 15:33:47
title: Unsupported File Formats in iOS Photos - H264 Main-L6
---

> [!NOTE] H264 Profiles and Levels
> Previously this note said H264 generally but the assessment was wrong. Infact the unsupported-ness only applied to H.264 media with the profile Main and Level 6. I am still unsure if Level 6.1 and 6.2 are also unsupported on Photos.

## ❓ What?

It turns out iOS Photos does not support H264 files that have the profile `Main@L6` and apparently, [also SVG](https://github.com/localsend/localsend/issues/1309). For a list of supported formats for Photos, Apple says this:

> Your photos and videos are stored in iCloud in their original format at full resolution. Formats include HEIF, JPEG, RAW, PNG, GIF, TIFF, HEVC and MP4, as well as special formats you capture with your iPhone or iPad, such as slo-mo, time-lapse, 4K videos and Live Photos. The photos and videos you capture with these devices are in [HEIF and HEVC](https://support.apple.com/en-gb/116944) format.

https://support.apple.com/en-gb/108782  

Some apps like [Localsend](https://github.com/localsend/localsend) have an option in Settings that goes like, "Save Media to Gallery," which, for convenience reasons, tries to save media to the Photos app where most people are likely to look. However, this does mean that you can't easily drop your remuxes or whatever media you have on-hand to your iphone and expect the transfer to succeed. Worse, the error surprises you only at the end of the file transfer.  

![localsend-h264-fail](<./20250105-unsupported-format-ios-photos/localsend-h264-fail.png>)

## 🎤 How?

The simplest option is to, of course, disable options like "Save Media to Gallery" which would then save that file into the Files app, which would play the media in a supported app. Everything works well then. 

But what if you want the media in Photos? The only answer to that is you cannot. You need to convert the file into a supported format to do that. I read it as Photos being solely meant for personal media and videos (which are obviously stored in different formats - in my experience, Main@L5.2 with H264), but this is not entirely in-line with iOS apps because Instagram, for example, can only access Photos to look for media. 

What if I want to upload some H264 encoded media that's not supported by Photos? I cannot, and that kinda sucks on a premium phone. Hey, but I can always share from Files, right? Nope.

![instagram-share-from-files](<./20250105-unsupported-format-ios-photos/instagram-share-from-files.jpg>)

So what are my options if I want to upload unsupported media from Files to apps like Instagram?

1. Use another device.
2. Convert file into a supported format such as H264 Main@L5.2 or reexport it from your video editor if it's creative content.

What are my options to share unsupported media to an iOS device?

1. Airdrop if you have another Apple device. It will save supported media to Photos and unsupported media to Files automatically!
2. Localsend (with Save Media to Gallery turned off) - https://localsend.org
3. Snapdrop - https://snapdrop.net

Okay but do you know that you can drag and drop things from Files to Photos? Yup, but it does not make unsupported file types magically work.

![photos-some-items-not-slupported](<./20250105-unsupported-format-ios-photos/photos-some-items-not-slupported.jpg>)

If you have other leads, please let me know.


> [!NOTE] Adobe Premiere Pro on MacOS
> One more interesting detail is that I wanted to produce a H264 Main@L6 video for myself and confirm which formats are supported in the Photos app. However, even if I select Levels 6, 6.1, 6.2 - Adobe Premiere Pro on MacOS ends up exporting the video in Main L5.2 which then obviously works in Photos.app. 


## 👓 References

https://github.com/localsend/localsend

https://support.apple.com/en-gb/108782

https://old.reddit.com/r/premiere/comments/1bwkvvg/exporting_h264_video_and_saving_to_iphone/
