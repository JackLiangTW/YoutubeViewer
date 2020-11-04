async function DoZip(){//把url Image轉成base64 並做成壓縮檔 觸發下載
    $('#DoDownload span').text('0/'+IMGS.length);
    $('#DoDownload').css('display','block');
    if(IMGS.length==0){
        alert('找不到圖片，請先爬取到圖片再下載!!');
        $('#DoDownload').css('display','none');
        return false;
    }
    var zip = new JSZip();        
    var img = zip.folder("images");        
    var ist=0;
    while(ist<IMGS.length){
        var asd=downloadFile(`${IMGS[ist]}`);            
        img.file(`img${ist}.jpg`,asd, {base64: true});
        //img.file("Hello666.txt", "Hello asdasdas World\n");
        ist++;
    }                                                        
    zip.generateAsync({type:"blob"})
    .then(function(content) {
        // see FileSaver.js ||做成壓縮檔 觸發下載
        $('#DoDownload').css('display','none');
        saveAs(content, "Crawlers.zip");
    });                
}

function downloadFile(url) {//url Image轉成base64
    // or a global Promise if you expect it to exist, see http://caniuse.com/#feat=promises
    return new JSZip.external.Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function() {                
            const TXT=$('#DoDownload span').text();
            const NB=parseInt(TXT.split('/')[0])+1;
            const ALL=TXT.split('/')[1];
            $('#DoDownload span').text(NB+"/"+ALL);
            
            // you should handle non "200 OK" responses as a failure with reject
            resolve(xhr.response);
        };
        // you should handle failures too
        xhr.open('GET', url);
        xhr.send();
    });
}    