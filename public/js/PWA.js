const broadcast = new BroadcastChannel('count-channel');        

broadcast.onmessage = (event) => {//Get Offline Msg From SW.js            
    document.getElementById('blocks').innerHTML =`<p>沒有網路連線</p><p>請成功連結網路再使用!</p>`;
    document.getElementById('blocks').style.display='block';    
};
if ('serviceWorker' in navigator) {    
    navigator.serviceWorker.register('./sw.js').then(function (registration) {        
        // 注册成功
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }).catch(function (err) {                   
        // 注册失败 :(
        console.log('WS Errrr: ', err);
    });    
}
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    // console.log('Trigger beforeinstallprompt');
    // alert('觸發 Install Info');
    document.getElementById('DoInstall').style.display='block';
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI notify the user they can install the PWA
    // showInstallPromotion();
});
window.addEventListener('appinstalled', (evt) => {
    // Log install to analytics
    document.getElementById('DoInstall').style.display='none';
    //console.log('INSTALL: Success');
});
function TriggerInstall(){
    if(!deferredPrompt){
        alert('已安裝');
        CloseInstallAlert();
        return false;
    }
    deferredPrompt.prompt();
    console.log('ButtonInstall Clicked');
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
        console.log('Accept');
        } else {
        console.log('Disable Install');
        }
    });
}
function CloseInstallAlert(){
    //console.log(deferredPrompt)
    document.getElementById('DoInstall').style.display='none';
}