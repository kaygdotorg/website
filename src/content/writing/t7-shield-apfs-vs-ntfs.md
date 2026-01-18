---
title: "T7 Shield - APFS vs NTFS"
description: "Intro

I got the 4 TB Samsung T7 Shield back in August or October 2023 for a very appealing price of 24k INR but it has sat in my bag since, except for a benchmark that I ran once or so and never published it.

This update is an attempt to make sense of and publish those benchmarks.

These tests were done with the SSD plugged directly into one of the thunderbolt ports of the Macbook Pro M2 Max, and not through a USB C port from the dock that I use.

The tests on MacOS are done through AmorphousD"
date: "2023-11-08T07:04:00.000+05:30"
last edited: "2025-08-27T15:56:19.000+05:30"
tags:
  - "Blog"
draft: true
---

## Intro

I got the 4 TB Samsung T7 Shield back in August or October 2023 for a very appealing price of 24k INR but it has sat in my bag since, except for a benchmark that I ran once or so and never published it.

![./t7-shield-benchmark-apfs-vs-ntfs/samsung-t7-shield-4-tb-ssd.jpg](/images/ghost/t7-shield-apfs-vs-ntfs-1768729029832.jpg)

This update is an attempt to make sense of and publish those benchmarks.

These tests were done with the SSD plugged directly into one of the thunderbolt ports of the Macbook Pro M2 Max, and not through a USB C port from the dock that I use.

The tests on MacOS are done through AmorphousDiskMark from the App Store and the tests on Windows are done via disk passthrough from Parallels and using CrystalDiskMark.

## First contender - APFS

-   Test size - 16 GB

![./t7-shield-benchmark-apfs-vs-ntfs/Samsung PSSD T7 Shield - APFS - 16 GB.png](/images/ghost/t7-shield-apfs-vs-ntfs-1768729029861.png)

-   Test size - 64 GB

![./t7-shield-benchmark-apfs-vs-ntfs/Samsung PSSD T7 Shield - APFS - 64 GB.png](/images/ghost/t7-shield-apfs-vs-ntfs-1768729029887.png)

## Second Contender - APFS Encrypted

-   Test size - 64 GB

![](/images/ghost/t7-shield-apfs-vs-ntfs-1768729029913.png)

## Third Contender - Paragon NTFS

-   Test size - 16 GB

![](/images/ghost/t7-shield-apfs-vs-ntfs-1768729029939.png)

-   Test size - 64 GB

![](/images/ghost/t7-shield-apfs-vs-ntfs-1768729029965.png)

## Fourth Contender - Tuxera NTFS

-   Test size - 16 GB

![](/images/ghost/t7-shield-apfs-vs-ntfs-1768729029991.png)

-   Test size - 64 GB

![](/images/ghost/t7-shield-apfs-vs-ntfs-1768729030016.png)

## Last Contender - WIndows NTFS

-   Test size - 16 GB

![](/images/ghost/t7-shield-apfs-vs-ntfs-1768729030043.png)

-   Test size - 64 GB

![](/images/ghost/t7-shield-apfs-vs-ntfs-1768729030071.png)

-   Test size - Real World Performance Preset

![](/images/ghost/t7-shield-apfs-vs-ntfs-1768729030097.png)

## Disk stats

I forgot to record the disk stats before starting these tests so I likely took them somewhere in between them.

![](/images/ghost/t7-shield-apfs-vs-ntfs-1768729030123.png)

## Conclusion

So it seems like the answer is pretty obvious. If you're on MacOS and are buried deep in the Apple Ecosystem, use APFS and you'll get the best performance. However if you're a mac/android guy like I am, Paragon NTFS knows their shit.

Windows somehow wins with the best performance out of the box with NTFS. I don't know what magic is that, but if you do, please consider sharing in a blog post like this or in the comments. Until next time!