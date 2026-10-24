<?php
// SPDX-License-Identifier: AGPL-3.0-or-later
$origin = rtrim(getenv('WAREHOUSE_ORIGIN'), '/');
$CONFIG = [
 'overwrite.cli.url' => $origin,
 'overwriteprotocol' => 'https',
 'overwritehost' => parse_url($origin, PHP_URL_HOST),
 'trusted_proxies' => ['10.0.0.0/8','172.16.0.0/12','192.168.0.0/16','fc00::/7'],
 'allow_local_remote_servers' => false,
 'defaultapp' => 'files',
 'knowledgebaseenabled' => false,
 'simpleSignUpLink.shown' => false,
 'user_oidc' => ['auto_provision'=>true,'soft_auto_provision'=>true,'enable_default_claims'=>false,'single_logout'=>false],
 'altstack' => ['origin'=>rtrim(getenv('ALTSTACK_ORIGIN'),'/'),'office'=>rtrim(getenv('OFFICE_ORIGIN'),'/'),'service_secret'=>getenv('WAREHOUSE_SERVICE_SECRET'),'global_bytes'=>128000000000],
 'appstoreenabled' => false,
 'loglevel' => 2,
 'maintenance_window_start' => 7,
 'trashbin_retention_obligation' => 'auto, 7',
 'versions_retention_obligation' => 'auto, 7',
];
