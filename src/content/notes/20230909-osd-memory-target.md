---
date: 2023-09-09 15:52
last-edited: 2025-01-02 20:02
title: Ceph OSD Memory Usage
---
## Overview

The `osd_memory_target` parameter in Ceph sets a soft limit for the memory usage of Object Storage Daemons (OSDs). It helps manage how much memory each OSD uses, but it doesn't enforce a strict cap. Under certain conditions, OSDs can exceed the configured target.

## Recommended Values

  - 8 GiB per OSD for spinning HDDs or SSDs.
  - Up to 12 GiB per OSD for NVMe drives, which handle higher IOPS and can benefit from more memory. 
  - Make sure the host has enough memory for the operating system and other Ceph components like Monitor and Manager daemons.
  - When dealing with mixed storage types, allocate memory targets proportional to the performance of the drives.

## Why OSDs May Exceed `osd_memory_target`

- Ceph adjusts memory usage dynamically. There might come a situation where ceph has freed up the memory but the linux kernel has not claimed it. [^1]
   
- This is also the `bluestore_cache_autotune` parameter, which is set to `true` by default. If it is disabled, Ceph will ignore `osd_memory_target` and will adjust OSD memory usage according to `bluestore_cache_size_hdd` or `bluestore_cache_size_ssd`.[^2][^3]

- If `osd_memory_target_autotune` is set to true (by default, `false` on croit), `cephadm` will dynamically adjust the `osd_memory_target` depending on the system memory available. [^4]

## Configuration

### Monitoring

- Use tools like `ceph daemon osd.<ID> perf dump` to check memory usage for individual OSDs.
- Monitor overall system memory with commands like `htop` or `free -h` to ensure that memory usage stays within limits.

### Adjusting `osd_memory_target`

- Set the memory target with:
    ````
    ceph config set osd osd_memory_target <desired_value_in_bytes>
    ````
  Example: To set 8 GiB:
    ````
    ceph config set osd osd_memory_target 8589934592
    ````

[^1]: [Ceph Official Documentation – Hardware Recommendations](https://docs.ceph.com/en/quincy/start/hardware-recommendations/#memory)  
[^2]: [Ceph Official Documentation – Automatic Cache Sizing](https://docs.ceph.com/en/quincy/rados/configuration/bluestore-config-ref/?highlight=osd_memory_target#automatic-cache-sizing)  
[^3]: [Red Hat Documentation – OSDs take up more memory than configured](https://access.redhat.com/solutions/6129621)
[^4]: [Ceph Official Documentation - OSD Memory Target Autotuning](https://docs.ceph.com/en/quincy/cephadm/services/osd/?highlight=autotune#automatically-tuning-osd-memory)
