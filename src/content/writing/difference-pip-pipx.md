---
type:
  - Permanent Note
tags:
  - python
  - pip
  - pipx
date: 2024-03-17 09:04
last edited: 2025-01-05 18:46
title: Difference Between PIP and PIPX
---
## ❓ What?

  I know too little python to actually write a meaningful answer so here's a much better excerpt from a random helpful user on reddit:

>Great question, and I admit the names can be confusing.
>
>In short, `pipx` is a tool to use for installing python commands, not for installing dependencies in your projects.
>
>When making a project, use virtual environments and pip (or use Poetry or other tool). I [wrote a tutorial on virtual environments and various tools around them](https://dev.to/bowmanjd/python-tools-for-managing-virtual-environments-3bko) that you may find useful.
>
>Perhaps some use cases would be helpful:
>- you want to install `youtube-dlc` in order to download Youtube videos for offline playback: use `pipx install youtube-dlc`
>- you are writing a Python script that uses the [requests](https://requests.readthedocs.io/) library: use a virtual environment and `pip install requests` within that environment
>- you want the [black](https://black.readthedocs.io/) autoformatter to be available all the time for all Python projects, including one-off scripts, etc.: use `pipx install black`
>- you don't usually use black, but want it available on a particular project, and managed as a dependency: use virtual environments and `pip install black`
> 
> I hope this is helpful! Feel free to [read my brief intro to pipx](https://dev.to/bowmanjd/how-do-i-install-a-python-command-line-tool-or-script-hint-pipx-3i2) if you are interested.

## 👓 References

https://old.reddit.com/r/learnpython/comments/jq5miv/pip_vs_pipx/gblibwq/