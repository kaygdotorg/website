---
title: "Getting Forwarded IPs Right with Cloudflare"
description: "❓ What?

When the orange cloud is ticked on Cloudflare DNS records, every request is proxied by Cloudflare.

This is great because I get great peering no matter where in the world I am. This is great because the backend cannot see the client's real IP.

The latter is actually not so great because I want my infrastructure to be aware of the real client IP.


🎤 How?

There is a two-step solution to this problem.


Make my infrastructure trust Cloudflare

I mean that already is the case as I am us"
date: "2024-07-13T19:08:00.000+05:30"
last edited: "2025-08-27T15:01:01.000+05:30"
tags:
  - "Blog"
draft: true
---

## ❓ What?

When the orange cloud is ticked on Cloudflare DNS records, every request is proxied by Cloudflare.

![./forwarded-ip-cloudflare/cloudflare-proxy.png](/images/ghost/getting-forwarded-ips-right-with-cloudflare-1768729028651.png)

This is great because I get great peering no matter where in the world I am. This is great because the backend cannot see the client's real IP.

The latter is actually not so great because I want my infrastructure to be aware of the real client IP.

## 🎤 How?

There is a two-step solution to this problem.

### Make my infrastructure _trust_ Cloudflare

I mean that already is the case as I am using Cloudflare as my go-to DNS and sometimes a reverse-proxy. However, my load balancers also need to trust cloudflare. My choice of webserver is caddy and caddy includes a `trusted_proxies` directive that's defined globally. Right now it looks like this:

```caddyfile
   [...]
   servers {
     trusted_proxies static private_ranges
   [...]
```

which means trust all requests originating from private IPs, which is cool because I consider the applications I deploy as trusted.

However I also want it to trust Cloudflare IPs. Cloudflare publishes a list of their used IPs under [https://cloudflare.com/ips](https://cloudflare.com/ips?ref=kayg.org) and manually copy-pasting is a chore... so somebody made a module for it: [https://github.com/WeidiDeng/caddy-cloudflare-ip](https://github.com/WeidiDeng/caddy-cloudflare-ip?ref=kayg.org) and I changed my Dockerfile to include the module in the build. My Dockerfile looks like this:

```dockerfile
FROM caddy:builder AS builder

RUN xcaddy build \
    --with github.com/caddy-dns/cloudflare \
    --with github.com/WeidiDeng/caddy-cloudflare-ip

FROM caddy:latest

COPY --from=builder /usr/bin/caddy /usr/bin/caddy
```

Once the image is built, all that needs to be done is adding a new line that says:

```caddyfile
	[...]
	servers {
      trusted_proxies static private_ranges
      trusted_proxies cloudflare
    [...]
```

And once Caddy is restarted, our `X-Forwarded-For` should have IPs in [the format we expect](https://kayg.org/the-x-forwarded-for-http-header/).

### Stop Clients from spoofing X-Forwarded-For

If Cloudflare does not see a `X-Forwarded-For` in the incoming request, it creates one. If it sees the header present, it appends its IP in the header. That could mean one of two things:

1.  There's a load-balancer sitting in front of Cloudflare which is very unlikely.
2.  The client is claiming to be an IP that they are not.

To prevent (2), we can tell Cloudflare to remove the header altogether.

> **Removing X-Forwarded-For**  
> This is about removing the `X-Forwarded-For` header that is in the request from the client to Cloudflare and not removing it from when Cloudflare passes the request from itself to the backend.

To do this, simply create a Transform Rule under Rules → Transform Rules → Modify Request Header. Apply the rule to all incoming requests and set the action to _Remove_ and enter `X-Forwarded-For` as the value.

![./forwarded-ip-cloudflare/cloudflare-transform-rule.png](/images/ghost/getting-forwarded-ips-right-with-cloudflare-1768729028675.png)

  
And that's it. We just made sure that our applications see the correct client IP and the client cannot spoof it.

## 👓 References

[https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For?ref=kayg.org)

[https://www.authelia.com/integration/proxies/forwarded-headers/](https://www.authelia.com/integration/proxies/forwarded-headers/?ref=kayg.org)