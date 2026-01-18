---
date: 2023-09-04 20:42
last edited: 2025-01-02 22:50
tags:
  - ceph
  - osd
  - scrub
title: Ceph Spurious Read Errors
---
## Overview

Transient read errors in [ceph](<./ceph.md>) (also referred to as spurious read errors) are failures that occur briefly and then resolve on subsequent attempts. Ceph retries the read operation up to four times. If all four attempts fail, Ceph concludes that the disk copy is compromised and shifts to a healthy replica.

## Transient vs. Persistent Errors

- **Spurious Error**: Happens once, then disappears after one or more retries.  
- **Persistent Error**: Occurs four times in a row, prompting Ceph to switch away from the faulty disk.

Because spurious failures do not produce error alerts, you might never realize they occurred unless deeper integrity checks are performed.

## Deep Scrub

A [[deep scrub]] operation examines data blocks and verifies checksums to detect inconsistencies. If corruption is found, it is repaired using valid replicas, thus protecting the cluster from both silent and repeated read errors. Scheduling deep scrubs regularly is critical. Otherwise, fleeting disk malfunctions might remain hidden indefinitely and never trigger a warning.

[^1]: [Ceph Deep Scrub Documentation (official)](https://docs.ceph.com/en/latest/rados/operations/scrub/)  
[^2]: [IBM Documentation on Ceph Clusters](https://www.ibm.com/docs/en/storage-ceph)