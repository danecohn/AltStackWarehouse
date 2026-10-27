# Cohnsoft Drive

<!-- artemis-publisher:start -->
<img src="altstack/css/cohnsoft/logos/mark/cohnsoft-mark.svg" alt="Cohnsoft" width="340">

**A product of Cohnsoft.** Founded by **Demetria Althea Cohn**.

Companion software for macOS, thoughtfully available for Windows and Linux. See the [Cohnsoft identity and design system](altstack/css/cohnsoft/BRAND.md). Platform availability varies by product and release.
<!-- artemis-publisher:end -->


Modified distribution of Nextcloud 33.0.10 and the official user_oidc 8.9.0 app, pinned by container/archive SHA-256. The bundled `altstack` integration is AGPL-3.0-or-later. Nextcloud/user_oidc retain their original licenses, copyright notices and source links. Modified source is published with this service.

Warehouse is the canonical cloud file store. Office reads/writes the same files through authenticated WebDAV with short-lived, signed AltStack account credentials. Free accounts share 2,000,000,000 bytes across applications; Plus accounts share 8,000,000,000 bytes. Office history snapshots in `AltOffice/.history` count in this allowance. Opening an existing Warehouse document does not copy it. Existing Office files and versions are checksum-verified during migration; originals remain for rollback.

The global live-file budget is 128,000,000,000 bytes on a 150 GB persistent volume. Each owner files root is counted once; shared views do not create another allocation. A persistent-volume write mutex serializes HTTP mutations through file-cache commit. It deliberately favors correct small-instance quotas over concurrent upload throughput. Nextcloud's normal personal quota remains enabled as well. Quotas refresh from the billing authority, including downgrades; unavailable entitlements block new writes. Trash, versions, databases, and temporary upload chunks need physical headroom beyond the live-file budget.

Runtime: PostgreSQL 17, authenticated Redis 8, persistent `/var/www/html`, HTTPS managed domain. Set trusted domains to the generated working Warehouse hostname. Preserve the current Office volume and database. Never attach both services to the same volume or replace the existing Office volume.

Deployment is not ready until the service build, real OIDC login, legacy migration, WebDAV writes and quota enforcement pass against the pinned Nextcloud image. Run cron.php every five minutes in this same container; otherwise background cleanup and expiration do not run. Do not enable public Warehouse access before existing-account migration is verified.
