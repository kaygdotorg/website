---
title: OSD Scrubs on HDD v/s SSD
date: 2024-02-14 22:23
last-edited: 2026-01-18 15:33:22
---
## Overview

OSD Max Scrubs (`osd_max_scrubs`) is a Ceph configuration parameter that defines how many simultaneous scrub operations an OSD can perform. Scrubbing is Ceph's data integrity checking mechanism that verifies the consistency of stored data.

## Default Configuration

- Default value: 3 concurrent scrubs per OSD
- This default is optimized for SSD-based clusters
- For HDD-based clusters, this value should be reduced to 1

## Performance Impact

1. **HDD Characteristics**

   - HDDs are mechanical devices with physical seek times
   - Concurrent scrubs cause random I/O patterns
   - Multiple seeks significantly degrade HDD performance
   - Sequential operations are preferred for HDDs

2. **SSD Characteristics**

   - No mechanical movement
   - Better handling of parallel operations
   - Can sustain multiple concurrent scrubs without significant performance impact

## Configuration Recommendation

For HDD-based clusters:

```bash
ceph config set osd osd_max_scrubs 1
```
