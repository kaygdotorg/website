---
date: 2024-05-17 22:59:00
last-edited: 2026-01-19 22:11:00
title: EVPN + VXLAN in Proxmox SDN
---
## ❓ What?

EVPN is the control plane that's responsible for populating the forwarding table and the routing table, while VXLAN is the data plane that's responsible for carry packets between the addresses in the routing table. 

## ❔ Why?

EVPN + VXLAN is a necessary step in configuring [proxmox](<./20240809-proxmox.md>) how I want it to function:
	1. One zone with multiple VNets that have [VLAN tags](<../talks/vlans-proxmox.md>).
	2. VMs in any node can access each other and can access the internet. 
	3. All network configuration is done only once via `Datacenter` and can be done through the GUI.
## 👓 References

https://arc.net/folder/E0A1911A-8663-43C5-A516-8D221FE34221

https://youtu.be/cdvstTm467k
