<?php
// SPDX-License-Identifier: AGPL-3.0-or-later
namespace OCA\AltStack\Listener;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\Files\Events\BeforeFileSystemSetupEvent;
use OCP\IConfig;
use OCP\Http\Client\IClientService;
use OCP\Files\StorageNotAvailableException;
class QuotaListener implements IEventListener {
 public function __construct(private IConfig $config,private IClientService $clients){}
 public function handle(Event $event):void{
  if(!$event instanceof BeforeFileSystemSetupEvent)return;$user=$event->getUser();$uid=$user->getUID();if(!preg_match('/^ast_[a-f0-9]{40}$/',$uid))return;
  $last=(int)$this->config->getUserValue($uid,'altstack','quota_checked','0');if($last>time()-60)return;
  $settings=$this->config->getSystemValue('altstack',[]);$path='/api/internal/warehouse-entitlement?uid='.rawurlencode($uid);$time=(string)(int)round(microtime(true)*1000);$signature=rtrim(strtr(base64_encode(hash_hmac('sha256',$time."\nGET\n".$path,$settings['service_secret'],true)),'+/','-_'),'=');
  try{
   $response=$this->clients->newClient()->get($settings['origin'].$path,['timeout'=>8,'allow_redirects'=>false,'headers'=>['x-altstack-time'=>$time,'x-altstack-signature'=>$signature]]);
   $body=json_decode($response->getBody(),true,flags:JSON_THROW_ON_ERROR);if(($body['uid']??'')!==$uid||!in_array($body['quotaBytes']??0,[2000000000,8000000000],true))throw new \RuntimeException('Invalid quota response');
   $user->setQuota((string)$body['quotaBytes']);$this->config->setUserValue($uid,'altstack','quota_checked',(string)time());
  }catch(\Throwable $e){
   // An expired entitlement must never silently grant a new or unlimited allowance.
   if(in_array($_SERVER['REQUEST_METHOD']??'', ['PUT','POST','PATCH','MOVE','COPY','MKCOL'],true))throw new StorageNotAvailableException('AltStack storage plan verification is temporarily unavailable.');
  }
 }
}
