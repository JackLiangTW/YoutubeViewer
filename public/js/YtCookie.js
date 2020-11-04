function TCookieSet(val){
    //$.cookie.json = true;
    let StrVal=JSON.stringify(val);
    $.cookie('personlist', StrVal, { expires:90, path: '/' });
}
function TCookieGet(Name){
    //console.log($.cookie(`${Name}`));
    if($.cookie(`${Name}`)){        
        return JSON.parse($.cookie(`${Name}`))
    }else{
        return [];
    }
}
function TDeleteCookie(Name){
    //$.cookie(`${Name}`,null);
    $.removeCookie(`${Name}`);
}