---
title: Home
description: Personal website and digital garden
name: K Gopal Krishna
tagline: Infrastructure Engineer, dead cinephile, hobbyist bodybuilder.
profile-image: ./assets/hero-picture.jpeg
email: mail@kayg.org
footer-text: Vibe-coded with Antigravity using Astro and Tailwind CSS

# =============================================================================
# SITE METADATA
# Used in BaseLayout.astro for SEO, social sharing, and navigation.
# Moving these from hardcoded Astro files enables content-driven configuration.
# =============================================================================
site-name: "kayg's public repertoire"
cover-image: ./assets/home-og-image.png

# =============================================================================
# NAVIGATION LINKS
# Replaces hardcoded navLinks arrays in BaseLayout.astro.
# Set visible: false to hide from main nav (will still appear in mobile menu).
# =============================================================================
nav-links:
  - href: /
    label: Home
    visible: false # Home is accessed via logo, not nav
  - href: /about
    label: About
  - href: /contact
    label: Contact
  - href: /blog
    label: Writing
  - href: /now
    label: Now
  - href: /uses
    label: Uses
  - href: /photography
    label: Photography
    visible: false # Shown only in mobile menu
  - href: /notes
    label: Notes
    visible: false # Shown only in mobile menu
  - href: /talks
    label: Talks
    visible: false # Shown only in mobile menu

# =============================================================================
# HOMEPAGE UI TEXT
# Section headings and labels previously hardcoded in index.astro.
# Content-driven approach enables editing without touching code.
# =============================================================================
hero-hint: "swipe to shuffle · tap to navigate · scroll to explore"
bento-section-label: "Explore"
bento-section-title: "A little bit about me"
comments-section-label: "Comments"
comments-section-title: "What People Say About This Website"

social-links:
  - label: GitHub
    url: https://github.com/kaygdotorg
  - label: Twitter/X
    url: https://x.com/kaygdotorg
  - label: LinkedIn
    url: https://www.linkedin.com/in/k-gopal-krishna-7546b92a2/
  - label: Mastodon
    url: https://mas.to/@kayg
  - label: Telegram
    url: https://t.me/kaygdotorg

card-photos:
  # Photo strip images synced with bento card images for visual consistency
  - src: https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80
    label: Photography
    href: /photography
    date: Dec 2024
  - src: ./assets/uses-bento-grid.jpeg
    label: Uses
    href: /uses
    date: Dec 2024
  - src: https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&q=80
    label: Now
    href: /now
    date: Dec 2024
  - src: https://images.unsplash.com/photo-1455390582262-044cdead277a?w=500&q=80
    label: Writing
    href: /blog
    date: Nov 2024
  - src: ./assets/talks-bento-grid.jpeg
    label: Talks
    href: /talks
    date: Jan 2026
  - src: https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&q=80
    label: Notes
    href: /notes
    date: Jan 2026

bento-cards:
  - id: talks
    title: Public Speaking
    category: Talks
    summary: Latest presentations at technical conferences and local meetups.
    href: /talks
    image: ./assets/talks-bento-grid.jpeg
  - id: blog
    title: Latest Thinking
    category: Writing
    summary: Long-form thoughts on infrastructure, software design, and digital life.
    href: /blog
    image: https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80
  - id: notes
    title: Digital Garden
    category: Notes
    summary: A collection of interconnected fragments, ideas, and less polished thoughts.
    href: /notes
    # Replaces the magic string "obsidian-graph" with explicit display configuration.
    # The layoutVariant: graph flag tells the template to render the canvas animation
    # instead of a static image. No special string matching required.
    image: obsidian-graph
    layout-variant: graph
    # titleInMeta moves the title to the category row, matching previous hardcoded
    # behavior for the notes card. Content now controls layout, not template logic.
    title-in-meta: true
  - id: now
    title: What I'm doing
    category: Now
    summary: Current projects, books, and focus areas in my life right now.
    href: /now
    image: https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80
    # showPulse adds the animated pulsing dot indicator next to the category.
    # Previously hardcoded for card.id === "now", now content-driven.
    show-pulse: true
  - id: photography
    title: Moments Captured
    category: Photography
    summary: A visual diary of my explorations and the beauty found in the mundane.
    href: /photography
    image: https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80
    # layoutVariant: photostack tells the template to render the photo stack
    # instead of a single image. Previously hardcoded for card.id === "photography".
    layout-variant: photostack
  - id: uses
    title: My Setup
    category: Uses
    summary: The hardware and software tools I use to build and create every day.
    href: /uses
    image: ./assets/uses-bento-grid.jpeg
  - id: homelab
    title: Home Lab
    category: Infrastructure
    summary: Exploring self-hosting, networking, and home automation with my personal server cluster.
    href: /homelab
    image: https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=800&q=80
  - id: about
    title: About Me
    category: Profile
    summary: More about my journey, philosophy, and the things that drive me forward.
    href: /about
    image: ./assets/hero-picture.jpeg
  - id: contact
    title: Say Hello
    category: Contact
    summary: I'm always open to interesting conversations and collaborations. Reach out via email.
    href: /contact
    image: https://images.unsplash.com/photo-1523966211575-eb4a01e7dd51?w=800&q=80

resume-url: ./resume.pdf

work-experience:
  - role: Support Engineer
    company: croit GmbH
    start-date: Feb 2022
    end-date: Present
    is-current: true
  - role: Systemd Unit Translator
    company: Google Summer of Code
    start-date: May 2020
    end-date: Aug 2020
  - role: Devops Engineer
    company: IDS Logic
    start-date: May 2019
    end-date: Aug 2019
  - role: Devops Engineer
    company: IDS Logic
    start-date: May 2018
    end-date: Aug 2018


date: 2026-01-19 21:02:22
last-edited: 2026-01-23 12:45:07
---
