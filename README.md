# Oxill Maps

Oxill Maps adds an interactive map view to Obsidian Bases. Notes with a coordinate property become markers; left-click opens a note, while the context menu can create notes and launch configured Oxill Forms forms with coordinates.

## Features

- Native Bases map view on desktop and mobile.
- Configurable map backgrounds.
- Configurable command buttons with selectable icons in the top-right corner.
- Separate, optional Oxill Forms connector that adds configured forms to map context menus and prefills coordinates.
- Local-first operation with no telemetry.

## Installation

### Manual / BRAT

Download `main.js`, `manifest.json`, and `styles.css` from the release and place them in:

```text
<vault>/.obsidian/plugins/oxill-maps/
```

Reload Obsidian and enable **Oxill Maps** in Community plugins.

## Usage

Create a Base, add the **Oxill Maps** view, and select the note property containing coordinates. Coordinates use the `[latitude, longitude]` format.

Configure backgrounds, commands, and forms under **Settings → Community plugins → Oxill Maps**. Oxill Forms integration is optional; it only becomes active when the `oxill-forms` plugin and its public API are available.

## Privacy and compatibility

Oxill Maps does not collect telemetry or send note contents anywhere. Map tile providers configured by the user receive normal tile requests. The command connector uses Obsidian's command manager, which is not part of the stable public API and may require compatibility updates after Obsidian releases.

## Credits and license

Oxill Maps is based on [Obsidian Maps](https://github.com/obsidianmd/obsidian-maps) 0.2.2 by Obsidian. Both projects are licensed under the MIT License; see [LICENSE](LICENSE) and [NOTICE](NOTICE).

Author: [oxill](https://github.com/oxilldat)
