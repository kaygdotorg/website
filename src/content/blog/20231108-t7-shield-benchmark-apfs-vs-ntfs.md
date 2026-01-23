---
date: 2023-11-08 07:04
last edited: 2025-01-05 20:19
title: T7 Shield - APFS vs NTFS
---
## Intro

I got the 4 TB Samsung T7 Shield back in August or October 2023 for a very appealing price of 24k INR but it has sat in my bag since, except for a benchmark that I ran once or so and never published it.

![samsung-t7-shield-4-tb-ssd](<./20231108-t7-shield-benchmark-apfs-vs-ntfs/samsung-t7-shield-4-tb-ssd.jpg>)

This update is an attempt to make sense of and publish those benchmarks.

These tests were done with the SSD plugged directly into one of the thunderbolt ports of the Macbook Pro M2 Max, and not through a USB C port from the dock that I use.

The tests on MacOS are done through AmorphousDiskMark from the App Store and the tests on Windows are done via disk passthrough from Parallels and using CrystalDiskMark.

## First contender - APFS

- Test size - 16 GB 
  
  ![Samsung PSSD T7 Shield - APFS - 16 GB](<./20231108-t7-shield-benchmark-apfs-vs-ntfs/Samsung PSSD T7 Shield - APFS - 16 GB.png>)
  
- Test size - 64 GB 

![Samsung PSSD T7 Shield - APFS - 64 GB](<./20231108-t7-shield-benchmark-apfs-vs-ntfs/Samsung PSSD T7 Shield - APFS - 64 GB.png>)
## Second Contender - APFS Encrypted

- Test size - 64 GB

![Samsung PSSD T7 Shield - APFS Encrypted - 64 GB](<./20231108-t7-shield-benchmark-apfs-vs-ntfs/Samsung PSSD T7 Shield - APFS Encrypted - 64 GB.png>)

## Third Contender - Paragon NTFS

- Test size - 16 GB

![Samsung PSSD T7 Shield - Paragon NTFS - 16 GB](<./20231108-t7-shield-benchmark-apfs-vs-ntfs/Samsung PSSD T7 Shield - Paragon NTFS - 16 GB.png>)

- Test size - 64 GB

![Samsung PSSD T7 Shield - Paragon NTFS - 64 GB](<./20231108-t7-shield-benchmark-apfs-vs-ntfs/Samsung PSSD T7 Shield - Paragon NTFS - 64 GB.png>)

## Fourth Contender - Tuxera NTFS

- Test size - 16 GB
  
![Samsung PSSD T7 Shield - Tuxera NTFS - 16 GB](<./20231108-t7-shield-benchmark-apfs-vs-ntfs/Samsung PSSD T7 Shield - Tuxera NTFS - 16 GB.png>)
- Test size - 64 GB

![Samsung PSSD T7 Shield - Tuxera NTFS - 64 GB](<./20231108-t7-shield-benchmark-apfs-vs-ntfs/Samsung PSSD T7 Shield - Tuxera NTFS - 64 GB.png>)

## Last Contender - WIndows NTFS

- Test size - 16 GB

![Samsung T7 Shield - Windows NTFS - 16 GB](<./20231108-t7-shield-benchmark-apfs-vs-ntfs/Samsung T7 Shield - Windows NTFS - 16 GB.png>)

- Test size - 64 GB

![Samsung T7 Shield - Windows NTFS - 64 GB](<./20231108-t7-shield-benchmark-apfs-vs-ntfs/Samsung T7 Shield - Windows NTFS - 64 GB.png>)

- Test size - Real World Performance Preset

![Samsung T7 Shield - Windows NTFS - Real World Performance Preset](<./20231108-t7-shield-benchmark-apfs-vs-ntfs/Samsung T7 Shield - Windows NTFS - Real World Performance Preset.png>)

## Disk stats

I forgot to record the disk stats before starting these tests so I likely took them somewhere in between them.

![CrystalDiskInfo\_20231108095316](<./20231108-t7-shield-benchmark-apfs-vs-ntfs/CrystalDiskInfo_20231108095316.png>)

## Conclusion

So it seems like the answer is pretty obvious. If you're on MacOS and are buried deep in the Apple Ecosystem, use APFS and you'll get the best performance. However if you're a mac/android guy like I am, Paragon NTFS knows their shit. 

Windows somehow wins with the best performance out of the box with NTFS. I don't know what magic is that, but if you do, please consider sharing in a blog post like this or in the comments. Until next time!
