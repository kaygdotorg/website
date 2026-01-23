---
date: 2024-01-17 14:30
last edited: 2024-12-28 17:00
title: Ceph Quincy MDS Standby-Replay Memory Leak
---
## Overview

The Ceph MDS standby-replay daemon is affected by a now-fixed memory leak bug that causes gradually increasing memory consumption[^1].

This is fixed in Ceph Versions 17.2.8[^2] and 18.2.4[^3].

## Workarounds

1. Memory-Based Restart:
   - Monitor MDS memory usage
   - Restart the MDS when it reaches a specific memory threshold
   - Can be automated using `earlyoom`

2. Disable Standby-Replay:
```bash
ceph fs set <fsname> allow_standby_replay false
```

## Bug Reference

This issue is tracked in Ceph's issue tracker[^1]. The bug affects multiple versions of Ceph and requires either implementing one of the workarounds or upgrading to a version with the fix.

[^1]: [Ceph Issue #48673 - MDS Memory Leak](https://tracker.ceph.com/issues/48673)
[^2]: https://tracker.ceph.com/issues/63675
[^3]: https://tracker.ceph.com/issues/63676
