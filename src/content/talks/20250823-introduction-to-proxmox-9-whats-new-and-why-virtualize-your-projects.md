---
title: "Introduction to Proxmox 9: What's New and Why Virtualize Your Projects?"
description: "Proxmox 9 was recently released and brings in a lot of features that might cater to the advanced. However, with this new release, they bring an end to one of my biggest complaints to Proxmox: the mobile UI - it simply sucked: both the mobile web and mobile app. "
date: 2025-08-23 18:47:00
last edited: 2026-01-19 21:44:29
cover-image: "./20250823-introduction-to-proxmox-9-whats-new-and-why-virtualize-your-projects/cover-1768838912486.jpeg"
---
# Talk Info 

Event: [https://fossunited.org/c/delhi/2025-aug](https://fossunited.org/c/delhi/2025-aug?ref=kayg.org)  

Location: Essentia.dev office, Sector 62, Noida  
  
Presentation here: [https://s.craft.me/xFC3j1QnxJIKIn](https://s.craft.me/xFC3j1QnxJIKIn?ref=kayg.org)

## Proposal Description

- Proxmox 9 was recently released and brings in a lot of features that might cater to the advanced. However, with this new release, they bring an end to one of my biggest complaints to Proxmox: the mobile UI - it simply sucked: both the mobile web and mobile app. The latter sees no improvement but the former has seen a lot of improvements, all of which combined warrant a fresh look at the product.  
    
-   This presentation will go over the following topics:
    -   My journey with Proxmox - I went from being completely pro-baremetal to pro-virtualisation in the span of 2 years where many things increasingly convinced me that the latter approach suits a simultaneous project work-style far better. Even kubernetes recommends running “workers” as VMs!
    -   What’s new with Proxmox 9 - ZFS improvements, new HA and SDN sauce, VM snapshots on thick-LVM on iSCSI drives
    -   SImple ways to get started with Proxmox as a complete noob - Often the easiest way is to start small. All the usual switch-to-Linux rules apply: use a spare laptop, spare PC, dual boot, etc.
    -   Usecases - Homelab, Enterprise
    -   How virtualising your projects gives you infinite flexibility in terms of undo → redo → experiment, all while running actual production services - be it off of a minipc on top of a fridge or a rack full of AMD EPYC servers in a Datacenter in Gurgaon. 

## Key Takeaways from this talk

-   Familiarity with Proxmox, especially 9.0.
-   Head-start to self-hosting services with the ability to make infinite mistakes and then recover with no trouble. All of this is on a separate host so no interference with the personal/work machine.
-   Head-start to concepts like virtualisation, high-availability, HA groups, fencing, shared-storage: all of which obviously makes sense in an enterprise setup but might also make sense in a homelab depending on how seriously the audience takes their setup.