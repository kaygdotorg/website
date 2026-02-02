---
date: 2024-02-05 14:00
last-edited: 2025-01-05 18:46
title: Difference Between OSD Reweight and CRUSH Reweight
---
## TLDR

[ceph](<./20240809-ceph.md>) has two ways of changing an OSD's weight.

| ceph osd reweight | ceph osd crush reweight |
| ---- | ---- |
| ranges between  0 - 1; 0 for an osd that's out, 1 for in | value set to the disk size in TiB |
| decides data placement locally on the node | decides data placement across the CRUSH Map |
| custom value does not persist across osd recreation | custom value persists across all scenarios |
| accepts both `osd.<num>` and `<num>` formats | accepts only the `osd.<num>` format |
## Assumptions

Examples in this note will include operating on `osd.18` and this is what the cluster looks like before running the commands:

```bash
$ ceph osd df tree
ID  CLASS  WEIGHT   REWEIGHT  SIZE     RAW USE  DATA     OMAP     META     AVAIL    %USE   VAR   PGS  STATUS  TYPE NAME
-1         0.50940         -  529 GiB   12 GiB   92 MiB   94 KiB  5.0 GiB  517 GiB   2.18  1.00    -          root default
-2         0.27502         -  289 GiB  9.2 GiB   48 MiB   53 KiB  2.6 GiB  280 GiB   3.17  1.45    -              host code01
 2    hdd  0.02930   1.00000   30 GiB  300 MiB  5.3 MiB    5 KiB  295 MiB   30 GiB   0.98  0.45   16      up          osd.2
 5    hdd  0.02930   1.00000   30 GiB  300 MiB  5.3 MiB   16 KiB  295 MiB   30 GiB   0.98  0.45   20      up          osd.5
 8    hdd  0.02930   1.00000   34 GiB  3.6 GiB  5.3 MiB    8 KiB  318 MiB   30 GiB  10.60  4.86   19      up          osd.8
 11    hdd  0.03119   1.00000   36 GiB  3.6 GiB  5.3 MiB    4 KiB  320 MiB   32 GiB  10.00  4.59   18      up          osd.11
 12    hdd  0.03119   1.00000   32 GiB  301 MiB  5.8 MiB    3 KiB  295 MiB   32 GiB   0.92  0.42   18      up          osd.12
 13    hdd  0.03119   1.00000   32 GiB  300 MiB  5.3 MiB    3 KiB  295 MiB   32 GiB   0.92  0.42   21      up          osd.13
 14    hdd  0.03119   1.00000   32 GiB  300 MiB  5.3 MiB    4 KiB  295 MiB   32 GiB   0.92  0.42   19      up          osd.14
 16    hdd  0.03119   1.00000   32 GiB  300 MiB  5.3 MiB    2 KiB  295 MiB   32 GiB   0.92  0.42   12      up          osd.16
 18    hdd  0.03119   1.00000   32 GiB  301 MiB  5.3 MiB    8 KiB  296 MiB   32 GiB   0.92  0.42   18      up          osd.18
```

- The `REWEIGHT` column here indicates the value that will be changed by `ceph osd reweight`
- The `WEIGHT` column here indicates the value that will be changed by `ceph osd crush reweight`
- The host's __weight__ is decided by calculating the sum of the individual OSD weights.

## The Difference

### ceph osd reweight

- Ranges from 0 - 1, 0 being the equivalent of marked out and 1 is the equivalent of being marked in. If an OSD has been marked in, it'll have the `reweight` value of 1. We can confirm this with a small experiment.
	- Out the OSD. check osd reweight
	  ```bash
		$ ceph osd out osd.18
		marked out osd.18.
		$ ceph osd df tree | grep -E 'ID|osd.18'
		ID  CLASS  WEIGHT   REWEIGHT  SIZE     RAW USE  DATA     OMAP    META     AVAIL    %USE   VAR   PGS  STATUS  TYPE NAME
		18    hdd  0.03119         0      0 B      0 B      0 B     0 B      0 B      0 B      0     0    0      up          osd.18
      ```
	- In the OSD, check osd reweight
	  ```bash
		$ ceph osd in osd.18
		marked in osd.18.
		$ ceph osd df tree | grep -E 'ID|osd.18'
		ID  CLASS  WEIGHT   REWEIGHT  SIZE     RAW USE  DATA     OMAP    META     AVAIL    %USE   VAR   PGS  STATUS  TYPE NAME
			18    hdd  0.03119   1.00000      0 B      0 B      0 B     0 B      0 B      0 B      0     0    4      up          osd.18
	  ```
