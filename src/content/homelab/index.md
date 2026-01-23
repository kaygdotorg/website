---
title: Homelab
slug: /homelab
date: 2026-01-22
description: My self-hosted infrastructure, experiments, and the gear that powers my digital life.
display-table-of-contents: false
display-dates: false
display-in-progress: true
---

My homelab is where I experiment with infrastructure, self-host services, and learn by breaking things.

## Current Setup

### Compute
- **3x Intel NUCs** running Proxmox VE in a cluster
- **Raspberry Pi 4** for lightweight services
- **K3s cluster** for container orchestration

### Storage
- **Ceph cluster** across the NUCs for distributed storage
- **2x 4TB HDDs** for bulk storage and backups
- **Samsung T7 Shield** for portable backup

### Networking
- **OPNsense** virtual router for network segmentation
- **VLANs** for separating workloads
- **Tailscale** for secure remote access

## Services I Self-Host

- **Immich** — Photo backup and management
- **Nextcloud** — File sync and collaboration
- **Grafana + Loki** — Monitoring and logging
- **Vault** — Secret management
- **Home Assistant** — Smart home automation

## Why Self-Host?

Privacy, learning, and control. Running my own services means I understand exactly how they work and can customize them to my needs.
