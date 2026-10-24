<?php
// SPDX-License-Identifier: AGPL-3.0-or-later
namespace OCA\AltStack\Storage;
use OC\Files\Storage\Wrapper\Quota;
use OCP\Files\Storage\IStorage;
use OCP\IDBConnection;
use OCP\Server;
class GlobalQuota extends Quota {
 protected function getSize(string $path,?IStorage $storage=null):int|float{
  $db=Server::get(IDBConnection::class);$qb=$db->getQueryBuilder();
  // Only each owner's files root is counted. Shared mounts are not counted again.
  $qb->select($qb->createFunction('COALESCE(SUM(CASE WHEN f.size > 0 THEN f.size ELSE 0 END),0) AS total'))->from('filecache','f')->innerJoin('f','storages','s','f.storage = s.numeric_id')->where($qb->expr()->eq('f.path',$qb->createNamedParameter('files')))->andWhere($qb->expr()->like('s.id',$qb->createNamedParameter('home::%')));
  $result=$qb->executeQuery();try{return (int)$result->fetchOne();}finally{$result->closeCursor();}
 }
}
