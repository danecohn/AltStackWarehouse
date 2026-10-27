# Vigil Drive

Vigil Drive is the Nextcloud file service at drive.altstack.org, skinned with the VigilTech design system. The skin is a Nextcloud app (`altstack`) that loads three stylesheets and one script, plus the startup theming commands in `bootstrap.sh`.

- `altstack/css/vigiltech/` is the shared VigilTech design system (tokens, Vigil Sans, mark), copied in and not linked.
- `altstack/css/vigiltech-drive.css` maps Nextcloud's `--color-*` variables onto the `--vt-*` tokens and adds the glass header and sidebar, the rounded content sheet and the wallpaper login.
- `altstack/js/vigiltech.js` follows Nextcloud's light or dark choice and relabels the sign-in link to "VigilTech".
- `assets/logo.png` and `assets/icons/` are the Vigil Drive icon kit (logo and favicon for `occ theming:config`, plus web and desktop sizes).
- `test/preview/` holds a static preview page of the key surfaces and an in-page contrast audit (see below). It is a stand-in for Nextcloud, not Nextcloud itself.

Unchanged on purpose: the custom app id and namespace (`altstack`), the OIDC provider identifier and client id, `ALTSTACK_*` environment names, the `x-altstack-*` headers, users, quotas, data volume, file paths and APIs. Nextcloud and user_oidc keep their own licences and notices; the bundled integration stays AGPL-3.0-or-later.

## Contrast preview

Serve `test/preview` on any local port (for example `python3 -m http.server 4800 -d test/preview`), open `index.html`, and run `audit.js` in the page console, or load `index.html?audit=1` to see the result in the page. The audit checks every text node against its background in light and dark, and again with hover, focus, active and disabled styles forced on.
