---
date: 2025-07-29 22:31:14
last-edited: 2026-01-18 15:33:23
title: Placement Rules in Ceph S3
---
## ❓ What?

Placement rules in [ceph](<./20240809-ceph.md>) are a method to assign a specific data pool, index pool and extra pools to a particular bucket. Placement rules are assigned to buckets at the time of creation and cannot be changed after creation. The default placement rule is called, `default-placement`. It assigns a [storage class](<./20240427-storage-classes-ceph-s3.md>) called `STANDARD` which links the default rados gateway data, index and non-ec pools. 

### Undocumented --storage-class flag

Currently, `radosgw-admin` accepts an undocumented `--storage-class` flag for changing the default storage class for a particular placement rule. 

```bash
$ radosgw-admin zonegroup placement default --rgw-zonegroup default --placement-id default-placement --storage-class hot_storage_class
[
    {
        "key": "default-placement",
        "val": {
            "name": "default-placement",
            "tags": [],
            "storage_classes": [
                "STANDARD",
                "hot_storage_class",
                "new_storage_class",
                "test-nvme"
            ]
        }
    },
    {
        "key": "new-placement",
        "val": {
            "name": "new-placement",
            "tags": [],
            "storage_classes": [
                "STANDARD"
            ]
        }
    }
]
$ radosgw-admin zonegroup get
{
    "id": "0513c737-9d6f-447c-98ce-cfb0de76c708",
    "name": "default",
    "api_name": "default",
    "is_master": "true",
    "endpoints": [],
    "hostnames": [],
    "hostnames_s3website": [],
    "master_zone": "f408d4b3-559b-4f20-9f72-cd600b5576b7",
    "zones": [
        {
            "id": "f408d4b3-559b-4f20-9f72-cd600b5576b7",
            "name": "default",
            "endpoints": [],
            "log_meta": "false",
            "log_data": "false",
            "bucket_index_max_shards": 11,
            "read_only": "false",
            "tier_type": "",
            "sync_from_all": "true",
            "sync_from": [],
            "redirect_zone": ""
        }
    ],
    "placement_targets": [
        {
            "name": "default-placement",
            "tags": [],
            "storage_classes": [
                "STANDARD",
                "hot_storage_class",
                "new_storage_class",
                "test-nvme"
            ]
        },
        {
            "name": "new-placement",
            "tags": [],
            "storage_classes": [
                "STANDARD"
            ]
        }
    ],
    "default_placement": "default-placement/hot_storage_class",
    "realm_id": "b40e107d-2f4f-4749-a234-4bc1e037f73e",
    "sync_policy": {
        "groups": []
    }
}
```

However, it does not do what it says, even though the `default_placement` key now says `default-placement/hot_storage_class` instead of just `default-placement`.  When new objects are uploaded to a bucket with that particular placement rule, they still goto the older default storage class `STANDARD`. 

### Creating a New Placement Rule OR Changing what STANDARD means

However, this `STANDARD` storage class can be configured to have custom pools during placement rule creation. 

![placement-rules-in-ceph-s3-1](<./20250729-placement-rules-ceph-s3/placement-rules-in-ceph-s3-1.png>)

The new placement rule would look like this.

![placement-rules-in-ceph-s3-2](<./20250729-placement-rules-ceph-s3/placement-rules-in-ceph-s3-2.png>)

### Changing Default Placement Rule for New Buckets

The default placement rule can be changed so that it can be auto selected during bucket creation (new buckets only). As previously mentioned, making the same placement rule with another storage class has no effect.

![placement-rule-in-ceph-s3-4](<./20250729-placement-rules-ceph-s3/placement-rule-in-ceph-s3-4.png>)
On the command-line it would look like:

```bash
radosgw-admin zonegroup placement default \
      --rgw-zonegroup default \
      --placement-id new-new-placement
```

## ❔ Why?

Placement rules establish a bucket (s3 lingo) to pool (ceph lingo) relationship, and are crucial for making sure buckets store data on the desired pools instead of on the default configured pools.

## 🎤 How?

### Bucket Creation with Non-Default Placement Rule with croit

With croit, placement rules can be easily scrolled through during bucket creation:

![placement-rules-ceph-s3-3](<./20250729-placement-rules-ceph-s3/placement-rules-ceph-s3-3.png>)

### Bucket Creation with Non-Default Placement Rule with AWS CLI

On the command line, it would look like this:

```bash
$ aws --endpoint-url http://172.31.117.5 s3api create-bucket --bucket test-test-bucket --create-bucket-configuration 'LocationConstraint=default:new-new-placement'
```

> [!NOTE] LocationConstraint
> The `LocationConstraint` here with `s3api` corresponds to the `zonegroup`'s `api_name` and a custom placement rule can follow the `api_name` with a `:`. This is just to point out the differences on how AWS S3 differs from Ceph S3.

The end result is the same with both the commands:

![placement-rule-ceph-s3-5](<./20250729-placement-rules-ceph-s3/placement-rule-ceph-s3-5.png>)

### Changing Default Placement Rule for the user

A default placement rule with a default storage class can also be configured for a specific user like in the [storage classes example](<./20240427-storage-classes-ceph-s3.md#Changing Default Storage Class for a User>).

## 👓 References

https://docs.ceph.com/en/reef/radosgw/placement/#s3-bucket-placement

https://docs.ceph.com/en/latest/man/8/radosgw-admin/
