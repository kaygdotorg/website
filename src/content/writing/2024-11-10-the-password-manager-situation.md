---
title: "The Password Manager Situation"
slug: "the-password-manager-situation"
description: "👓 Some Context Password managers have come a long way, and so have my requirements. Back in 2019, I started looking into Password Managers (or even before that"
date: "2024-11-10T20:22:00.000+05:30"
last edited: "2025-09-04T17:03:33.000+05:30"
tags:
  - "Blog"
draft: false
image: "/images/ghost/the-password-manager-situation-1768729026320.jpg"
---

## 👓 Some Context

Password managers have come a long way, and so have my requirements. Back in 2019, I started looking into Password Managers (or even before that, I don't remember really) after getting increasingly weary of a mix of password reuse and remix, the latter leading to multiple combinations of the same passwords and frustrating failed login attempts.

As a student with some money for a Hetzner server, self-hosted software was my only option. The shiniest among them was Bitwarden. However, Bitwarden's premium features were locked behind a paywall, and I'd have to pay $10 / year to unlock them - such as TOTP, Organisations, etc - which was completely reasonable. But I still wanted something I could host myself and not have it communicate or connect to another party.

## 🔐 Bitwarden

I found [Vaultwarden](https://github.com/dani-garcia/vaultwarden?ref=kayg.org), and it fit me well for many, many months. It had everything I needed - Passwords, Credit Cards, identity information... until one day, my server was down and I discovered two things:

1.  If I am logged out accidentally when the server isn't online, I cannot access the vault anymore (the cache is presumably invalidated).
2.  I cannot write things to / change things in a Vault when offline.

These are major downsides for me that still exist in Bitwarden / Vaultwarden.

## 🔒 KeePass

Looking for the next best thing - I turned to Keepass, specifically KeepassXC, as it looked much more modern on KDE / Linux. Keepass did not have (still does not, [open as a feature request](https://github.com/keepassxreboot/keepassxc/issues/8228?ref=kayg.org)) categories / templates like Credit Cards, Identity Info, etc., however, it had a much, much nicer desktop app. Not only did it support one of the most killer features one could ask for - [AutoType](https://keepassxc.org/docs/KeePassXC_UserGuide?ref=kayg.org), but it also packed in an SSH agent for key caching and quick logins. It was wonderful.

On Android, Keepass2Android and my favourite, KeepassDX, were great answers (both with much inferior auto-fill than the Bitwarden Android app).

Year after year, I stayed mostly on KeepassXC - ran into some synchronization problems because of my cloud provider - switched to Bitwarden briefly, and then returned to Keepass again.

## 🍎 The Apple Entry

As a recent Apple convert after years of using Windows and Linux, I wanted something that fit the SwiftUI aesthetic better - but still keepass-y. I turned to [Strongbox](https://strongbox.reamaze.com/?ref=kayg.org). At first glance, it looked spectacular:

![./the-password-manager-situation/strongbox-new-entry.png](/images/ghost/the-password-manager-situation-1768729026515.png)

However, it misses the greatest feature of KeepassXC still - AutoType.

For fields that don't support any kind of auto-fill, even Apple's Passwords.app (yes, like the disk unlock prompt for an APFS encrypted drive), AutoType is extremely useful.

![](/images/ghost/the-password-manager-situation-1768729026567.png)

Strongbox has other advantages, though:

1.  Mind-blowing Apple ecosystem support - Touch ID, Native Safari Integration, 2FA / Custom Field auto-fill on iOS, even an Apple Watch app!
2.  Multiple Databases, saving to any cloud provider of choice, Strongbox Sync - Apple's Cloudkit, all the usual niceness of keepass

Large Text view for any field that makes it super easy to scan from any device - for easy sharing:

![./the-password-manager-situation/strongbox-large-text-view.png](/images/ghost/the-password-manager-situation-1768729026594.png)

So far, it seems like the perfect candidate for storing passwords, 2FA codes, recovery codes....

![./the-password-manager-situation/strongbox-database-manager.png](/images/ghost/the-password-manager-situation-1768729026621.png)

But what if I were to optimize further?

## 🔑 Apple Passwords, 1Password

Here comes the point of diminishing returns. Contrary to previous situations, my list of requirements here is basically cosmetic, smelling like a productivity bro's wishlist:

1.  Sometimes, some prompts don't accept anything other than Apple's Passwords.app - maybe switch to passwords.app then... just for logins?
2.  Some people on [MPU](https://talk.macpowerusers.com/?ref=kayg.org) rave about 1Password - what's that about? maybe 1Password is a side-grade?

### Apple Passwords

I ended up trying it, as part of my _completely futile pursuit of reducing reliance on external apps_ / _condensing multiple app usage for no reason_ - and it sucks. 😊

1.  No concept of a master password - device password / FaceID is it.
2.  No custom fields - just a notes section
3.  Credit Cards will still be in Safari
4.  No ability to create multiple databases
5.  The import from CSV from a Strongbox or a Bitwarden export is broken.

Password generation is limited to two variants - "Strong" and "Without special Characters"

![./the-password-manager-situation/passwords-app-password-generator.png](/images/ghost/the-password-manager-situation-1768729026649.png)

I hope Apple improves it with upcoming iOS / MacOS releases because right now, it's not a serious attempt at storing and managing passwords.

I guess the only nice thing about the Passwords app is that it's supported _almost_ everywhere. If strongbox is at least 98% reliable, passwords.app is a for-sure 99%.

### 1Password

1Password is a strange one. I guess it's now the only valid contender left after all of the above. Off the top of my head, without even trying, I can think of the following things:

1.  1Password used to allow local databases with your choice of cloud provider - think proprietary Keepass - but are now cloud-only.
2.  They used to have perpetual licenses and have since transitioned to subscription-only.
3.  Their desktop apps used to be native and are now electron.

Even so, I tried it.

On MacOS, 1Password looks way better than Bitwarden (Bitwarden has said on Reddit that desktop apps are not their priority because of the usage volume) but doesn't look as nice as Strongbox. 1Password has predefined templates for everything you can think of - passports, ssh keys, credit cards, crypto wallets.... This is great UX and I love it. You can also create multiple vaults (vaults are not the same as in keepass, they're merely a collection of entries in 1Password) to share with your family. The experience is seamless.

I also tried it on iOS, the app looks great and also has the ability for Spotlight to index a vault's entries even after it's locked (something that no other password manager has - convenience at the risk of slightly lower security). Also, like strongbox, you can choose to auto-fill any field of any entry that you'd like.

However, even with its attention to detail, it fails for me because:

1.  No option for multiple databases. [1Password says it themselves](https://blog.1password.com/totp-and-1password/?ref=kayg.org) that if you store 2FA tokens in the same place as your passwords, it's not added security, just convenience; and yet there's no way to do that on 1Password. The only way to work around that is with multiple accounts, same as Bitwarden. Except account switching is ridiculously easy in Bitwarden, not so much in 1Password.
2.  It's the most expensive of the bunch, and the way the company has headed lately (cloud-only, subscription-only, electron, price increase) does not seem to be very promising.

Still 1Password is very feature complete and if you do not mind the above caveats, it's a worthy contender.

## 🤔 What Do I Use Now?

Strongbox.

1.  Open source - [https://github.com/strongbox-password-safe/Strongbox](https://github.com/strongbox-password-safe/Strongbox?ref=kayg.org)
2.  Choice between subscription and perpetual licensing
3.  Great support and wiki
4.  Easy sync with Strongbox Sync OR your favourite cloud provider
5.  Looks extremely pretty across all Apple Devices
6.  All the Keepass goodies with great Safari integration and passkey support.

## 🔚 Bidding Thoughts

This is not the first time I have thought of switching my existing workflows for no reason, and certainly not the first time I have questioned my choice of password managers. I wanted to put my thoughts out so I can make all the time spent switching, tinkering, experimenting - amount to something other than [an entry in my "Procrastination" Calendar](https://kayg.org/time-flies-by/). Hopefully, this article reassures me that what I currently use is already the best out there on the wide web, and by the time I need to question my choices again, either this article or my memory whacks me on my bald head and tells me to keep working instead.