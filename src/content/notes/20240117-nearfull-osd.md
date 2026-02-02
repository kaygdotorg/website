---
date: 2024-01-17 16:38
last-edited: 2025-01-05 18:50
title: Nearfull OSD
---
- A ceph cluster raises a nearfull warning when any OSD on the cluster reaches more than [nearfull-ratio](<./20240117-nearfull-ratio.md>) (0.85 by default) usage.
- If a ceph OSD is nearfull, the whole cluster switches to sync writes instead of async writes. So every piece of data needs to be synced to the drive before the next one is written.
- This takes down the whole cluster performance.
