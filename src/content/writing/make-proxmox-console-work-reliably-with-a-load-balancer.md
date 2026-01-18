---
title: "Make Proxmox Console Work Reliably with a Load Balancer"
description: "Now on YouTube
As a short for now: https://youtube.com/shorts/HhuazMfbDiM


The Problem

Everybody around me knows that I am a big fan of Proxmox but very few people know that even though I load balance it, my heart races everytime I click on the console page of any VM or Container, and more often that not, I end up navigating to a particular node's web UI and clicking on the Console from there.

This is because my load balancer (caddy) has had a long standing not-a-bug bug misconfiguration that"
date: "2024-07-13T19:36:00.000+05:30"
last edited: "2025-08-27T14:50:12.000+05:30"
tags:
  - "Blog"
draft: false
---

> Now on YouTube  
> As a short for now: [https://youtube.com/shorts/HhuazMfbDiM](https://youtube.com/shorts/HhuazMfbDiM?ref=kayg.org)

## The Problem

Everybody around me knows that I am a big fan of Proxmox but very few people know that even though I load balance it, my heart races everytime I click on the console page of any VM or Container, and more often that not, I end up navigating to a particular node's web UI and clicking on the Console from there.

This is because my load balancer (caddy) has had a long standing not-a-bug bug misconfiguration that made every request originating from a single client be sent to a different backend. I mean that's what load balancing really is but for websockets, that is not so ideal. That is because websockets expect to serve the client that made the request. So if my browser asks node1 for a websocket and literally a second later expects a response from node2 for the same websocket, node1 is kept waiting indefinitely until a request reaches it again, expecting the connection to be resumed.

## The Solution

The solution is simple: make caddy map one backend to one client IP for the duration of their connection. This is done by simply specifying the load balancing policy to `client_ip_hash` like so:

```caddyfile
[...]
  reverse_proxy {
    to https://compute01:8006 https://rias:8006 https://compute02:8006
    lb_policy client_ip_hash
[...]
```

`ip_hash` also works IF the load balancer is talking to the client directly and not through a proxy such as Cloudflare. Since my load balancer talks to me through Cloudflare, there is one prerequisite which is to make sure the `X-Forwarded-For` header is being set properly. That prerequisite belongs in a [separate document](https://kayg.org/getting-forwarded-ips-right-with-cloudflare/).

And that's it. Now connections to VM/CT consoles work flawlessly.

## References

[https://pve.proxmox.com/wiki/Web\_Interface\_Via\_Nginx\_Proxy](https://pve.proxmox.com/wiki/Web_Interface_Via_Nginx_Proxy?ref=kayg.org)

[https://forum.proxmox.com/threads/console-ends-up-with-connection-timed-out.109922/](https://forum.proxmox.com/threads/console-ends-up-with-connection-timed-out.109922/?ref=kayg.org)

[https://caddyserver.com/docs/caddyfile/directives/reverse\_proxy#load-balancing](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy?ref=kayg.org#load-balancing)