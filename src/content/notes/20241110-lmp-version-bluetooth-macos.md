---
date: 2024-11-10 19:53
last edited: 2025-04-10 15:58
title: Finding Bluetooth LMP version on MacOS
---
## 👓 Context

Finding information about devices isn't exactly straightforward on MacOS.

For example, [one of my youtube videos](https://www.youtube.com/shorts/Qe65sRivTQY?feature=share) has someone asking me what bluetooth version does the Magic Trackpad USB C use when it's connected over bluetooth to a Macbook Pro. That's a valid question.

## 🔖 Initial Findings

At first glance, System Report / Information doesn't give out any information that could be linked to the bluetooth version but it does tell me the **MAC address of the trackpad**.

![system-information-bluetooth](<./20241110-lmp-version-bluetooth-macos/system-information-bluetooth.png>)

The same information can be found out in the terminal by running:

```bash
system_profiler -detailLevel full SPBluetoothDataType
```

Another way to find out the MAC address of a connected device is to hold the Option key while clicking on Control Center → Bluetooth:

![control-center-bluetooth-option-key](<./20241110-lmp-version-bluetooth-macos/control-center-bluetooth-option-key.png>)
## 📚 Looking Deeper

A [stackoverflow answer](https://superuser.com/questions/1560716/how-can-i-check-the-bluetooth-version-of-a-connected-device) says that finding the LMP version is key. However, since that information is not exposed very easily, we need to turn to logs. To do that:

1. Open Console.app
2. Add the keyword "lmp" to the search
3. Disconnect Magic Trackpad, wait for a second and reconnect it.
4. A message should appear that looks something like this:

![console-app-bluetooth-lmp](<./20241110-lmp-version-bluetooth-macos/console-app-bluetooth-lmp.png>)

According to the table [that Microsoft provides](https://support.microsoft.com/en-us/windows/what-bluetooth-version-is-on-my-pc-f5d4cff7-c00d-337b-a642-d2d23b082793), we can infer it's Bluetooth 5.2 since `LMPVersion=0000000B` [translates to 11 in decimal](https://www.rapidtables.com/convert/number/hex-to-decimal.html?x=0000000B). The `LMPSubVersion` is manufacturer specific and does not mean anything here, according to 4.3.3. LMP version of [this official bluetooth document](https://www.bluetooth.com/wp-content/uploads/Files/Specification/HTML/Core-54/out/en/br-edr-controller/link-manager-protocol-specification.html) that says:

> LMP supports requests for the version of the LM protocol. The LMP_VERSION_REQ and LMP_VERSION_RES PDUs contain three parameters: Version, Company_Identifier and Subversion. Version specifies the version of the Bluetooth LMP specification that the device supports. All companies that create a unique implementation of the LM shall have their own Company_Identifier. The same company is also responsible for the administration and maintenance of the Subversion. It is recommended that each company has a unique Subversion for each RF/BB/LM implementation. For a given Version and Company_Identifier, the values of the Subversion shall increase each time a new implementation is released. For both Company_Identifier and Subversion the value 0xFFFF means that no valid number applies. There is no ability to negotiate the version of the LMP.

## 📜 References

https://www.bluetooth.com/wp-content/uploads/Files/Specification/HTML/Core-54/out/en/br-edr-controller/link-manager-protocol-specification.html

https://support.microsoft.com/en-us/windows/what-bluetooth-version-is-on-my-pc-f5d4cff7-c00d-337b-a642-d2d23b082793

https://old.reddit.com/r/MacOS/comments/vqp495/find_bluetooth_version_of_connected_devices/

https://old.reddit.com/r/MacOS/comments/rb5rv3/how_do_we_see_what_audio_codec_bluetooth_is_using/