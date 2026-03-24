---
title: Ceph Operation v/s Subop Latency
date: 2023-09-12 01:23
last-edited: 2024-12-27 23:10
---
In Ceph, operation latency and subop latency measure different aspects of I/O processing:

## Operation Latency

- Measures the total time taken for a client operation (read/write) to complete
- Includes the entire path from client request to completion
- Represented by metrics like `op_latency`, `op_r_latency`, and `op_w_latency`

## Subop Latency

- Measures the time taken for internal replication operations between OSDs
- Occurs when primary OSD replicates data to secondary OSDs
- Represented by the `subop_latency` metric
- Part of Ceph's replication process for data durability

## Relationship

1. A client operation (op) may trigger multiple suboperations (subops)
2. Subops are internal operations between OSDs for replication
3. Total operation latency includes subop latency when replication is involved

## References

[Ceph OSD Metrics Documentation](https://www.ibm.com/docs/en/storage-ceph/7?topic=counters-ceph-osd-metrics)

[Ceph Performance Counters](https://docs.redhat.com/en/documentation/red_hat_ceph_storage/4/html/administration_guide/ceph-performance-counters)
