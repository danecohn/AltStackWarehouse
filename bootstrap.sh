#!/bin/sh
set -eu
: "${ALTSTACK_ORIGIN:?}" "${OFFICE_ORIGIN:?}" "${WAREHOUSE_ORIGIN:?}" "${WAREHOUSE_OIDC_SECRET:?}" "${WAREHOUSE_SERVICE_SECRET:?}"
occ() { php /var/www/html/occ "$@"; }
cp -R /opt/altstack/user_oidc /var/www/html/custom_apps/
cp -R /opt/altstack/warehouse/altstack /var/www/html/custom_apps/
cp /opt/altstack/warehouse/altstack.config.php /var/www/html/config/altstack.config.php
chown -R www-data:www-data /var/www/html/custom_apps/user_oidc /var/www/html/custom_apps/altstack /var/www/html/config/altstack.config.php
mkdir -p /var/www/html/healthz
cp /opt/altstack/warehouse/healthz.php /var/www/html/healthz/index.php
occ app:enable user_oidc altstack
occ user_oidc:provider AltStack --clientid=altstack-warehouse --clientsecret-env=WAREHOUSE_OIDC_SECRET --discoveryuri="$ALTSTACK_ORIGIN/sso/.well-known/openid-configuration" --unique-uid=0 --mapping-uid=sub --mapping-display-name=name --mapping-quota=quota --scope='openid profile quota' --check-bearer=1 --bearer-provisioning=1
occ config:app:set user_oidc allow_multiple_user_backends --value=0
occ config:app:set files default_quota --value=2000000000
occ config:system:set defaultapp --value=files
occ config:system:set default_language --value=en
occ config:system:set skeletondirectory --value=''
occ config:system:set htaccess.RewriteBase --value=/
occ maintenance:update:htaccess
occ theming:config name 'AltStack Warehouse'
occ theming:config url "$ALTSTACK_ORIGIN"
occ theming:config slogan 'Your files. Your stack. Everywhere.'
occ theming:config color '#3569a4'
occ theming:config logo /opt/altstack/logo.svg
occ theming:config background backgroundColor
occ config:app:set theming footer --value='AltStack LLC · Based on Nextcloud · Open source'
# Preserve upstream legal notices and the installed apps' AGPL source links.
occ background:cron
# Nextcloud cleanup/expiry work must run alongside Apache in this single-volume service.
(while :; do php -f /var/www/html/cron.php || echo 'Warehouse background task failed' >&2; sleep 300; done) &

