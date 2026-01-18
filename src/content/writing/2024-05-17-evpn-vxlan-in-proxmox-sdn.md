---
title: "EVPN + VXLAN in Proxmox SDN"
slug: "evpn-vxlan-in-proxmox-sdn"
description: "❓ What? EVPN is the control plane that's responsible for populating the forwarding table and the routing table, while VXLAN is the data plane that's responsible"
date: "2024-05-17T22:59:00.000+05:30"
last edited: "2025-09-01T21:17:11.000+05:30"
tags:
  - "Blog"
  - "Proxmox"
draft: false
---

## ❓ What?

EVPN is the control plane that's responsible for populating the forwarding table and the routing table, while VXLAN is the data plane that's responsible for carry packets between the addresses in the routing table.

## ❔ Why?

EVPN + VXLAN is a necessary step in configuring Proxmox how I want it to function:  
1\. One zone with multiple VNets that have [VLAN tags](https://kayg.org/talks/vlans-in-proxmox/).  
2\. VMs in any node can access each other and can access the internet.  
3\. All network configuration is done only once via `Datacenter` and can be done through the GUI.

## 👓 References

[https://youtu.be/cdvstTm467k](https://youtu.be/cdvstTm467k?ref=kayg.org)