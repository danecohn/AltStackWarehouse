// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
const m=JSON.parse(readFileSync('altstack/img/PROVENANCE.json'));assert.equal(m.files.length,6);
for(const f of m.files)assert.equal(createHash('sha256').update(readFileSync('altstack/img/'+f.path)).digest('hex'),f.sha256,f.path);
const php=readFileSync('altstack/lib/AppInfo/Application.php','utf8');assert.ok(php.includes("$urls->imagePath('altstack','navigation-'.$id.'.png')"));assert.ok(!php.includes("'icon'=>''"));
console.log('Six navigation icons preserve supplied bytes and the Nextcloud image route is configured.');
