<?php
// SPDX-License-Identifier: AGPL-3.0-or-later
namespace OCA\AltStack\AppInfo;
use OC\Files\Filesystem;
use OC\Files\Mount\HomeMountPoint;
use OCP\AppFramework\App;
use OCP\AppFramework\Bootstrap\IBootstrap;
use OCP\AppFramework\Bootstrap\IBootContext;
use OCP\AppFramework\Bootstrap\IRegistrationContext;
use OCP\Files\Events\BeforeFileSystemSetupEvent;
use OCP\IConfig;
use OCP\INavigationManager;
use OCP\IURLGenerator;
use OCP\Util;
use OCA\AltStack\Listener\QuotaListener;
use OCA\AltStack\Storage\GlobalQuota;
class Application extends App implements IBootstrap {
 public function __construct(){parent::__construct('altstack');}
 public function register(IRegistrationContext $context):void{$context->registerEventListener(BeforeFileSystemSetupEvent::class,QuotaListener::class);}
 public function boot(IBootContext $context):void{
  // A single persistent-volume write lock covers a complete request, including
  // file-cache updates. Concurrent requests cannot each spend the same free bytes.
  if(in_array($_SERVER['REQUEST_METHOD']??'', ['PUT','POST','PATCH','MOVE','COPY','MKCOL','DELETE'],true)){
   $file=fopen('/var/www/html/data/.altstack-write.lock','c');$until=microtime(true)+25;
   while(!flock($file,LOCK_EX|LOCK_NB)){if(microtime(true)>$until){http_response_code(503);header('Retry-After: 5');exit('Storage is busy. Please retry.');}usleep(10000);}
   register_shutdown_function(static function()use($file){flock($file,LOCK_UN);fclose($file);});
  }
  Util::addStyle('altstack','vigiltech/css/vigilsans');
  Util::addStyle('altstack','vigiltech/css/goldengate');
  $styleRevision=substr(hash_file('sha256',__DIR__.'/../../css/vigiltech-drive.css'),0,12);
  Util::addStyle('altstack','vigiltech-drive-'.$styleRevision);
  Util::addScript('altstack','vigiltech');
  $context->injectFn(static function(IConfig $config,INavigationManager $navigation,IURLGenerator $urls){$settings=$config->getSystemValue('altstack',[]);foreach(['desktop'=>['VigilTech desktop',$settings['origin']??''],'office'=>['Vigil Office',$settings['office']??''],'search'=>['Vigil Search',($settings['origin']??'').'/search/'],'mail'=>['Vigil Mail',($settings['origin']??'').'/mail'],'calendar'=>['Vigil Calendar',($settings['origin']??'').'/calendar'],'social'=>['Vigil Social',($settings['origin']??'').'/social']]as$id=>$item)$navigation->add(['id'=>'altstack_'.$id,'order'=>3,'href'=>$item[1],'icon'=>$urls->imagePath('altstack','navigation-'.$id.'.png'),'name'=>$item[0]]);});
 }
}

