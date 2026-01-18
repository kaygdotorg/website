---
title: "Changing Wordpress URL"
description: "❓ What happened?

My wordpress instance was hosted at https://kayg.org, however I replaced it with Quartz before exporting / importing content. Therefore, I need it accessible over at https://wp.kayg.org so I can squeeze some content out and decommission it for good. I tried to access the instance over the private IP address directly by exposing the IP with tailscale subnet routers... but that did not work because the site is configured to be available only over HTTPS and at a specific address. "
date: "2024-02-12T00:32:00.000+05:30"
last edited: "2025-09-03T11:55:09.000+05:30"
tags:
  - "Blog"
draft: false
---

## ❓ What happened?

My wordpress instance was hosted at [https://kayg.org](https://kayg.org/), however I replaced it with Quartz before exporting / importing content. Therefore, I need it accessible over at [https://wp.kayg.org](https://wp.kayg.org/?ref=kayg.org) so I can squeeze some content out and decommission it for good. I tried to access the instance over the private IP address directly by exposing the IP with [tailscale subnet routers](https://tailscale.com/kb/1019/subnets?ref=kayg.org)... but that did not work because the site is configured to be available only over HTTPS and at a specific address. 😔

![./changing-wordpress-url/wordpress-unavailable-different-domain.png](/images/ghost/changing-wordpress-url-1768729029396.png)

## 🎤 How do we fix this?

-   Change the `siteurl` value in the mariadb database too in the `wp_options` column. This can be done with a GUI like Adminer or PhpMyAdmin or over the command-line. This is how it's done over the command-line:

Update the `siteurl` option in the `wp_options` column.

```sql
  MariaDB [wordpress]> update wp_options set option_value = 'https://wp.kayg.org' where option_name = 'siteurl';
  Query OK, 1 row affected (0.001 sec)
  Rows matched: 1  Changed: 1  Warnings: 0
  
  MariaDB [wordpress]> select * from wp_options where option_name = 'siteurl'
      -> ;
  +-----------+-------------+---------------------+----------+
  | option_id | option_name | option_value        | autoload |
  +-----------+-------------+---------------------+----------+
  |         1 | siteurl     | https://wp.kayg.org | yes      |
  +-----------+-------------+---------------------+----------+
  1 row in set (0.000 sec)
```

Open the database as the root user:

```bash
sudo docker exec -it kayg_wordpress_mariadb mariadb -u root -p wordpress
```

Explicitly add these values to the `wp-config.php` file that define what the site's URL is:

```php
  define( 'WP_HOME', 'https://wp.kayg.org' );
  define( 'WP_SITEURL', 'https://wp.kayg.org' );
```

And then the broken homepage and the admin page show up as intended!

![./changing-wordpress-url/broken-homepage.png](/images/ghost/changing-wordpress-url-1768729029424.png)
![./changing-wordpress-url/admin-page.png](/images/ghost/changing-wordpress-url-1768729029451.png)

## 👓 References

[https://www.wpbeginner.com/wp-tutorials/how-to-change-your-wordpress-site-urls-step-by-step/](https://www.wpbeginner.com/wp-tutorials/how-to-change-your-wordpress-site-urls-step-by-step/?ref=kayg.org)