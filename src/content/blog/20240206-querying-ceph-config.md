---
date: 2024-02-06 14:53
last-edited: 2026-01-18 15:33:26
title: Querying Ceph Configuration
---
[ceph](<./20240125-ceph.md>)'s configuration can be queried in quite a few ways:
### Runtime

These commands fetch configuration as reported by the running daemons.

```bash
$ # ceph tell <daemon> config get <config>

$ ceph tell osd.0 config get osd_memory_target
{
    "osd_memory_target": "1073741824"
}

$ # ceph config show <daemon> <config>

$ ceph config show osd.0 osd_memory_target
1073741824
```

### MON Database

This command fetches the configuration from the MON database so the values here will differ if they have been modified at runtime.

```bash
$ # ceph config get <daemon> <config>

$ ceph config get osd.0 osd_memory_target
4294967296
```

### Directly from the Daemon 

It is also possible to connect to running daemons on localhost (for example, osd.0 running on host X) and query configuration directly for that running daemon with:
 
```bash
$ # ceph daemon <daemon> config get <config>

$ ceph daemon osd.0 config get osd_memory_target
{
    "osd_memory_target": "1073741824"
}
```

### What about defaults?

To see all the settings, defaults and non-defaults, one can use:

```bash
$ # ceph config show-with-defaults <daemon> 
for osd in $osd_list; do
    echo "OSD $osd:" >> osd.txt
    ceph config show osd.$osd public_network >> osd.txt
    echo # Just for better readability of the output
done
$ ceph config show-with-defaults osd.0 | grep osd_memory_target
osd_memory_target                                           1073741824                                                                                                                                                                                                                                                               file                        
osd_memory_target_autotune                                  false                                                                                                                                                                                                                                                                    default                     
osd_memory_target_cgroup_limit_ratio                        0.800000                                                                                                                                                                                                                                                                 default 
```

Same but by connecting directly to the daemon:

```bash
$ ceph daemon osd.0 config diff | grep -A4 osd_memory_target
        "osd_memory_target": {
            "default": "4294967296",
            "file": "1073741824",
            "final": "1073741824"
        },
```
## 👓 References

https://docs.ceph.com/en/latest/rados/configuration/ceph-conf/#commands
