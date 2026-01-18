---
date: 2024-11-08 21:23
last edited: 2025-01-05 18:45
tags:
  - ceph/pg
title: Ceph PG Scaling
---
## Overview

At croit, the recommendation is to maintain the number of PGs in a pool such that each PG roughly holds about 45G of data. In order to achieve the number, the following calculation works:

```
Data per PG = (Used Pool Size) / (Number of existing PGs * Redundancy)
```
where:
- Used Pool Size - Amount of data stored in the pool
- Number of existing PGs - `pg_num` - **always** a power of 2
- Redundancy - `size`
	- Replicated Pool - size (for 2/3 replicated pools, the size is 3, min_size is 2)
	- Erasure Coded Pool - size (for 4 + 2 EC pools, the size is 6, min_size is 4) 

## Replicated Pool

So for a pool that looks like this:

```
pool 2 'data' replicated size 3 min_size 2 crush_rule 2 object_hash [...] pg_num 32 [...]

data 2 32 11 GiB 4.80k 31 GiB 0.13 7.8 TiB
```

The calculation would be:

```
Data per PG 
= (31 GiB) / (32 PGs * 3 size)
= 0.323 GiB / PG
```

As seen, the data per PG is way below the recommended 45G. To improve performance on the pool, we can reduce the PG number to 1 which would be bring the number to:

```
Data per PG
= (31 GiB) / (1 PG * 3 size)
= 10.33 GiB / PG
```
which is as close as we can get the pool to the recommended 45 GiB / PG.

## Erasure Coded Pool

So for a pool that looks like this:

```
pool 1 'data_ec' erasure profile [...] size 7 min_size 5 crush_rule 1 object_hash [...] pg_num 128

data_ec 1 128 5.7 TiB 2.19M 9.2 TiB 28.15 13 TiB
```

The calculation would be:

```
Data per PG 
= (13 TiB * 1024) / (128 * 7)
= 14.86 GiB / PG
```
As seen, the data per PG here is also way below the recommended 45 GiB. We can bring that number down to:

```
Data per PG 
= (13 TiB * 1024) / (64 * 7)
= 29.71 GiB / PG
```
which is as close as it gets to the recommended value.

## Total Number of PGs per OSD

The upstream Ceph recommendation is to keep the PGs per OSD to a number of 100. So in order to scale our PGs (as above) to the recommended value, we first need to make sure the OSDs can accommodate that many PGs.

The formula for that is:

```
PGs per OSD
= (Total Number of PGs) / (Total Number of OSDs)
= ((Number of PGs * size for Pool 1) + (Number of PGs * size for Pool 2) + ...) / (Total Number of OSDs)
```

For example, if the two pools above were the only two pools on a cluster with 100 OSDs, the calculation after PG scaling / tuning would be:

```
PGs per OSD
= ((1 * 3) + (64 * 7)) / 100
= 4.51 PGs per OSD
```
which is way below our recommended limit... which is fine. The cluster is just underutilized. 