---
title: "Bridge MTUs in Proxmox"
slug: "bridge-mtus-in-proxmox"
description: "❓ What? General Networking says that: * if 1 packet < 1x MTU → packet goes through (that's why most VPNs choose a low enough MTU to cater to all networks) * if "
date: "2024-08-09T17:14:00.000+05:30"
last edited: "2025-09-01T21:28:02.000+05:30"
tags:
  - "Blog"
  - "Proxmox"
draft: false
---

## ❓ What?

General Networking says that:

-   if 1 packet < 1x MTU → packet goes through (that's why most VPNs choose a low enough MTU to cater to all networks)
-   if 1 packet > 1x MTU → packet might go through via fragmentation meaning a performance penalty or dropped silently to avoid said performance penalty
-   if 1 packet = 1x MTU → packet goes through

So if LXC / VM NIC MTU isn't the same as bridge MTU, in the logs there might a few cases of:

-   recv error - connection reset by peer
-   i/o timeout

and if it's a web service then the page might appear to be loading or get stuck partially loaded.

## ❔ Why?

This is a cause of MTU mismatch. With Proxmox LXCs, the veths already take on the value of the Proxmox network bridge. The veth configuration looks like this:

![./bridge-mtu-proxmox/proxmox-lxc-veth-mtu.png](/images/ghost/bridge-mtus-in-proxmox-1768729028596.png)

But with VMs, that is not the case. A value of `1` needs to be entered manually.

💡

This has been fixed with [Proxmox 9](https://pve.proxmox.com/wiki/Roadmap?ref=kayg.org#Proxmox_VE_9.0).  
  
\> Leaving the MTU field for a VirtIO vNIC unset now defaults to the bridge MTU, rather than MTU 1500.

![./bridge-mtu-proxmox/proxmox-vm-nic-mtu.png](/images/ghost/bridge-mtus-in-proxmox-1768729028623.png)

## 🎤 When is it a problem?

One of the problems can be when using [EVPN + VXLAN on Proxmox](https://kayg.org/blog/evpn-vxlan-in-proxmox-sdn/) where the [bridge MTU size is 1450](https://pve.proxmox.com/pve-docs/pve-admin-guide.html?ref=kayg.org#pvesdn_zone_plugin_evpn) while all VM NICs have a default of 1500 MTU. Of course one might never notice it if they rely on a VPN like tailscale for all inter-vm communication like I do but if there's a time where VMs have to be reached via the EVPN network then MTU mismatch is definitely a showstopper.

## 👓 References

[https://pve.proxmox.com/pve-docs/pve-admin-guide.html#pvesdn\_zone\_plugin\_evpn](https://pve.proxmox.com/pve-docs/pve-admin-guide.html?ref=kayg.org#pvesdn_zone_plugin_evpn)