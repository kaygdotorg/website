---
date: 2024-07-07 15:01
last-edited: 2025-01-05 19:07
title: Static MAC Address for a Linux Bridge on Debian or Proxmox
---
## ❓ What?

Everytime a `systemctl restart networking` is run on Proxmox or the host is rebooted, the bridges `vmbr{0,1,2..}` are assigned different MAC Addresses. Normally this is fine but as I am running my home router as VM, and all traffic needs to pass through it for internet access and inversely, the router needs to assign a static, private address to the proxmox host via a static DHCP lease, changing MAC addresses would mean different IP assignments.

Also, these MAC addresses are also set on the tap/veth interfaces created by Proxmox for VM/CT network communication.  

## 🎤 How?

For a bridge to have a static MAC address, use the `hwaddress` directive for `ifupdown2` instead of the `bridge_hw` directive that used to work with `ifupdown`.

For example:

```ini
auto vmbr0
iface vmbr0 inet static
	address 10.0.0.3/24
	bridge-ports none
	bridge-stp off
	bridge-fd 0
    hwaddress 12:34:56:78:91:bc
```

would result in:

```bash
root@minipc01-at-home:~# ip a
[...]
10: tap1001i0: <BROADCAST,MULTICAST,PROMISC,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UNKNOWN group default qlen 1000
    link/ether 12:c4:9c:91:9a:38 brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.206/24 brd 10.0.0.255 scope global dynamic tap1001i0
       valid_lft 42012sec preferred_lft 42012sec
    inet6 fe80::10c4:9cff:fe91:9a38/64 scope link
       valid_lft forever preferred_lft forever
11: vmbr0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default qlen 1000
    link/ether 12:34:56:78:91:bc brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.3/24 scope global vmbr0
       valid_lft forever preferred_lft forever
[...]
```
  

## 👓 References

https://forum.proxmox.com/threads/how-do-i-configure-static-vmbr0-mac-address.125319/

https://serverfault.com/questions/1127889/debian-where-does-a-bridge-interface-store-its-mac-address-and-how-can-i-change
