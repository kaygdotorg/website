---
date: 2025-04-07 21:58:23
last edited: 2026-01-18 15:30:44
tags:
  - talk/proxmox
  - talk/zfs
  - talk
  - proxmox
  - project/learning-proxmox
  - zfs
  - talk/cfp
title: FOSS United Talk - Migrating VMs between Proxmox Nodes backed by ZFS Native Encryption
---
- Derived from [migrating-vms-encrypted-proxmox](<./migrating-vms-encrypted-proxmox.md>)
- Submitted to [FOSSUnited May 2024 Meetup](https://fossunited.org/events/delhi_may_2024/cfp/vs7goo211l)
	- Rejected because I had [another talk for the same meetup](<./ilug-d-talk-ceph-rgw-multi-site.md>).
## Intro (or the Problem)

Encryption is all the buzz these days. In a hypervisor environment, it is reasonable to have some kind of encryption. Should the hypervisor handle that or should the user? To be more specific, we are talking about server side encryption or SSE or encryption at rest. This encryption at rest can be achieved in the following ways:

- Let Linux handle it with LUKS - but if you do and you have redundancy with ZFS, you pay the N write overhead (data is encrypted N times instead of once, N being the number of disks).
- Let ZFS handle it - but if you do, you can't really migrate VMs on Proxmox because ZFS does not allow sending and receiving datasets with properties included if the dataset is encrypted. You can either send the dataset as a raw stream, that is, it turns up encrypted with the same key on the other side or you can send the dataset with no properties (compression, recordsize, etc) included, that is you have to reapply the specific properties of the dataset once it's fully received on the other side. However, Proxmox supports neither method. Proxmox only supports sending VMs (and thus zvols / datasets) with properties included. 
- Let the user handle it...? Maybe the most convenient option for now, and the only viable option if you want to use and learn about Proxmox HA.

## Possible Solutions

This talk is about moving VMs (and containers) that are already on such a ZFS native encrypted Proxmox setup to a Proxmox setup that is set up without encryption (one that puts the onus on the user instead). There are a few strategies we can go through here:

- Use the [proxmox](<./proxmox.md>) Migration / Live Migration
	- Obviously not possible because of issues highlighted before.
- [remote-migrate](https://pve.proxmox.com/pve-docs/qm.1.html) (a tool for migrating vms/cts to a remote cluster) could've been it but is blocked by the fact that:
	- cloud-init drives are not supported
	- linked clones are not supported
	- source and destination storages must support the exact same types
	- mismatched pve versions (between source and destination) are not supported
- Backup to a common destination, like PBS, and restore from that same PBS.	
	- This not only works but is the most convenient solution. It requires the least administrator involvement but if the proxmox VMs have disks backed by HDDs, and they are in 100s of gigabytes or more, verifying the backup index takes a long time for these disks. As an example, for my nodes connected with gigabit fiber, my personal media VM took 39547 seconds just for the 2 TB disk (1.6T full) backed by HDD.
- Splitting redundant disks, creating a replica pool, moving each VM disk to the replica pool, deleting the old pool, renaming the new pool with the old pool's name, and then migrating the VMs (live migration would then be an option).	
	- As the description would give it away, this is a very involved process but is faster than backup and restore. Downtime is likely less than expected because it opens up the pathway to live migration. However, this only makes sense for a Proxmox node with few VMs, as creating full clones of each disk would likely require multiple user interventions.

## Takeaways

The idea is to make the audience familiar with Proxmox, and introduce a few intricacies even experienced users of Proxmox might face in the future. High Availability is a hot topic, and is a very useful practice by itself for small and large organisations alike. Even homelabbers such as myself employ high availability where they can. Employing HA at the hypervisor level, like in Proxmox, makes services reliable for any sort of disruption: upgrades/reboots, power loss, data corruption, and could be seen as the second level of defense on top of application level HA. 