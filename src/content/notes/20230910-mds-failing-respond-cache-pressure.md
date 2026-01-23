---
date: 2023-09-10 21:18
last edited: 2026-01-19 21:37:31
title: MDS failing to Respond to Cache Pressure
---
## Overview

MDS cache pressure occurs when the Metadata Server (MDS) requests clients to release their cache, but clients are either slow to respond or fail to honor these requests[^1].

## Error Message

The health warning appears as:
```
health warn mds failing to respond to cache pressure
```
## Symptoms

When experiencing MDS cache pressure, you may see warnings in the Ceph health status about clients failing to respond to cache pressure. This typically occurs when the MDS cache size approaches or exceeds the configured limit.

## Solutions

1. Increase MDS Cache Memory Limit[^1]:
```bash
ceph config set mds mds_cache_memory_limit <size>
```

2. Client-side Checks:
   - Verify kernel version is up to date
   - Check for kernel bugs related to CephFS cache handling

3. Adjust Client Cache Size[^2]:
```bash
ceph config set client client_oc_size <size>
```

## Technical Details

The MDS maintains a cache of metadata to serve client requests efficiently. When this cache comes under pressure, the MDS attempts to reclaim memory by asking clients to trim their caches. If clients don't respond appropriately, it can impact overall filesystem performance.

[^1]: [Ceph Documentation - Cache Configuration](https://docs.ceph.io/en/latest/cephfs/cache-configuration/)
[^2]: [CephFS Client Configuration Reference](https://docs.ceph.io/en/latest/cephfs/client-config-ref/)
