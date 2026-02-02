---
date: 2024-06-02 21:40
last-edited: 2025-01-05 20:21
title: Virtual Router in Proxmox with the Skullsaints Onyx
---
ANOTHER EDIT: Apparently the [hookscript section](<#Proxmox VM Hookscripts>) is what causes me the most headache and is not needed. Since the tap interface is bridged with `vmbr0`, it should not be configured to get an IP. The correct way to do it is to configure an IP and gateway on the bridge `vmbr0` itself like so:

```ini
auto vmbr0
iface vmbr0 inet static
	address 10.0.0.3/24
	gateway 10.0.0.1
	bridge-ports none
	bridge-stp off
	bridge-fd 0
	hwaddress 06:61:cf:2c:2a:b4
```

EDIT: Apparently it's possible to [get rid of the fw* interfaces](<./20241025-rid-fwbr-interfaces-proxmox.md>) when the proxmox firewall is not used, so I am updating the post with the fw* interfaces removed. 

## Preface

Alright, everybody pretty much knows this but since I am speaking to the larger public here: my homelab isn't really at home. It's actually a proxmox cluster from the Hetzner auction, servers that I got for a very reasonable price that I am not willing to part. There are a few reasons why I do this:

1. Hetzner is the king for value. If I bought my hardware (same or equivalent of what I have on Hetzner), it would take me at least 2 years to call it even. 
2. I live at a rented house, getting big chonky servers isn't the best thing to if I have to move out, even, say in a year.
3. I live in a small, rented house (a slightly larger 1 BHK) in Delhi, meaning real estate is limited. The only feasible place for those servers is beside my laptop, on my table - meaning noise. Since my setup is a media cum work station, I can't have any other source of sound when I am watching something.
4. Bandwidth - My ISP, ACT Fibernet, restricts residential connections to 3.3 TB of upload/download per month. Hetzner meanwhile has unlimited allowance (A member of LET did verify this claim and had some trouble going past 250 TB per month but come on, you get my point). 
5. Power - Electricity costs are real, not as bad as Europe but still, living in Delhi equates to at least 8 months of summer which equates to ACs being on most of the year. Just this month, as of writing this article, I woke up to an electricity bill of 8.5k INR. Sheesh.
6. Finally, convenience - It's just easy not having shit to worry about. Hardware failures are all taken care of by Hetzner at no extra cost, and I get brand new replacements for free. One time, my only boot disk - nvme, died at 01:55. I got an alert and I raised a ticket with Hetzner for a replacement. At 02:18, my server had 1 nvme (the replacement) and another nvme (which I requested for, to not prolong the night in the future) installed and my server was already waiting for me to reinstall Proxmox. (For readers worried about backups, I have a separate Proxmox Backup Server that makes restore very easy.)

## Intro

Alright, having said all of that - "what about latency, Gopal?" you might ask, "isn't it masochistic to have 200ms of latency over ssh?" Yeah, you got me. Also, having local hardware is just freaking cool. Make shit, break shit, who cares? As long as it's not production grade or even homelab production grade stuff, really who cares? So yeah, having hardware locally is a great way to learn. More specifically it's a great way to learn one of my pain points - networking. 

So I have been eyeing some miniPCs for a while now, router style - multiple ethernet ports, 2.5 gig, at least one usb 3.0 and all that jazz. Aliexpress is definitely cheaper but I didn't want to wait very long and nor did I want to deal with the notorious custom officers. So I got the [Skullsaints Onyx](https://www.electroniksindia.com/products/skullsaints-onyx-intel-11th-gen-n5105-fanless-mini-industrial-pc-with-4x-2-5g-intel-i226-i225-lan-ddr4-nvme-soft-router-firewall-hdmi2-0-13-ports) instead. Here are a few pictures that make the port selection self-obvious:

![onyx-front](<./20240602-virtual-router-proxmox-skullsaints-onyx/onyx-front.jpg>)
![onyx-back](<./20240602-virtual-router-proxmox-skullsaints-onyx/onyx-back.jpg>)
![onyx-vertical](<./20240602-virtual-router-proxmox-skullsaints-onyx/onyx-vertical.jpg>)

I love the all black too but what I don't love is that Skullsaints may have lied to me about this having 2x RAM slots. As you'll see in the below pictures, there's only one RAM slot available. I have already raised my issue with them and I'll update the post when I have a response.

![onyx-insides](<./20240602-virtual-router-proxmox-skullsaints-onyx/onyx-insides.jpg>)
![onyx-ram](<./20240602-virtual-router-proxmox-skullsaints-onyx/onyx-ram.jpg>)



## The Goal

I already have a router - the Mercusys MR90X that runs OpenWRT and it serves me well. It's a little short on storage and RAM, and for the very little storage, I have compile tailscale myself into a combined binary, run it through UPX for a much shorter file size. Other than that quirk, I have no other issues with it. Speeds over WiFi go upto 750 Mbits at best and 300 Mbits, if I am a room apart. When I am at my desk, I connect my Mac to ethernet via a dock.

The MiniPC is to partly replace it, the LAN bit, maybe WiFi too in the future but no definite plans yet. Here's a visual (drawn with my new iPad which I am yet to make a post about) first:

![virtual-router-goal](<./20240602-virtual-router-proxmox-skullsaints-onyx/virtual-router-goal.png>)

These are the components in the picture:
- My ISP's unit is my gateway to the internet. ACT's unit is the single uplink which provides my router with a static IP via PPPoE. 
- The static IP should be assigned to the OpenWRT VM that runs in Proxmox, which is installed on the MiniPC.
	- All 4 NICs of the MiniPC are to be passed through, along with two linux bridges - one for the management network (for Proxmox to have internet access), one for other VMs to talk to each other. The OpenWRT VM should assign a static, reliable IP to Proxmox while providing random addresses via DHCP to other VMs.
- The second NIC is connected to my other router - Mercusys MR90X which will bridge the devices connected to it. I don't want the AP to have its own NAT.
- The OpenWRT VM would then assign random addresses via DHCP, much like to VMs, to all the devices at home.

## Proof of Concept

I live with my girlfriend. If the internet breaks, there's reasonable havoc. If the internet breaks and is down, it's the calm before the storm. Joking aside, she's very supportive of my testing. I break shit often and she is very understanding. Still, I like my services to be reliable and I like to minimise downtime. So for now, to make sure everything will work when I finally switch routers, here's a visual that I tested:

![virtual-router-poc](<./20240602-virtual-router-proxmox-skullsaints-onyx/virtual-router-poc.png>)

Basically, my existing router stays and handles the uplink. It assigns, via DHCP, random addresses to everything - OpenWRT VM (fixed static lease), Proxmox (bridged to be on the same subnet by OpenWRT VM) and other physical devices such as my phone, ipad and my mac.

## The PoC Setup

### Installing OpenWRT in a VM on Proxmox

I installed Proxmox via the official ISO, booted through Ventoy with secure boot enabled. That requires another post of its own. For now, let's focus on OpenWRT. 

Installing OpenWRT was made very easy by this person's gist: https://gist.github.com/ryuheechul/e829b7846a965638deeb122bdd0b403c

Steps: Create a new generic VM, download and extract the generic ext4 tarball, resize and import the image with `qemu-resize` and `qm import`, remove the existing disk so that the VM uses the one we imported. 

### Passing through the NICs

I didn't want any NICs on the Proxmox host as I want the OpenWRT VM as my only (virtual) networking machine. Passing through the NICs is straightforward. On the VM, Add PCI Device, choose each NIC with All Functions with PCI Express toggle checked.

![virtual-router-nic-passthrough](<./20240602-virtual-router-proxmox-skullsaints-onyx/virtual-router-nic-passthrough.png>)

### Bridge Configuration on Proxmox

Since we have passed all the NICs to the VM, we still need networking/internet on the host. Effectively, what we have to do is make Proxmox a client of the OpenWRT VM, the same way VMs would normally be the clients and Proxmox the router. To do that, we are passing one more bridge to the OpenWRT VM that would make this intercommunication possible. 

For the bridge itself, `vmbr0`, the configuration looks like this:

```ini
# cat /etc/network/interfaces
auto lo
iface lo inet loopback

auto vmbr0
iface vmbr0 inet static
    bridge-ports none
    bridge-stp off
    bridge-fd 0
```

#### No IP Address on vmbr0, why?

Because Proxmox creates a tap interface ~~and two firewall interfaces~~ that handle the VM's network namespace. For example, here are the additional network interfaces that are created once the VM is started. The IPs are assigned by existing router, Mercusys MR90X.

```bash
# ip addr show
[...]
9: tap100i0: <BROADCAST,MULTICAST,PROMISC,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast master fwbr100i0 state UNKNOWN group default qlen 1000
    link/ether de:1e:e5:90:af:9f brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.209/24 brd 10.0.0.255 scope global dynamic tap100i0
       valid_lft 40565sec preferred_lft 40565sec
10: vmbr0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UNKNOWN group default qlen 1000
    link/ether c2:a2:32:05:03:0f brd ff:ff:ff:ff:ff:ff
    inet6 fe80::c0a2:32ff:fe05:30f/64 scope link
       valid_lft forever preferred_lft forever
```

#### Why is the TAP interface created?

Apparently, TAP interfaces are created to tunnel traffic in and out of VMs by Proxmox. I know that's a vague explanation but TUN/TAP is a topic I am still investigating and haven't been able to wrap my head around yet.

### Configuration inside OpenWRT

OpenWRT does not know which ones are the real NICs and which one is virtual. In my case, eth1 was my uplink while eth0 was the virtual bridge - `vmbr0`. In order to connect Proxmox the uplink, those two interfaces need to be bridged and they also need to be on the same subnet. The easiest way to do that is to use the existing lan bridge - `br-lan` on OpenWRT and set it to bridge these two interfaces. This can be done by navigating to Network → Interfaces → Devices and clicking on "Configure" for `br-lan`. 

The important bit here is to make sure `br-lan` has the MAC Address of our uplink (`eth1`), not the virtual bridge (`eth0`). This is because our external gateway (Mercusys MR90X) would assign a fixed lease (static private IP) for our virtual OpenWRT based on its MAC Address.  
  
![virtual-router-openwrt-configuration](<./20240602-virtual-router-proxmox-skullsaints-onyx/virtual-router-openwrt-configuration.png>)

Once that's done, set the interface `br-lan` to be a DHCP client, so it asks for an IP assignment from our external gateway.

![virtual-router-openwrt-br-lan-dhcp](<./20240602-virtual-router-proxmox-skullsaints-onyx/virtual-router-openwrt-br-lan-dhcp.png>)

Here's an overview of what everything looks like so far:
![virtual-router-openwrt-interfaces-overview](<./20240602-virtual-router-proxmox-skullsaints-onyx/virtual-router-openwrt-interfaces-overview.png>)


Let's confirm internet connectivity for our PoC Router:

```bash
# ping kayg.org
PING kayg.org (104.21.27.159): 56 data bytes
64 bytes from 104.21.27.159: seq=0 ttl=52 time=77.602 ms
64 bytes from 104.21.27.159: seq=1 ttl=52 time=77.828 ms
64 bytes from 104.21.27.159: seq=2 ttl=52 time=77.731 ms
64 bytes from 104.21.27.159: seq=3 ttl=52 time=77.596 ms
^C
--- kayg.org ping statistics ---
4 packets transmitted, 4 packets received, 0% packet loss
round-trip min/avg/max = 77.596/77.689/77.828 ms
```

Once our OpenWRT VM has internet, install `qemu-ga`, enable the service with `/etc/init.d/qemu-ga enable` and poweroff the VM (not reboot). Then turn it on. This is essential for a later step.

Yay, that works well. What about our Proxmox host?

```bash
# ping kayg.org
PING kayg.org (172.67.143.60) 56(84) bytes of data.
64 bytes from 172.67.143.60 (172.67.143.60): icmp_seq=1 ttl=53 time=72.1 ms
64 bytes from 172.67.143.60 (172.67.143.60): icmp_seq=2 ttl=53 time=72.1 ms
64 bytes from 172.67.143.60 (172.67.143.60): icmp_seq=3 ttl=53 time=72.4 ms
64 bytes from 172.67.143.60 (172.67.143.60): icmp_seq=4 ttl=53 time=72.4 ms
^C
--- kayg.org ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3002ms
rtt min/avg/max/mdev = 72.077/72.258/72.432/0.159 ms
```

It works too but... it only does because I have already made additional configuration to do so. You see, Proxmox is also a dhcp client now. So let's back up a little to where we listed out the network interfaces available to Proxmox after the router vm's startup.

```bash
# ip addr show
[...]
9: tap100i0: <BROADCAST,MULTICAST,PROMISC,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast master fwbr100i0 state UNKNOWN group default qlen 1000
    link/ether de:1e:e5:90:af:9f brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.209/24 brd 10.0.0.255 scope global dynamic tap100i0
       valid_lft 40565sec preferred_lft 40565sec
10: vmbr0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UNKNOWN group default qlen 1000
    link/ether c2:a2:32:05:03:0f brd ff:ff:ff:ff:ff:ff
    inet6 fe80::c0a2:32ff:fe05:30f/64 scope link
       valid_lft forever preferred_lft forever
```

The tap ~~and fwbr~~ interface~~s~~ already has an IP address. How can that be? We never configured it to be a dhcp client. That's because two more steps are necessary for Proxmox to get internet and I have already performed them.

### Configuration for Proxmox

We have a few requirements:

1. Proxmox is a DHCP client but it should get the same IP everytime. That is, a fixed lease is needed on the external gateway but moreso, the MAC address of the bridge (tap, fwbr) interface should remain same.
2. Proxmox needs a networking restart after it receives IP assignments via DHCP. Otherwise it does not respond to packets.
3. Proxmox should ask for IP assignment after the OpenWRT VM has started AND has gotten an IP from our external gateway.

Let's tackle all the problems!

#### Proxmox VM Hookscripts


> [!NOTE] NO LONGER NEEDED
> This hookscript will cause problems such as a DHCP broadcast from travelling through the bridge and should be avoided.


With[ a snippet of documentation](https://pve.proxmox.com/pve-docs/pve-admin-guide.html#_hookscripts), Proxmox has a feature called hookscripts which is basically what it sounds like: do an action based on a trigger. In this case, the trigger is set. Proxmox will run your hookscripts before and after the VM starts, and before and after the VM stops. The onus is on the user to configure the hookscript to choose between those triggers. ... and the hookscripts must be in perl!

Luckily, Proxmox provides an example hookscript at `/usr/share/pve-docs/examples/guest-example-hookscript.pl` and it looks like this:

```perl
#!/usr/bin/perl

# Exmple hook script for PVE guests (hookscript config option)
# You can set this via pct/qm with
# pct set <vmid> -hookscript <volume-id>
# qm set <vmid> -hookscript <volume-id>
# where <volume-id> has to be an executable file in the snippets folder
# of any storage with directories e.g.:
# qm set 100 -hookscript local:snippets/hookscript.pl

use strict;
use warnings;

print "GUEST HOOK: " . join(' ', @ARGV). "\n";

# First argument is the vmid

my $vmid = shift;

# Second argument is the phase

my $phase = shift;

if ($phase eq 'pre-start') {

    # First phase 'pre-start' will be executed before the guest
    # is started. Exiting with a code != 0 will abort the start

    print "$vmid is starting, doing preparations.\n";

    # print "preparations failed, aborting."
    # exit(1);

} elsif ($phase eq 'post-start') {

    # Second phase 'post-start' will be executed after the guest
    # successfully started.

    print "$vmid started successfully.\n";

} elsif ($phase eq 'pre-stop') {

    # Third phase 'pre-stop' will be executed before stopping the guest
    # via the API. Will not be executed if the guest is stopped from
    # within e.g., with a 'poweroff'

    print "$vmid will be stopped.\n";

} elsif ($phase eq 'post-stop') {

    # Last phase 'post-stop' will be executed after the guest stopped.
    # This should even be executed in case the guest crashes or stopped
    # unexpectedly.

    print "$vmid stopped. Doing cleanup.\n";

} else {
    die "got unknown phase '$phase'\n";
}

exit(0);
```

While I don't necessarily understand perl, I do understand bash which means I'll make perl call bash. Using bash, there are two important problems to solve:

1. Run `dhclient` after VM starts and gets an IP address. 
   
   This is solved by simply running `/usr/sbin/dhclient`.
   
2. To get the same IP everytime, one of the interfaces need to have a fixed MAC Address. To set a fixed MAC, we can use `ip link set <dev> address <mac-address>`.
   
   ~~And apparently, it needs to be the `fwpr100p` interface. I haven't figured out why yet.~~
   
> [!NOTE] fwpr interface
> If the NIC has the firewall toggle enabled then as shown below, `fwbr100i0` is indeed the default gateway interface. If it's not then the outgoing interface is simply the interface that is used for tunnelling traffic in and out of the VM: `tap100i0`.
   
   An `ip route` confirms my guess.   
```bash
# ip route
default via 10.0.0.1 dev fwbr100i0
10.0.0.0/24 dev fwbr100i0 proto kernel scope link src 10.0.0.188
10.0.0.0/24 dev fwpr100p0 proto kernel scope link src 10.0.0.172
10.0.0.0/24 dev tap100i0 proto kernel scope link src 10.0.0.209  
```
		
3. Run `systemctl restart networking` once Proxmox's interfaces get an IP address.
   
   This is solved by making sure the command runs after `dhclient`.

4. Make sure the above happens only after OpenWRT's network is ready. If not, wait.
   
   This is solved my simply checking whether the VM has had an ip assignment or not: `/usr/sbin/qm guest cmd 100 network-get-interfaces | /usr/bin/grep '101'` (10.0.0.101 is the static lease for my VM by my external gateway).

The whole thing looks like this and is added in the `post-start` phase of the perl script:

```perl
[...]
system("while ! /usr/sbin/qm guest cmd 100 network-get-interfaces | /usr/bin/grep '101'; do sleep 5; done; ip link set tap100i0 address 06:61:cf:2c:2a:b4 &&  /usr/sbin/dhclient && /usr/bin/systemctl restart networking")
[...]
```

Once the script is copied and modified as above, make sure your proxmox has a storage type that support snippets. Mine looks like this:

```ini
# cat /etc/pve/storage.cfg
dir: local
	path /var/lib/vz
	content vztmpl,backup,iso,snippets
[...]
```

Then copy the hookscript into the snippets directly. Mine is `/var/lib/vz/snippets`. Once that's done, it needs to be added to the VM by running the equivalent command:

```bash
# qm set 100 --hookscript local:snippets/100-post-start.pl
update VM 100: -hookscript local:snippets/100-post-start.pl
```
Also set the VM to auto start so we don't have any delays in our networking.

```bash
# qm set --onboot 1 100
update VM 100: -onboot 1
```
## Summary and Thoughts

Now whenever our Proxmox host boots up, the openWRT VM is autostarted and has 4 NICs passed through along with the virtual bridge of Proxmox. The hookscript is triggered as soon as the VM starts and it waits for the VM to get an IP address assigned. This means if the LAN cable is not plugged in, it'll keep waiting. Once an IP is assigned to the VM, the hookscript proceeds to set a fixed mac for the outgoing firewall interface, asks for IP addresses for its tap and firewall interfaces and then restarts the networking service on the host.

While it looks like a lot of effort to a new reader, it really did take me a weekend to figure it out and write about it. The setup itself works seamlessly across multiple reboots and manual restarts of the VM. Of course, it's still a PoC and not production yet, but maybe that's for another weekend. 
