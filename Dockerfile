FROM docker.io/library/nextcloud:33.0.10-apache@sha256:e02fb1a7558bae683188eb94471cdb1b4550970f905e615c8e9d10c4760f13a1
# mod_php requires prefork; disable competing MPMs shipped by the base image.
RUN a2dismod mpm_event mpm_worker && a2enmod mpm_prefork && apache2ctl -t
RUN set -eux; curl -fL --retry 3 -o /tmp/user_oidc.tar.gz https://github.com/nextcloud-releases/user_oidc/releases/download/v8.9.0/user_oidc-v8.9.0.tar.gz; echo 'e3f8bc89d07e87993a805eab774b49a14c6b732edf5c9f705df2389596ab9e71  /tmp/user_oidc.tar.gz' | sha256sum -c -; mkdir -p /opt/altstack; tar -xzf /tmp/user_oidc.tar.gz -C /opt/altstack; rm /tmp/user_oidc.tar.gz
COPY . /opt/altstack/warehouse/
COPY assets/logo.svg /opt/altstack/logo.svg
RUN mkdir -p /docker-entrypoint-hooks.d/before-starting; cp /opt/altstack/warehouse/bootstrap.sh /docker-entrypoint-hooks.d/before-starting/altstack.sh; chmod 755 /docker-entrypoint-hooks.d/before-starting/altstack.sh
ENV NEXTCLOUD_DATA_DIR=/var/www/html/data PHP_MEMORY_LIMIT=512M PHP_UPLOAD_LIMIT=512M APACHE_BODY_LIMIT=536870912
LABEL org.opencontainers.image.title="AltStack Warehouse" org.opencontainers.image.licenses="AGPL-3.0-or-later" org.opencontainers.image.source="https://github.com/danecohn/AltStackWarehouse"
EXPOSE 80