- It forces CRUSH to move (`1 - reweight`) times the data that would have otherwise lived on this drive. However it does not change the weight of the host and therefore only causes data movement within the host, not across the crush map. This might cause a [nearfull-osd](<./20230905-nearfull-osd.md>) situation as more data is allocated to a single OSD.
- When a custom reweight is set (eg: 0.5), it persists through an osd being marked out and marked in. We can confirm this with a tiny experiment as well.
	- Set a custom weight on the OSD: 0.5
	  ```bash
		$ ceph osd reweight osd.18 0.5
		reweighted osd.18 to 0.5 (8000)
		$ ceph osd df tree | grep -E 'ID|osd.18'
		ID  CLASS  WEIGHT   REWEIGHT  SIZE     RAW USE  DATA     OMAP     META     AVAIL    %USE   VAR   PGS  STATUS  TYPE NAME
		18    hdd  0.03119   0.50000   32 GiB  302 MiB  5.9 MiB    8 KiB  296 MiB   32 GiB   0.92  0.42   14      up          osd.18
	  ```
	- Mark it out and in, check the osd reweight
		```bash
		$ ceph osd out 18
		marked out osd.18.
		$ ceph osd df tree | grep -E 'ID|osd.18'
		ID  CLASS  WEIGHT   REWEIGHT  SIZE     RAW USE  DATA     OMAP    META     AVAIL    %USE   VAR   PGS  STATUS  TYPE NAME
		18    hdd  0.03119         0      0 B      0 B      0 B     0 B      0 B      0 B      0     0    0      up          osd.18
		$ ceph osd in 18
		marked in osd.18.
		$ ceph osd df tree | grep -E 'ID|osd.18'
		ID  CLASS  WEIGHT   REWEIGHT  SIZE     RAW USE  DATA     OMAP    META     AVAIL    %USE   VAR   PGS  STATUS  TYPE NAME
		18    hdd  0.03119   0.50000      0 B      0 B      0 B     0 B      0 B      0 B      0     0    4      up          osd.18
		```
- A reweight does not persist across wiping and recreation of the OSD using the same OSD ID.
	- Before wiping
	  ```bash
	  $ ceph osd df tree | grep -E 'ID|osd.18'
	  ID  CLASS  WEIGHT   REWEIGHT  SIZE     RAW USE  DATA     OMAP     META     AVAIL    %USE   VAR   PGS  STATUS  TYPE NAME
	  18    hdd  0.03119   0.50000   32 GiB  306 MiB  6.3 MiB    8 KiB  300 MiB   32 GiB   0.93  0.43   14      up          osd.18	  
	  ```
	- After wiping and creating the OSD with the same OSD ID
	  ```bash
	  $ ceph osd df tree | grep -E 'ID|osd.18'
	  ID  CLASS  WEIGHT   REWEIGHT  SIZE     RAW USE  DATA     OMAP    META     AVAIL    %USE   VAR   PGS  STATUS  TYPE NAME
	  18    hdd  0.03119   1.00000   32 GiB  290 MiB    4 KiB     0 B  290 MiB   32 GiB   0.89  0.41    3      up          osd.18
		```
