---
date: 2023-09-05 19:54:00
last-edited: 2026-01-19 22:10:49
title: Compacting Ceph OSDs
---
## Overview

RocksDB compaction in Ceph is a process aimed at reducing fragmentation in the RocksDB database and improving the performance of daemons like OSDs and MONs. Over time, as clusters handle a large number of I/O operations, RocksDB can accumulate fragmentation, leading to higher latencies. 

## Takeaways

- Compaction ensures that RocksDB remains performant over time.
- Compaction is applicable to both MONs and OSDs, but it is most commonly required for OSDs because they handle significant I/O workloads.
- Compaction can be triggered manually or automatically during daemon restart.
- The `osd_compact_on_start` flag enables compaction during an OSD daemon restart.

## Configuration

To enable RocksDB compaction during OSD daemon restarts, add the following to the `ceph.conf` file under the `[osd]` section:

```ini
[osd]
osd_compact_on_start = true
```

This configuration ensures that compaction occurs each time the OSD daemon restarts, which is particularly useful for clusters that experience prolonged operation without regular maintenance.

## Best Practices

- Enable compaction if your cluster shows signs of RocksDB fragmentation, such as slower OSD operations or higher latencies.
- Regularly restart OSDs with compaction enabled to maintain database health.

## Version Applicability

The `osd_compact_on_start` flag is available starting from Ceph Pacific. Ensure that your cluster is running a compatible version before applying this configuration. [^1]

[^1]: [Ceph Pacific Release Notes](https://docs.ceph.com/en/latest/releases/pacific/#id39)  
