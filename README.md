# Zhinstatic

My Svelte learning project that serves static files.

## Features

- Provides responsive web file browser.
- Sends the web UI or the file depending on the `Accept` header.
  - This means that in the browser you'll have UI but if you send the same link to Discord or `wget` you'll get the file itself.
- Finds correct mime type according to the file's extension or it's magic number.
  - Caches magic number results in SQLite for performance.
- Static files are streamed.
- Prerenders pages in dark/light mode according to cookie.

### TODO

- Generates thumbnails in various sizes for images and videos.
- Automatically prunes its cache at given time.
- Automatically invalidate cache on file changes.

## Technologies used

- [Tailwind CSS](https://tailwindcss.com/)
- [Svelte](https://svelte.dev/) (of course)
- [SvelteKit](https://kit.svelte.dev/)
- [Sharp](https://sharp.pixelplumbing.com/)
- [Prisma](https://prisma.io/)

## Usage

### Requirements

- PNPM (optimally)
- Node v16 to v18
- FFmpeg for thumbnails of videos or unsupported images (optional; won't generate thumbnails for those without ffmpeg)

### Building

1. `pnpm install` to download dependencies
2. `pnpm build:db` to prepare the cache database
3. `pnpm build` to build the app

### Running

1. Configure `.env`, use `.env.example` as a template
2. Start with `pnpm start` or `node .`

### Notes

- You can freely purge the `cache/thumbnails` folder if you feel like it
- You **shouldn't** delete `cache/cache.db` while the app is running and you have to run `pnpm build:db` if you delete it.

## Disclaimer

I made this project for myself and to learn Svelte. You probably shouldn't use it in production or elsewhere, but you can learn from it and use its parts in accordance to the license.

## License

Copyright (C) 2022 Zhincore

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
