---
date: 2024-01-17 17:43
last edited: 2026-01-18 15:33:11
title: Full Ratio
---
## ❓ What?
  
The maximum / threshold percentage of disk space usage before an OSD is considered `full`. This happens after usage has crossed [nearfull-ratio](<./20240125-nearfull-ratio.md>). The default value is 0.95 or 95% of the total available space / capacity.

## ❔ Why?

  
When a ceph cluster approaches full ratio, it sacrifices high availability: the cluster goes read-only at this ratio. All writes that are halted will result in degraded objects (objects that have less than Pool Size (`size`) ideal copies). Furthermore if the cluster has `min_size 1` then it results in data loss. Therefore it’s not a good production practice.

## 🎤 How?
  
[full-ratio](<./20240117-full-ratio.md>) is set during cluster creation on the OSDMap as follows:

```toml
[global]
[...]
mon_osd_full_ratio = 0.95
```

Afterwards, it can be changed with:

```bash
ceph osd set-full-ratio
```

In croit, [full-ratio](<./20240117-full-ratio.md>) can be changed by visiting Maintenance → Full Ratios (at the bottom):

![backfillfull-ratio](<./20240125-backfillfull-ratio/backfillfull-ratio.png>)
## 👓 References

https://docs.ceph.com/en/quincy/rados/configuration/mon-config-ref/#storage-capacity
