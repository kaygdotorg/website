---
date: 2025-07-29 22:31:14
type:
  - Permanent Note
last edited: 2026-01-18 15:33:11
tags:
  - ceph
  - ceph/osd
  - ceph/disk-ratios
title: Full Ratio
---
## ❓ What?
  
The maximum / threshold percentage of disk space usage before an OSD is considered `full`. This happens after usage has crossed and [nearfull-ratio](<./nearfull-ratio.md>). The default value is 0.95 or 95% of the total available space / capacity.

## ❔ Why?

  
When a ceph cluster approaches full ratio, it sacrifices high availability: the cluster goes read-only at this ratio. All writes that are halted will result in degraded objects (objects that have less than [[Pool Size]] (`size`) ideal copies). Furthermore if the cluster has `min_size 1` then it results in data loss. Therefore it’s not a good production practice.

## 🎤 How?
  
[full-ratio](<./full-ratio.md>) is set during cluster creation on the OSDMap as follows:

```TOML
[global]
[...]
mon_osd_full_ratio = 0.95
```

Afterwards, it can be changed with:

```Bash
ceph osd set-full-ratio
```

In croit, [full-ratio](<./full-ratio.md>) can be changed by visiting Maintenance → Full Ratios (at the bottom):

![backfillfull-ratio](<./backfillfull-ratio/backfillfull-ratio.png>)
## 👓 References

https://docs.ceph.com/en/quincy/rados/configuration/mon-config-ref/#storage-capacity