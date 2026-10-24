<?php
// Test-only mutation of an ephemeral database: simulate quota-sized file usage.
define('OC_CONSOLE',1);require '/var/www/html/lib/base.php';
$db=\OCP\Server::get(\OCP\IDBConnection::class);$uid=$argv[1];$size=(int)$argv[2];
$qb=$db->getQueryBuilder();$qb->select('numeric_id')->from('storages')->where($qb->expr()->eq('id',$qb->createNamedParameter('home::'.$uid)));$r=$qb->executeQuery();$storage=$r->fetchOne();$r->closeCursor();if($storage===false)throw new \RuntimeException('User storage was not created');
$qb=$db->getQueryBuilder();$qb->update('filecache')->set('size',$qb->createNamedParameter($size,\OCP\DB\QueryBuilder\IQueryBuilder::PARAM_INT))->where($qb->expr()->eq('storage',$qb->createNamedParameter((int)$storage,\OCP\DB\QueryBuilder\IQueryBuilder::PARAM_INT)))->andWhere($qb->expr()->eq('path',$qb->createNamedParameter('files')));$qb->executeStatement();
$qb=$db->getQueryBuilder();$qb->delete('preferences')->where($qb->expr()->eq('userid',$qb->createNamedParameter($uid)))->andWhere($qb->expr()->eq('appid',$qb->createNamedParameter('altstack')))->andWhere($qb->expr()->eq('configkey',$qb->createNamedParameter('quota_checked')));$qb->executeStatement();

$user=\OCP\Server::get(\OCP\IUserManager::class)->get($uid);echo json_encode(['uid'=>$uid,'storage'=>$storage,'simulatedUsage'=>$size,'quota'=>$user?->getQuota(),'quotaBytes'=>$user?->getQuotaBytes()])."\n";