- The [Redhat docs](https://access.redhat.com/documentation/en-us/red_hat_ceph_storage/1.2.3/html/storage_strategies/crush-weights) say:
  > Restarting the cluster will wipe out `osd reweight` and `osd reweight-by-utilization`, but `osd crush reweight` settings are persistent.  
  - It's not clear what a cluster restart implies here as the restarting the MONs and MGRs (both simultaneous and rolling) persists the osd reweight.
  - Even in the case of shutting down all the nodes (which is very unlikely in a production cluster), the reweight persists.
	  ```bash
		$ ceph osd df tree | grep -E 'osd.18|ID'
		ID  CLASS  WEIGHT   REWEIGHT  SIZE     RAW USE  DATA     OMAP     META     AVAIL    %USE   VAR   PGS  STATUS  TYPE NAME
		18    hdd  0.03119   0.50000   32 GiB  297 MiB  6.6 MiB    2 KiB  291 MiB   32 GiB   0.91  0.41   14      up          osd.18
	  ```

### ceph osd crush reweight

- A value that's generally the size of the disk in TiB and dictates how much data CRUSH places on this particular disk.
- The CRUSH weight of an OSD contributes to the CRUSH weight of the node, so any changes to the CRUSH weight causes data movement across the whole cluster.
- When a custom crush weight is set (eg: 0), it persists across all scenarios: 
	- osd out / osd in:
	  ```bash
		$ ceph osd df tree | grep -E 'osd.18|ID'
		ID  CLASS  WEIGHT   REWEIGHT  SIZE     RAW USE  DATA     OMAP     META     AVAIL    %USE   VAR   PGS  STATUS  TYPE NAME
		18    hdd  0.03119   1.00000   32 GiB  298 MiB  6.7 MiB    2 KiB  291 MiB   32 GiB   0.91  0.42   18      up          osd.18
		$ ceph osd crush reweight osd.18 0
		reweighted item id 18 name 'osd.18' to 0 in crush map
		$ ceph osd df tree | grep -E 'osd.18|ID'
		ID  CLASS  WEIGHT   REWEIGHT  SIZE     RAW USE  DATA     OMAP     META     AVAIL    %USE   VAR   PGS  STATUS  TYPE NAME
		18    hdd        0   1.00000   32 GiB  298 MiB  6.7 MiB    2 KiB  291 MiB   32 GiB   0.91  0.42    0      up          osd.18
		$ ceph osd out osd.18
		marked out osd.18.
		$ ceph osd df tree | grep -E 'osd.18|ID'
		ID  CLASS  WEIGHT   REWEIGHT  SIZE     RAW USE  DATA     OMAP     META     AVAIL    %USE   VAR   PGS  STATUS  TYPE NAME
		18    hdd        0         0      0 B      0 B      0 B      0 B      0 B      0 B      0     0    0      up          osd.18
		$ ceph osd in osd.18
		marked in osd.18.
		$ ceph osd df tree | grep -E 'osd.18|ID'
		ID  CLASS  WEIGHT   REWEIGHT  SIZE     RAW USE  DATA     OMAP     META     AVAIL    %USE   VAR   PGS  STATUS  TYPE NAME
		18    hdd        0   1.00000      0 B      0 B      0 B      0 B      0 B      0 B      0     0    0      up          osd.18
	  ```
	- wiping the osd, recreating the OSD with the same OSD ID
		- Before wiping
		  ```bash
			$ ceph osd df tree | grep -E 'osd.18|ID'
			ID  CLASS  WEIGHT   REWEIGHT  SIZE     RAW USE  DATA     OMAP     META     AVAIL    %USE   VAR   PGS  STATUS  TYPE NAME
			18    hdd        0   1.00000   32 GiB  298 MiB  6.8 MiB    2 KiB  291 MiB   32 GiB   0.91  0.42    0      up          osd.18
		  ```
		- After wiping and recreation with same OSD ID
		  ```bash
			$ ceph osd df tree | grep -E 'osd.18|ID'
			ID  CLASS  WEIGHT   REWEIGHT  SIZE     RAW USE  DATA     OMAP     META     AVAIL    %USE   VAR   PGS  STATUS  TYPE NAME
			18    hdd        0   1.00000   32 GiB  290 MiB    4 KiB      0 B  290 MiB   32 GiB   0.89  0.40    0      up          osd.18
		  ```
	  - a "cluster restart" (simultaneous / rolling restarts of MONs and MGRs, all nodes shutdown at once and started)
	    ```bash
	    $ ceph osd df tree | grep -E 'osd.18|ID'
		ID  CLASS  WEIGHT   REWEIGHT  SIZE     RAW USE  DATA     OMAP     META     AVAIL    %USE   VAR   PGS  STATUS  TYPE NAME
		18    hdd        0   1.00000   32 GiB  298 MiB  7.2 MiB    1 KiB  290 MiB   32 GiB   0.91  0.41    0      up          osd.18
	    ```
## 👓 References

https://ceph-users.ceph.narkive.com/6Jb6CNND/difference-between-ceph-osd-reweight-and-ceph-osd-crush-reweight

https://swamireddy.wordpress.com/2016/06/17/ceph-diff-ceph-osd-reweight-ceph-osd-crush-reweight/

https://access.redhat.com/documentation/en-us/red_hat_ceph_storage/1.2.3/html/storage_strategies/crush-weights

https://www.ibm.com/docs/en/storage-ceph/7?topic=weights-set-osds-in-weight

https://www.ibm.com/docs/en/storage-ceph/7?topic=weights-setting-buckets-osd

https://www.ibm.com/docs/en/storage-ceph/7?topic=weights-setting-crush-osds
