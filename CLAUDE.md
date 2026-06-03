# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static conference website for **"Connecting the Dots — Little Red Dots in Astronomy"**, a workshop at Ringberg Castle in 2026. No build step, no framework, no package manager — pure HTML/CSS/JS served as-is.

## Architecture

The site is a single-page design with a fixed animated canvas background and a scrollable foreground. Script load order in `index.html` matters:

1. `config.js` — must load first; defines the global `CONFIG` object consumed by `animation.js`
2. `js/animation.js` — reads `CONFIG` to drive the canvas dot animation (IIFE, no globals exposed)
3. Inline `<script>` in `index.html` — handles nav scroll-spy and scroll-hint behaviour

**`config.js`** is the single place to tune all visual parameters (dot colours, speed, density, connection distance, lifecycle durations, star count). Do not hardcode these values in `animation.js`.

**`css/style.css`** uses CSS custom properties defined on `:root` for the colour palette (`--accent`, `--bg`, `--text`, etc.). Match these variables when adding new styled elements rather than using literal colour values.

## Deployment

The GitHub Actions workflow in `.github/workflows/deploy.yml` is fully commented out — deployment is currently manual via:

```bash
python deploy_sftp.py
```

Required environment variables for deployment:

| Variable        | Value                        |
|-----------------|------------------------------|
| `SFTP_HOST`     | `vwebfile.gwdg.de`           |
| `SFTP_PORT`     | `2222`                       |
| `SFTP_USER`     | `raphael.hviding`            |
| `SFTP_PASSWORD` | *(secret)*                   |
| `LOCAL_DIR`     | directory to upload          |
| `REMOTE_DIR`    | remote path (currently a placeholder in the workflow) |

`deploy_sftp.py` wipes `REMOTE_DIR` before uploading, so it requires `paramiko` (`pip install paramiko`).

## Previewing Locally

Open `index.html` directly in a browser, or serve with any static file server:

```bash
python -m http.server 8000
```

No build, compile, or install step required.
