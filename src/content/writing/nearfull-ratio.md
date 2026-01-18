---
date: 2024-01-25 11:25
type:
  - Permanent Note
tags:
  - ceph
  - ceph/osd
  - ceph/disk-ratios
last edited: 2025-04-10 13:26
title: Nearfull Ratio
---
## ❓ What? 

`mon_osd_nearfull_ratio` is the maximum / threshold percentage of disk space used before an OSD is considered as a [nearfull-osd](<./nearfull-osd.md>). When utilisation crosses [nearfull-ratio](<./nearfull-ratio.md>), it can reach [backfillfull-ratio](<./backfillfull-ratio.md>) and [full-ratio](<./full-ratio.md>). The default value is 0.85 or 85% of the total available space / capacity.

## ❔ Why?

The ratio is set as a way to alert and prevent OSDs/disks from reaching [backfillfull-ratio](<./backfillfull-ratio.md>) and [full-ratio](<./full-ratio.md>). 

On croit / IBM / SUSE, once [nearfull-ratio](<./nearfull-ratio.md>) is reached, pools in the cluster are marked read-only until the [nearfull-ratio](<./nearfull-ratio.md>) is increased or more storage space is added or the cluster is balanced in a way that no OSD reaches [nearfull-ratio](<./nearfull-ratio.md>). 

On ceph, pools are read-only when [full-ratio](<./full-ratio.md>) is reached.

## 🎤 How?

It is set on the OSDMap during cluster creation with this parameter:

```toml
[global]
[...]
mon_osd_nearfull_ratio = 0.85
```

If the setting is to be changed after cluster creation, one can do so with:

```toml
ceph osd set-nearfull-ratio 0.85
```

On croit, one can do this by adjusting the sliders at Maintenance → Full Ratios (at the bottom):
 
![backfillfull-ratio](<./backfillfull-ratio/backfillfull-ratio.png>)
## 👓 References

https://docs.ceph.com/en/quincy/rados/configuration/mon-config-ref/#storage-capacity