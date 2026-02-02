---
date: 2024-05-12 21:17
last-edited: 2025-01-05 20:18
title: Migrating VMs on Encrypted Proxmox
---
## The Problem

  I have three Proxmox nodes, two of them I installed with zfs native encryption (after switching from LUKS encryption, learning about the two disk overhead) and the third one I installed without encryption after learning that my experiment to learn more about Proxmox HA is blocked by [this Proxmox bug](https://bugzilla.proxmox.com/show_bug.cgi?id=2350) which is blocked by [this ZFS bug](https://github.com/openzfs/zfs/issues/10507). All 3 nodes were installed following the [OpenZFS guide on installing Debian (current version) with ZFS](https://openzfs.github.io/openzfs-docs/Getting%20Started/Debian/Debian%20Bookworm%20Root%20on%20ZFS.html). The encryption part is therefore left to the VMs themselves. 

  This is my attempt to migrate the workload off the native-zfs-encrypted nodes into the unencrypted node, reinstall Proxmox on the first two nodes without encryption, migrate the VMs back or setup HA with a replication job.

## Possible Solutions

- Obviously, right click -> migrate or live migrate is a no-go because datasets are encrypted. 
- [remote-migrate](https://pve.proxmox.com/pve-docs/qm.1.html) (a tool for migrating vms/cts to a remote cluster) could've been it but is blocked by the fact that:
	- cloud-init drives are not supported
	- linked clones are not supported
	- source and destination storages must support the exact same types
	- mismatched pve versions (between source and destination) are not supported
	- (my setup violates the first two criteria)
- Back up to my PBS and Restore from PBS on the second node is the first viable option but:
	- Verifying backup indices just takes too long on HDDs. I did a test run and a 2 TB HDD and the restore took upwards of 12 hours. 
	- Still it's the most convenient / safest option so the process is already in place for the production VM.
- Splitting mirror disks, creating another zpool and creating a PVE storage pool on it, moving the VM disks to the new storage pool and then right click -> migrate:
	- This is an exciting option. Sure, the disks don't have redundancy for what seems to be a much less time-consuming process (500G cloned in less than an hour as of now).

The plan is to pick solutions 3 and 4, and see what I learn from the whole process. Data integrity is of utmost importance and the VM stays off for the whole duration of this process. 
