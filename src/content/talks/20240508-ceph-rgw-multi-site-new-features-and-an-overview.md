---
title: "Ceph RGW Multi-Site - New Features and An Overview"
description: "Intro

Formally described as \"devops and a storage engineer,\" but I would say I am the devops who's not very keen on the cloud, and is more interested in making his cloud. The basis of any sort of distributed system is storage, and that's where my interests lie these days. I took to Ceph first and then Proxmox next. While both are key areas to where I am employed as a support guy (https://croit.io), Proxmox rules over my homelab while the density of my wallet doesn't really align with deploying "
date: "2024-05-08T17:37:00.000+05:30"
last edited: "2025-09-01T20:15:12.000+05:30"
draft: true
---

## Intro

Formally described as "devops and a storage engineer," but I would say I am the devops who's not very keen on the cloud, and is more interested in making his cloud. The basis of any sort of distributed system is storage, and that's where my interests lie these days. I took to Ceph first and then Proxmox next. While both are key areas to where I am employed as a support guy ([https://croit.io](https://croit.io/?ref=kayg.org)), Proxmox rules over my homelab while the density of my wallet doesn't really align with deploying Ceph, production style, for such a small scale.

If you liked that, there's more about me and what I do on my website: [https://kayg.org](https://kayg.org/)

## Talk Abstract

The cloud isn't all-consuming. Multiple clouds? Maybe. How do you sync your data between datacenters? Sure, rclone is a nice enough tool but then how do you integrate it with ceph if you want 2 way replication? Is there something easier that comes with ceph that does not require a lot of glue? Sure there is. Ceph's RADOS Gateway features multi-site that enables geographically distributed object storage deployments by allowing buckets to be replicated across multiple Ceph clusters. Not only does this allow a global namespace, but this also facilitates disaster recovery.

In this talk, we will glance over the architecture, synchronisation modes, fail-over/disaster recovery capabilities and new features introduced in new ceph release, Reef. Realms, zonegroups, and zones make up the multi-site architecture, allowing for asynchronous data replication, but restricting metadata operations to the master zone. The modes of synchronisation vary between a full sync, metadata only sync and selective sync. Each zone can operate independently without the other and recover once they are fully functional, making the fail-over part of it quite reliable. The shiny bits are the fresh additions in Reef which allow for compression of objects before they are server-side encrypted and dynamic resharding of buckets across zones.

## Takeaways and Use-cases

Ceph's multi-site isn't an easy topic to grok, contrastingly so the documentation and the terms can be overwhelming to a new ceph user or even to somebody who's been working with Ceph, RGW but has not worked with multi-site. If everything goes well, within the length of the presentation, the aim is to have the audience grasp and leave with a deeper or at least a good enough understanding of how multi-site functions and what practical use-cases they might get out of it.

## 👓 References

[https://docs.ceph.com/en/reef/radosgw/multisite/#zone-features](https://docs.ceph.com/en/reef/radosgw/multisite/?ref=kayg.org#zone-features)

[https://docs.ceph.com/en/latest/radosgw/multisite/#multisite](https://docs.ceph.com/en/latest/radosgw/multisite/?ref=kayg.org#multisite)