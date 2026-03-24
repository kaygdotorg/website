---
title: Slow Operations in Ceph OSDs
date: 2024-01-14 22:27
last-edited: 2024-12-28 16:13
---
## Overview

When Ceph reports slow operations, they can be investigated using the `dump_historic_ops` command[^1].

## Usage

```bash
$ ceph tell osd.0 dump_historic_ops
{
    "size": 20,
    "duration": 600,
    "ops": [
        {
            "description": "osd_op(mds.0.42:171505 2.6 2:654134d2:::mds0_openfiles.0:head [omap-set-header,omap-set-vals] snapc 0=[] ondisk+write+known_if_redirected+full_force+supports_pool_eio e777)",
            "initiated_at": "2024-12-28T10:19:26.466544+0000",
            "age": 408.076198987,
            "duration": 0.80698983499999999,
            "type_data": {
                "flag_point": "commit sent; apply or cleanup",
                "events": [
                    {
                        "event": "initiated",
                        "time": "2024-12-28T10:19:26.466544+0000",
                        "duration": 0
                    },
                    {
                        "event": "throttled",
                        "time": "2024-12-28T10:19:26.466544+0000",
                        "duration": 0
                    },
                    {
                        "event": "header_read",
                        "time": "2024-12-28T10:19:26.466541+0000",
                        "duration": 4294967295.9999971
                    },
                    {
                        "event": "all_read",
                        "time": "2024-12-28T10:19:26.466563+0000",
                        "duration": 2.158e-05
                    },
                    {
                        "event": "dispatched",
                        "time": "2024-12-28T10:19:26.466565+0000",
                        "duration": 2.526e-06
                    },
                    {
                        "event": "queued_for_pg",
                        "time": "2024-12-28T10:19:26.466573+0000",
                        "duration": 7.1570000000000003e-06
                    },
                    {
                        "event": "reached_pg",
                        "time": "2024-12-28T10:19:26.466644+0000",
                        "duration": 7.1451000000000004e-05
                    },
                    {
                        "event": "started",
                        "time": "2024-12-28T10:19:26.466709+0000",
                        "duration": 6.4993000000000006e-05
                    },
                    {
                        "event": "waiting for subops from 9,17",
                        "time": "2024-12-28T10:19:26.466799+0000",
                        "duration": 8.9628000000000003e-05
                    },
                    {
                        "event": "op_commit",
                        "time": "2024-12-28T10:19:26.468100+0000",
                        "duration": 0.001301377
                    },
                    {
                        "event": "sub_op_commit_rec",
                        "time": "2024-12-28T10:19:26.469093+0000",
                        "duration": 0.00099318200000000001
                    },
                    {
                        "event": "sub_op_commit_rec",
                        "time": "2024-12-28T10:19:27.273478+0000",
                        "duration": 0.80438480899999998
                    },
                    {
                        "event": "commit_sent",
                        "time": "2024-12-28T10:19:27.273507+0000",
                        "duration": 2.8676000000000001e-05
                    },
                    {
                        "event": "done",
                        "time": "2024-12-28T10:19:27.273534+0000",
                        "duration": 2.7457000000000002e-05
                    }
                ]
            }
        },
[...]
```

## What to Look For

1. Operations with large duration times in the output[^1]
2. `sub_op_commit_rec` entries indicate operations delegated to other OSDs[^2]

## Health Warning

The `SLOW_OPS` warning appears in Ceph health status when operations are taking longer than expected[^1]. The threshold is controlled by the `osd_op_complaint_time` parameter[^3].

## Related Concepts

- [Ceph Operation Latency](<./20240117-osd-op-subop-latency.md>)

[^1]: [Ceph Health Checks - Slow OPS](https://docs.ceph.com/en/latest/rados/operations/health-checks/?highlight=dump_historic_ops#slow-ops)
[^2]: [Ceph Troubleshooting Slow OSD Operations](https://docs.ceph.com/en/reef/rados/troubleshooting/troubleshooting-osd/#debugging-slow-requests)
[^3]: [Ceph OSD Config Reference](https://docs.ceph.com/en/reef/rados/configuration/osd-config-ref)
