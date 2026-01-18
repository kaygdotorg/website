---
title: "Increase Disk Space on Proxmox VM"
description: "Overview

To increase disk space on a Proxmox VM, two steps are required: growing the partition and resizing the filesystem[1].


Commands

 1. Grow the partition:

growpart /dev/sdX Y


Where:

 * sdX is the disk device (e.g., sda, sdb)
 * Y is the partition number

 1. Resize the filesystem:

resize2fs /dev/sdXY


Where:

 * sdXY is the specific partition (e.g., sda1, sdb2)


Prerequisites

The growpart command requires the cloud-utils package to be installed[1:1].


Important Notes

 1. The V"
date: "2024-03-06T23:30:00.000+05:30"
last edited: "2025-09-03T11:57:14.000+05:30"
tags:
  - "Blog"
  - "Proxmox"
draft: false
---

## Overview

To increase disk space on a Proxmox VM, two steps are required: growing the partition and resizing the filesystem\[1\].

## Commands

1.  Grow the partition:

```bash
growpart /dev/sdX Y
```

Where:

-   `sdX` is the disk device (e.g., sda, sdb)
-   `Y` is the partition number

1.  Resize the filesystem:

```bash
resize2fs /dev/sdXY
```

Where:

-   `sdXY` is the specific partition (e.g., sda1, sdb2)

## Prerequisites

The `growpart` command requires the `cloud-utils` package to be installed\[1:1\].

## Important Notes

1.  The VM must be running for these commands to work
2.  Always backup important data before resizing partitions
3.  This process works for ext4 filesystems; other filesystems may require different tools

* * *

1.  [Ask Ubuntu - Resize Partition](https://askubuntu.com/a/937351?ref=kayg.org)