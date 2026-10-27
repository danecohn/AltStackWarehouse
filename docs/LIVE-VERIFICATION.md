# Real-service verification

The signed-in Nextcloud service rendered six broken header images because custom navigation entries explicitly used an empty icon URL. Set those six existing entries to Nextcloud's image route and use the exact assigned VigilTech 64px product files. IDs, navigation destinations, OIDC provider, quota handling and stored files remain unchanged.

The real selected Files row paints a Nextcloud list-item background underneath the bridge's translucent link. Fix the entire selected row surface and its direct name element together; the preview's simpler markup missed this interaction. Existing upstream theme controls remain authoritative.

The controlled Office verification document created on October 27 appeared immediately in the real Drive recommendations, confirming shared storage. No user files were deleted or migrated. Exact image bytes are checked by test/test-navigation.mjs; final live appearance/state audits are recorded separately after deployment.

The deployed icon fix removed the broken menu images, but a returning browser reused the old CSS URL and selected-row styling. Content-address the owned bridge stylesheet by its SHA-256 prefix, generating the copy during Docker build and registering that filename in Nextcloud. This is disposable stylesheet caching; app version/ID, database, files and session keys remain unchanged.

Follow-up: Nextcloud 33 no longer exposes OCP Util::imagePath; injecting IURLGenerator and calling its imagePath is the supported route. PHP linting did not catch this runtime API mismatch, so the authenticated CI login test now checks that all six custom navigation entries exist and each icon route returns a PNG. The real selected row also has a later four-class scoped !important rule; target the stable navigation ID in :is() to keep the owned foreground/background pair authoritative.

Real appearance testing found another preview mismatch: Nextcloud 33 stores data-themes on BODY rather than HTML and changes it at runtime. Synchronize the owned token attribute from that authoritative body state, observe only that attribute, and clear the override for System. The owned script also gets a content-addressed filename so returning clients load the fix. Preserve Nextcloud's font-face variable so the user's accessibility font can take precedence over the default Vigil Sans. The bridge never writes a saved appearance preference.
