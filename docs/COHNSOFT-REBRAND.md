# Cohnsoft Drive

Rebrand the actual Nextcloud service to Cohnsoft Drive using the existing startup theming commands, unchanged canonical company logo and locally bundled Cohn Sans/Golden Gate assets. Canonical asset digests and the pinned cohnsoftassets commit are in altstack/css/cohnsoft/UPSTREAM.json. Cross-app navigation uses full Cohnsoft product names.

The technical custom app ID/namespace, OIDC provider identifier/client ID, users, quotas, account mapping, data volume, file paths, APIs and configuration/environment names remain unchanged. Only the visible login link label is updated in the DOM. Nextcloud/upstream license notices remain intact. The startup hook replaces owned custom-app assets inside the existing persistent installation and applies the new theme name/colour/logo.

Local validation: shell syntax, XML parsing and canonical SHA-256 integrity checks. No PHP/Docker runtime is installed locally; real PHP syntax and OIDC/WebDAV/quota/Office-migration integration are exercised by the existing CI container workflow. Production deployment and browser checks follow the build; no unrun integration check is claimed passed.
