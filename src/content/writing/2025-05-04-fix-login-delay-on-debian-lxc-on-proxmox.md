---
title: "Fix Login Delay on Debian LXC on Proxmox"
slug: "fix-login-delay-on-debian-lxc-on-proxmox"
description: "I recently migrated my ingress from a VM to a container on Proxmox. The primary motivation was that the VM, running Docker with a web server container, was frequently encountering space constraints. This setup felt unnecessarily complex for a simple ingress serving just a two-person household."
date: "2025-05-04T13:23:00.000+05:30"
last edited: "2025-09-04T16:59:42.000+05:30"
tags:
  - "Blog"
  - "Proxmox"
draft: false
image: "/images/ghost/fix-login-delay-on-debian-lxc-on-proxmox-1768729024994.jpg"
---

### The Initial Setup and Challenges

I recently migrated my ingress from a VM to a container on Proxmox. The primary motivation was that the VM, running Docker with a web server container, was frequently encountering space constraints. This setup felt unnecessarily complex for a simple ingress serving just a two-person household.

### Choosing the Right Platform

The decision to move to a Proxmox LXC (LXE) container seemed more appropriate for our scale of operations. As with most of my virtual environments, Debian was my natural choice for the operating system.

### Unexpected Login Delays

While implementing the new setup, I encountered a challenge with Debian. When logging in as root with the configured password, there was a noticeable delay of 5-10 seconds. Though this might seem minor, it became frustrating during frequent administrative tasks.

### The Solution

The root cause was traced to disabled nesting in Proxmox container options. Two solutions emerged:

1.  Enable nesting in Proxmox container settings
2.  Alternatively, mask the systemd-logind service if nesting cannot be enabled

This issue was ultimately identified through a helpful Reddit post, though the exact mechanism causing the delay remains unclear.

## The Cause

`systemd-logind` expects an unprivileged container to have `nesting` enabled as it allows the following features to be available within the container:

-   Namespace creation
-   BPF Permissions
-   CGroup Hierarchy Access

However, in my case, I only have the user `root` and the container is `unprivileged` so the difference isn't much except for `dbus` error on commands like `reboot` or `poweroff`. The webserver already runs as its own user.

In my case, it isn't critical when masking the `systemd-logind` service. However, if you use LXCs for a number of other processes where security is very important, consider enabling the `nesting` option in Proxmox instead. This would allow systemd-logind to impose proper isolation and access control.

## Source

[https://old.reddit.com/r/Proxmox/comments/ph10mb/comment/hbgmgfc](https://old.reddit.com/r/Proxmox/comments/ph10mb/comment/hbgmgfc?ref=kayg.org)