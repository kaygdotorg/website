---
tags:
  - ceph
  - iscsi
  - persistent-reservations
  - tcmu-runner
Type:
  - Fleeting Note
date: 2024-01-19 15:32
last edited: 2025-01-05 18:29
title: ISCSI Reservations
---
## Overview

iSCSI reservations provide a mechanism to control how multiple initiators access a shared LUN. By placing a reservation, an initiator effectively locks the LUN, preventing other initiators from modifying it simultaneously. iSCSI reservations come in two primary forms: SCSI-2 “classic” reservations and SCSI-3 “persistent” reservations.

## Classic Reservations (SCSI-2)

Classic (or SCSI-2) reservations can be released under two circumstances:
- When the initiator explicitly releases the reservation
- When a bus reset occurs as part of error recovery

This approach serves many legacy systems but can be limited by resets that automatically break the reservation.

## Persistent Reservations (SCSI-3)

Persistent (or SCSI-3) reservations remain active until explicitly released by the initiator. Unlike classic reservations, persistent reservations are not dissolved by a bus reset, providing a more robust, modern approach to managing concurrent access in shared-storage environments.

## Additional Notes

Persistent reservations are preferred in most current deployments to avoid unintentional release events. They offer greater control and resilience for cluster-aware applications that rely on shared disks without risking inadvertent interruptions.

[^1]: [NetApp Knowledge Base — “What are SCSI Reservations and SCSI Persistent Reservations?”](https://kb.netapp.com/onprem/ontap/da/SAN/What_are_SCSI_Reservations_and_SCSI_Persistent_Reservations)