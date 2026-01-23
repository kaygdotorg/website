---
date: 2024-04-27 02:43
last edited: 2025-01-05 19:07
title: Storage Classes in Ceph S3
---
## ❓ What?

Storage classes in [ceph](<./20240809-ceph.md>) correspond to a certain data pool. They are a subsection of [placement rules](<./20250729-placement-rules-ceph-s3.md>) that link them to data pools. A storage class is unique to a placement rule but placement rules can have many storage classes. Every placement rule has a storage class called `STANDARD` by default but this `STANDARD` might correspond to different data pools for different placement rules.
### Changing Default Storage Class for a User

**The default storage class for a placement rule (and therefore a bucket) cannot be modified.** If it's desired that a certain user's uploads, by default, goto a different storage class, this can be done by modifying the `default_storage_class` key for the specific user with `radosgw-admin` .

```bash
$ radosgw-admin user info --uid test-user
{
    "user_id": "test-user",
    "display_name": "test-user",
    "email": "",
    "suspended": 0,
    "max_buckets": 1000,
    "subusers": [],
    "keys": [
        {
            "user": "test-user",
            "access_key": "QTAQHWDZBLBSPAK3MEL3",
            "secret_key": "Oe9oqCDY1c3DIgqnK34CBo0M4IWyXkYtTP7MP3Yf"
        }
    ],
    "swift_keys": [],
    "caps": [],
    "op_mask": "read, write, delete",
    "default_placement": "",
    "default_storage_class": "",
    "placement_tags": [],
    "bucket_quota": {
        "enabled": false,
        "check_on_raw": false,
        "max_size": -1,
        "max_size_kb": 0,
        "max_objects": -1
    },
    "user_quota": {
        "enabled": false,
        "check_on_raw": false,
        "max_size": -1,
        "max_size_kb": 0,
        "max_objects": -1
    },
    "temp_url_keys": [],
    "type": "rgw",
    "mfa_ids": []
}

$ radosgw-admin user modify \
      --uid test-user \
      --placement-id default-placement \
      --storage-class hot_storage_class
{
    "user_id": "test-user",
    "display_name": "test-user",
    "email": "",
    "suspended": 0,
    "max_buckets": 1000,
    "subusers": [],
    "keys": [
        {
            "user": "test-user",
            "access_key": "QTAQHWDZBLBSPAK3MEL3",
            "secret_key": "Oe9oqCDY1c3DIgqnK34CBo0M4IWyXkYtTP7MP3Yf"
        }
    ],
    "swift_keys": [],
    "caps": [],
    "op_mask": "read, write, delete",
    "default_placement": "default-placement",
    "default_storage_class": "hot_storage_class",
    "placement_tags": [],
    "bucket_quota": {
        "enabled": false,
        "check_on_raw": false,
        "max_size": -1,
        "max_size_kb": 0,
        "max_objects": -1
    },
    "user_quota": {
        "enabled": false,
        "check_on_raw": false,
        "max_size": -1,
        "max_size_kb": 0,
        "max_objects": -1
    },
    "temp_url_keys": [],
    "type": "rgw",
    "mfa_ids": []
}
```

Otherwise, a storage class can also be specified during the time of the upload like in [the placement rule example](<./20250729-placement-rules-ceph-s3.md#Bucket Creation with Non-Default Placement Rule with AWS CLI>).

## ❔ Why?

Storage classes help users and administrators to prioritise space and costs by having different types of storage classes corresponding to different types of device classes. For example, frequently accessed data may reside on NVMe while archives may reside on HDD. This type of transitioning is made possible with lifecycle policies. 

## 🎤 How?

  
A storage class can be created like so:

![storage-class-in-ceph-s3-1](<./20240427-storage-classes-ceph-s3/storage-class-in-ceph-s3-1.png>)
Same over the command line:

```bash
radosgw-admin zonegroup placement add \
      --rgw-zonegroup default \
      --placement-id default-placement \
      --storage-class hot_storage_class

radosgw-admin zone placement add \
      --rgw-zone default \
      --placement-id default-placement \
      --storage-class hot_storage_class \
      --data-pool hot.rgw.data \
      --compression lz4
```

## 👓 References

https://docs.ceph.com/en/latest/radosgw/placement/#adding-a-storage-class
