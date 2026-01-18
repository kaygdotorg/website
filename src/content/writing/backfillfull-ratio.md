---
date: 2024-01-25 11:16
type:
  - Permanent Note
last edited: 2025-04-10 16:09
tags:
  - ceph/osd
  - ceph
  - ceph/disk-ratios
title: Backfillfull Ratio
---
## ❓ What?

The maximum or threshold percentage of disk space that can be used before an OSD is considered too full to backfill. This ratio is reached after crossing [nearfull-ratio](<./nearfull-ratio.md>). Once utilisation crosses [backfillfull-ratio](<./backfillfull-ratio.md>), it reaches [full-ratio](<./full-ratio.md>). The default value is 0.90 or 90% of the total available space.

## 🎤 How?

The parameter is set during cluster creation in the OSDMap as:

```toml
[global]
[...]
mon_osd_backfillfull_ratio = 0.95
```

Afterwards, it can be changed by running the following on the admin node:

```toml
ceph osd set-backfillfull-ratio
```

On croit, it can be changed by navigating to Maintenance → Full Ratios (at the bottom):

![backfillfull-ratio](<./backfillfull-ratio/backfillfull-ratio.png>)
## 👓 References
---
https://docs.ceph.com/en/quincy/rados/configuration/mon-config-ref/#storage-capacity