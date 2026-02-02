---
title: TLS Handshake Timeout in Docker Containers within Proxmox SDN
last-edited: 2025-04-10 16:11
date: 2025-01-26 22:07
---
## The Problem

I use [Proxmox SDN and a eVPN Zone](<./20240809-evpn-vxlan-proxmox-sdn.md>) as my main network [which means the default MTU is 1450](https://pve.proxmox.com/pve-docs/chapter-pvesdn.html#pvesdn_zone_plugin_evpn).

![proxmox-sdn-evpn-zone](<./20250126-docker-mtu-proxmox-sdn/proxmox-sdn-evpn-zone.png>)

The VM's network adapters can be [configured quite trivially by setting the MTU value to 1, which just inherits the underlying bridge's MTU](<./20240809-bridge-mtu-proxmox.md#❔ Why?>).

The VMs network adapter from the inside looks like so:

```bash
kayg@small-services:~$ ip a
[...]
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1450 qdisc fq_codel state UP group default qlen 1000
    link/ether bc:24:11:5e:20:be brd ff:ff:ff:ff:ff:ff
    inet 10.1.3.2/24 brd 10.1.3.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::be24:11ff:fe5e:20be/64 scope link
       valid_lft forever preferred_lft forever
[...]
```

But from inside a random docker container, the network looks like this: 

```bash
kayg@small-services:~$ sudo docker run -it debian
root@b40bc9e008e4:/# ip a
[...]
356: eth0@if357: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default
    link/ether 02:42:ac:11:00:02 brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet 172.17.0.2/16 brd 172.17.255.255 scope global eth0
       valid_lft forever preferred_lft forever
[...]
```
Now the problem is, randomly, a TLS handshake will timeout whereas others would succeed:

```bash
root@b40bc9e008e4:/# curl -v https://github.com
*   Trying 20.207.73.82:443...
* Connected to github.com (20.207.73.82) port 443 (#0)
* ALPN: offers h2,http/1.1
* TLSv1.3 (OUT), TLS handshake, Client hello (1):
*  CAfile: /etc/ssl/certs/ca-certificates.crt
*  CApath: /etc/ssl/certs
^C
root@b40bc9e008e4:/# curl -v https://google.com
*   Trying 142.250.192.78:443...
*   Trying [2404:6800:4009:828::200e]:443...
* Immediate connect fail for 2404:6800:4009:828::200e: Network is unreachable
* Connected to google.com (142.250.192.78) port 443 (#0)
* ALPN: offers h2,http/1.1
* TLSv1.3 (OUT), TLS handshake, Client hello (1):
*  CAfile: /etc/ssl/certs/ca-certificates.crt
*  CApath: /etc/ssl/certs
* TLSv1.3 (IN), TLS handshake, Server hello (2):
* TLSv1.3 (IN), TLS handshake, Encrypted Extensions (8):
* TLSv1.3 (IN), TLS handshake, Certificate (11):
* TLSv1.3 (IN), TLS handshake, CERT verify (15):
* TLSv1.3 (IN), TLS handshake, Finished (20):
* TLSv1.3 (OUT), TLS change cipher, Change cipher spec (1):
* TLSv1.3 (OUT), TLS handshake, Finished (20):
[...]
```

This is problematic because now certain websites are inaccessible (see: [bridge-mtu-proxmox](<./20240809-bridge-mtu-proxmox.md>)) but moreso because it breaks [comments on my website](<./20241110-comments.md>) for users of GitHub and Microsoft. And I am a GitHub user! 
## The Solution

Change the docker network MTU. The advice that floats around the internet is this:

1. Create `/etc/docker/daemon.json`
2. Add:
   ```json
	{
	  "mtu": 1454
	}
	```
3. `systemctl daemon-reload` and `systemctl restart dcoker`
4. Profit???

Not so easy. Turns out, as pointed by [a kind stranger on the internet](https://mlohr.com/docker-mtu/), that only changes the default bridge network MTU in Docker. 

If you use docker-compose (like you should), the MTU is still going to be the default of 1500 because every docker compose file is treated as a separate set of services that warrant a separate network. In my case, I use one compose file for all my services that should be grouped logically, and so, I added the following to my compose file:

```yaml
networks:
  small-services:
    driver: bridge
    driver_opts:
      com.docker.network.driver.mtu: 1452
```

And making sure that the service is using the network:

```yaml
[...]
    networks:
      - small-services
[...]
```
Once the container is redeployed with `docker compose up -d`, the network adapter has the correct MTU:

```bash
/srv # ip a
[...]
272: eth0@if273: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1452 qdisc noqueue state UP
    link/ether 02:42:ac:12:00:02 brd ff:ff:ff:ff:ff:ff
    inet 172.18.0.2/16 brd 172.18.255.255 scope global eth0
       valid_lft forever preferred_lft forever
[...]
```

And will be able to talk to any website without issues:

```bash
/srv # curl -v https://github.com
* Host github.com:443 was resolved.
* IPv6: (none)
* IPv4: 20.207.73.82
*   Trying 20.207.73.82:443...
* Connected to github.com (20.207.73.82) port 443
* ALPN: curl offers h2,http/1.1
* TLSv1.3 (OUT), TLS handshake, Client hello (1):
^C
/srv # curl -v https://github.com
* Host github.com:443 was resolved.
* IPv6: (none)
* IPv4: 20.207.73.82
*   Trying 20.207.73.82:443...
* Connected to github.com (20.207.73.82) port 443
* ALPN: curl offers h2,http/1.1
* TLSv1.3 (OUT), TLS handshake, Client hello (1):
*  CAfile: /etc/ssl/certs/ca-certificates.crt
*  CApath: /etc/ssl/certs
* TLSv1.3 (IN), TLS handshake, Server hello (2):
* TLSv1.3 (IN), TLS handshake, Encrypted Extensions (8):
* TLSv1.3 (IN), TLS handshake, Certificate (11):
* TLSv1.3 (IN), TLS handshake, CERT verify (15):
* TLSv1.3 (IN), TLS handshake, Finished (20):
* TLSv1.3 (OUT), TLS change cipher, Change cipher spec (1):
* TLSv1.3 (OUT), TLS handshake, Finished (20):
/srv # curl -v https://google.com
* Host google.com:443 was resolved.
* IPv6: 2404:6800:4009:812::200e
* IPv4: 142.250.183.206
*   Trying 142.250.183.206:443...
*   Trying [2404:6800:4009:812::200e]:443...
* Immediate connect fail for 2404:6800:4009:812::200e: Network unreachable
* Connected to google.com (142.250.183.206) port 443
* ALPN: curl offers h2,http/1.1
* TLSv1.3 (OUT), TLS handshake, Client hello (1):
*  CAfile: /etc/ssl/certs/ca-certificates.crt
*  CApath: /etc/ssl/certs
* TLSv1.3 (IN), TLS handshake, Server hello (2):
* TLSv1.3 (IN), TLS handshake, Encrypted Extensions (8):
* TLSv1.3 (IN), TLS handshake, Certificate (11):
* TLSv1.3 (IN), TLS handshake, CERT verify (15):
* TLSv1.3 (IN), TLS handshake, Finished (20):
* TLSv1.3 (OUT), TLS change cipher, Change cipher spec (1):
* TLSv1.3 (OUT), TLS handshake, Finished (20):
```
