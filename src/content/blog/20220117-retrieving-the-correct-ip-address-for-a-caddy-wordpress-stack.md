---
title: Retrieving the correct IP address for a Caddy-Wordpress stack
date: 2022-01-17 00:00
last-edited: 2025-04-10 15:54
---
I use **[All In One WP Security](https://wordpress.org/plugins/all-in-one-wp-security-and-firewall/)** to secure my Wordpress instance. It's [open source](https://github.com/Arsenal21/all-in-one-wordpress-security) and offers a lot of customization. Though I have entertained the thought of running a static website using _WP2Static_, I very much dig the existence of comments and searching. Though there have been attempts to merge the [aforementioned setup while serving comments from a basic-auth protected wordpress instance](https://www.gulshankumar.net/static-wordpress-bunnycdn/), I still have to rely on an external service for searching or make the front document dense with content so that users can `CTRL + F` to find content. The latter is a half-assed way to implement searching, though many people do it.

## The Problem

Now the problem with using the plugin was that when I enabled Brute-Force protection, the only IP that would get blacklisted all the time was an internal IP. It would lock me out. I shamelessly worked around the problem by disabling the plugin, logging in and re-enabling the plugin.

![retrieving-the-correct-ip-address-for-a-caddy-wordpress-stack-1](<./20220117-retrieving-the-correct-ip-address-for-a-caddy-wordpress-stack/retrieving-the-correct-ip-address-for-a-caddy-wordpress-stack-1.png>)

It was a strange issue because Caddy did forward the correct IP address to the backend. I double, triple checked the reverse proxy settings to see if I was missing something. There wasn't a lot to fix since the [reverse proxy settings](https://gitlab.com/kayg-infra/kayg/webserver/-/blob/3d7b6b106d2196676e9889aaa2e6e3b79ab91b89/Caddyfile#L187) read as:

```
  reverse_proxy http://wordpress:80
```

[Caddy Docs](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy#headers) specify that this directive itself sends all the required headers. It was all the more strange that every other service that I was running was reporting the correct remote IP.

## The Solution

While going through the options of the plugin, I found out that it wasn't Caddy, it wasn't Apache, it wasn't even Wordpress. It turns out that the plugin was using the incorrect header to report IP addresses:

![retrieving-the-correct-ip-address-for-a-caddy-wordpress-stack-2](<./20220117-retrieving-the-correct-ip-address-for-a-caddy-wordpress-stack/retrieving-the-correct-ip-address-for-a-caddy-wordpress-stack-2.png>)

[HTTP_X_FORWARDED_FOR](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For) is what you would want to use instead of the default `REMOTE_ADDR`.
