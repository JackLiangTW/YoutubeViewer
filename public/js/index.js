var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

let BigArray=[];//所有PO文data
let BigTagArray=[];//tag種類類別
let BigShareArray=[];//該social種類所有share ele
let IMGS=[];//下載圖url
let MyDeletePost=[];
const TODAY=GetToday();//今天日期
let THE_POST_ID;//DB的_id
let Class_NB='';//社群種類
let GROUP_NB=-1;//show團總類
let GROUP_CLS='likes';//排序方式
$( document ).ready(function() {
    if(mobileCheck())GetTodayKindData('intro');//For Mobile
    else{GetTodayKindData('YtM-men');}//For PC
    GetMsgData();
});

async function GetTodayKindData(KIND,IsBegin){//ajax得到 DB該天PO文data
    if(KIND=='intro'){//介紹區  ---防止 Ytube第一頁無法 autoPlay
        ClearAllContent();
        $('#SocialKind>button').eq(0).addClass('ISactive').siblings('button').removeClass('ISactive');
        $('#PostClassSelect').css('display','none');
        $('#SelectShow').css('display','none');
        OuterAppendIntro();//Append Html說明/介紹
        return false;
    }
    let DATES=TODAY;
    Class_NB=KIND;
    $('#blocks').css('display','block');
    if(KIND.includes('test'))$('#btnDownLoad').css('display','none');
    else{$('#btnDownLoad').css('display','inline-block');}
    // let DATES='2020,3,15';
    // if(KIND.includes('test'))DATES=TODAY;
    return new Promise(function(resolve, reject) {
        $.ajax({//初始化 抓今日data
            url: `/getData?date=${DATES}&kind=${KIND}`,
            type:'GET',
            dataType: "json",
            success:async function(result){
                //console.log(result);
                if(result.data!=false){
                    ClearAllContent();
                    THE_POST_ID=result.data['_id'];
                    //$('#SelectName').text(result.data.date);
                    //$('#SelectName').text(ToDate(result.data.date))//日期
                    $('#SelectShow').css('display','none');
                    $('#PostClassSelect').css('display','block');
                    if(KIND=='facebook'){
                        GetShareDataFromDB(KIND);
                        FbShareControlInit(result.data.data);
                        FbShareShowTags(-1);
                    }
                    else if(KIND=='ig'||KIND=='twitter'){
                        GetShareDataFromDB(KIND);
                        IGTwitterControlInit(result.data.data,KIND);
                    }
                    else if(KIND=='tiktoktest'){
                        $('#PostClassSelect').css('display','none');
                        TikTokShareInit(result.data.data,KIND);
                    }
                    else if(KIND=='facebooktest'||KIND=='igtest'||KIND=='twittertest'){
                        ShareInit(result.data.data,KIND);
                    }
                    else if(KIND=='youtube'||KIND=='YoutubeMusic'||KIND=='YoutubeLive'
                    ||KIND=='YtHotMusic'||KIND=='YtTrending'||KIND=='YtMusicSort'||KIND=='YoutubeMusic2'
                    ||KIND=='YtM-men'||KIND=='YtM-girl'||KIND=='YtM-group'||KIND=='YtM-world'
                    ||KIND=='YtM-WestMen'||KIND=='YtM-WestGirl'||KIND=='YtM-WestGroup'
                    ||KIND=='YtM-JpMen'||KIND=='YtM-JpGirl'||KIND=='YtM-JpGroup'
                    ||KIND=='YtM-KrMen'||KIND=='YtM-KrGirl'||KIND=='YtM-KrGroup'){
                        $('#PostClassSelect').css('display','none');
                        IsYoutubePage=true;
                        if(IsBegin)YoutubeInit(result.data.data,KIND,true);
                        else{YoutubeInit(result.data.data,KIND);}
                    }
                    $('#blocks').css('display','none');
                    // await GetMsgData().then(()=>{//載入 聊天室Data
                    //     $('#blocks').css('display','none');
                    // })
                    resolve("DONE");
                }else{
                    $('#blocks').css('display','none');
                    alert(`查詢不到${DATES}的資料!`);
                    reject("Fail");
                }
            }}
        );
    });
}
async function GetShareList(){//分享區init
    ClearAllContent();
    return new Promise(function(resolve, reject) {
        $.ajax({//初始化 抓今日data
            url: `/getList`,
            type:'GET',
            dataType: "json",
            success:async function(result){
                console.log(result.data);
                resolve();
            }
        });
    });
}
async function RenderTrendingApiBtn(){//Yt發燒影片 Render地區btn (用ajax取得)
    $('#SocialKind>button').eq(0).addClass('ISactive').siblings('button').removeClass('ISactive');
    $('#PostClassSelect').css('display','none');
    $('#SelectShow').css('display','none');
    $('#PostClassSelect').css('display','none');
    $('#ClassBtns').empty();
    $('#ClassBtns').css('display','block');
    IsYoutubePage=true;
    let TrendDataMenu=[
        {name:'台灣',region:'TW'},
        {name:'韓國',region:'KR'},
        {name:'日本',region:'JP'},
        {name:'香港',region:'HK'},
        {name:'馬來西亞',region:'MY'},
        {name:'美國',region:'US'},
        {name:'英國',region:'GB'},
        {name:'法國',region:'FR'},
        {name:'德國',region:'DE'},
        {name:'西班牙',region:'ES'},
        {name:'加拿大',region:'CA'},
    ];
    TrendDataMenu.forEach((i,a)=>{
        $('#ClassBtns').append(`
            <button onclick="YtApiForTrendingData('${i['region']}')">${i['name']}</button>
        `);
    });
    $('#ClassBtns>button').eq(0).addClass('ISactive').siblings('button').removeClass('ISactive');
    YtApiForTrendingData(TrendDataMenu[0]['region']);
}
function GetMsgData(){
    return new Promise(async function(resolve, reject) {
        //console.log('sdasds');
        let MsgMaxNB=10;
        if(mobileCheck()){MsgMaxNB=5;}
        $.ajax({//初始化 抓今日data
            url: `/getMsg?nb=${MsgMaxNB}`,
            type:'GET',
            dataType: "json",
            success: function(result){
                //console.log(result);
                for (let i = result.data.length-1; i >= 0; i--) {
                    if(result.data[i].data[1].length!=0){//Is List Msg
                        $('#ShareContentArea div.datas').append(`
                        <p class="Other">
                        <span>${result.data[i].data[0]}</span>
                        <button key="${ShareVideoAllData.length}" class="PlayShareList">►</button>
                        <span class='times'>${TransformTimeToDate(result.data[i].date)}</span>
                        </p>
                        `);
                        ShareVideoAllData.push(result.data[i].data[1]);
                    }else{//Is Pure Text
                        $('#ShareContentArea div.datas').append(`
                        <p class="Other">
                        <span>${result.data[i].data[0]}</span>
                        <span class='times'>${TransformTimeToDate(result.data[i].date)}</span>
                        </p>
                        `);
                    }
                }
                resolve("DONE");
            }
        })
    });
}
function TransformTimeToDate(NB){
    let Seconds=new Date().getTime()-parseInt(NB);
    let out=`${parseInt(Seconds/1000)}秒前`;
    let Stm=Seconds/(60)/1000;//分鐘
    let Sth=Seconds/(60 * 60 )/1000;//小時
    let Std=Seconds/(60 * 60 *24)/1000;//天
    if(Stm>=1)out=`${parseInt(Stm)}分前`;
    if(Sth>=1)out=`${parseInt(Sth)}時前`;
    if(Std>=1)out=`${parseInt(Std)}天前`;
    return out;
}
function GetShareDataFromDB(KIND){
    return new Promise(function(resolve, reject) {
        $.ajax({//初始化 抓今日data
            url: `/getData?date=${TODAY}&kind=${KIND}test`,
            type:'GET',
            dataType: "json",
            success: function(result){
                //console.log(result.data.data);
                BigShareArray=result.data.data;
                resolve("DONE");
            }
        });
    });
}
$(document).on("click",'.days',async function(){//點擊日期btn(GET該日data)
    let KEYS=$(this).attr('key');
    let KIND=$(this).attr('kind');
    THE_POST_ID=KEYS;//換篇id
    MyDeletePost=[];//換篇 清空delete資料
    await GetIdData(KEYS,KIND);
});
$(document).on("click",'.btnDelete',function(){//刪除 locak Post Array該篇post
    let KEYS=$(this).attr('key');
    KEYS=KEYS.split(',');
    BigArray[KEYS[0]][KEYS[1]]=false;//從local Array中刪除
    MyDeletePost.push([KEYS[0],KEYS[1]]);
    $(this).parent('.PostChap').remove();
});
$(document).on("click",'#ClassBtns > button',function(){
    let KEYS=$(this).attr('key');
    GROUP_NB=KEYS;
    $('#NormalClass').addClass('ISactive').siblings('button').removeClass('ISactive');
    $(this).addClass('ISactive').siblings('button').removeClass('ISactive');
    if($(this).hasClass('IsFB'))GroupClick(parseInt(KEYS));
    else if($(this).hasClass('IsIG'))IGshowData(parseInt(KEYS));
    else if($(this).hasClass('IsTW')){
        let links=$(this).attr('links');
        TWshowData(parseInt(KEYS),links);
    }
    else if($(this).hasClass('IsFBshare'))FbShareShowTags(parseInt(KEYS));
    else if($(this).hasClass('IsYt'))ShowYtEmbed(KEYS);
    $("html, body").animate({ scrollTop: 0 },400);//切換page->scroll to Top
});
$(document).on("click",'#SubClassBtns > button',function(){
    let KEYS=$(this).attr('key');
    $('#NormalClass').addClass('ISactive').siblings('button').removeClass('ISactive');
    $(this).addClass('ISactive').siblings('button').removeClass('ISactive');
    FbShareShowData(parseInt(KEYS));
    GROUP_NB=KEYS;
    $("html, body").animate({ scrollTop: 0 },400);//切換page->scroll to Top
});
$('.classchoose').on('click',async function(){//選取顯示社群 FB/IG/Twitter
    $(this).addClass('ISactive').siblings('button').removeClass('ISactive');
});
$('#GoTop').on('click',async function(){
    $("html, body").animate({ scrollTop: 0 },400);
});
$('#SocialKind > button').on('click',async function(){//選取顯示社群 FB/IG/Twitter
    $(this).addClass('ISactive').siblings('button').removeClass('ISactive');
    $('#NormalClass').addClass('ISactive').siblings('button').removeClass('ISactive');
});
$('#SelectShow > button').on('click',async function(){//選取排序方式 時間/讚數/留言數
    let KEYS=$(this).attr('key');
    $(this).addClass('ISactive').siblings('button').removeClass('ISactive');
    SortClick(KEYS);
});
$('#GetAllCrawler > button').on('click',async function(){//取得 DB所有"日期爬蟲key"
    $('#AllDays').css('display','block');
    const THIS=$(this).parent('#GetAllCrawler');
    let ssa=await GetCrawlerAllDay(THIS);
    console.log(ssa);
});
$('#btnCrawler').on('click',async function(){//爬蟲 現在名單內的所有PO文
    $(this).css('background','red').text('爬蟲中...');
    await DoCrawler();
    $(this).css('background','pink').text('爬最新');
});
function GroupClick(nb){//點擊 某社團分類
    GROUP_NB=nb;
    Reshow();
}
function SortClick(nb){//點擊 分類/排序 類別
    GROUP_CLS=nb;
    Reshow();
}
async function SendToDB(){//將修改的 Aarray傳回DB
    var i=0;
    while(i<BigArray.length){
        var s=0;
        while(s<BigArray[i].length){
            if(BigArray[i][s]==false){//該child為false/空直
                BigArray[i].splice(s,1);//length被裁短,s不用++
            }else{
                s++;
            }
        }
        i++;
    }
    console.log(BigArray);
    let VV=await SendChange();
    console.log(VV);
}
function DoCrawler(){//ajax執行爬蟲 爬當下資料
    return new Promise(function(resolve, reject) {
        console.log("Is Run DoCrawler");
        $.ajax({
            url: "/DoCrawler",
            type:'POST',
            data:{},
            dataType: 'text',
            contentType: 'application/json; charset=utf-8',
            timeout:0,
            success: function(result){
                console.log(result);
                resolve('DONE');
            },
            error:function(err){
                console.log(err);
                reject(err);
            }
        });
    }).catch((e) => {//-解決Uncaught (in promise)
        console.log("E:"+e);
    });
}
function GetIdData(ids,KIND){//ajax得到 DB該天PO文data
    return new Promise(function(resolve, reject) {
        $.ajax({
            url: `/getData?_id=${ids}&kind=${KIND}`,
            type:'GET',
            timeout:0,
            success: function(result){
                //console.log(result);
                ClearAllContent();
                //$('#SelectName').text(result.data.date);
                FBControlInit(result.data.data);
                JudgeData(BigArray,20,GROUP_CLS);
                resolve("done");
            },
            error:function(err){
                console.log(err);
            }
        });
    });
}
function GetCrawlerAllDay(THIS){//ajax得到 DB天數項目
    return new Promise(function(resolve, reject) {
        $.ajax({
            url: "/getAllTime",
            type:'POST',
            timeout:0,
            success: function(result){
                var inb=0;
                THIS.find('span').empty();
                while(inb<result.data.length){
                    THIS.find('span').append(`
                    <button class="days"
                        key="${result.data[inb]['_id']}"
                        kind="${result.data[inb]['kind']}"
                    >
                        ${result.data[inb].date}</button>
                    `);
                    inb++;
                }
                //console.log(result);
                resolve("done");
            },
            error:function(err){
                console.log(err);
            }
        });
    });
}
function SendChange(){//ajax 送出修改DB
    return new Promise(function(resolve, reject) {
        console.log(MyDeletePost);
        $.ajax({
            url: "/ChangeDB",
            type:'POST',
            contentType:"application/json",
            dataType:"json",
            data:JSON.stringify({
                id:THE_POST_ID,
                val:MyDeletePost
            }),
            timeout:0,
            success: function(result){
                MyDeletePost=[];//清空
                resolve(result);
            },
            error:function(err){
                console.log(err);
                resolve(err);
            }
        });
    });
}
function FBControlInit(MainArr){//初始化建立 按鈕
    let i=0;
    $('#ClassBtns').css('display','block');
    $('#ClassBtns').append(`
    <button class="ISactive IsFB" key="-1">全部</button>
    `);
    while(i<MainArr.length){
        $('#ClassBtns').append(`
            <button class="IsFB" key="${i}">${MainArr[i]['title']}</button>
        `);
        for(var s=0;s<MainArr[i]['data_txt'].length;s++){//設置刪除位置記號
            MainArr[i]['data_txt'][s]['sort']=[i,s];
        }
        BigArray.push(MainArr[i]['data_txt']);
        i++;
    }
}
function FbShareControlInit(MainArr){//初始化建立 按鈕
    let i=0;
    $('#ClassBtns').css('display','block');
    $('#ClassBtns').append(`
    <button class="ISactive IsFBshare" key="-1">全部隨機</button>
    `);
    while(i<MainArr.length){
        let TagIsExist=false;
        for(var t=0;t<BigTagArray.length;t++){
            let TheTag=MainArr[i]['tags'].split(',');
            //TheTag=TheTag[TheTag.length-1];
            if(BigTagArray[t]['tags']==TheTag[1]){
            //if(BigTagArray[t]['tags']==MainArr[i]['tags'][1]){
            //if(BigTagArray[t]['tags']==MainArr[i]['tags']){
                BigTagArray[t]['titles'].push(
                    {
                        name:MainArr[i]['title'],
                        nb:i
                    }
                );
                TagIsExist=true;
                break;
            }
        }
        if(TagIsExist==false){
            let dd={
                //tags:MainArr[i]['tags'][0],
                //tags:MainArr[i]['tags'],
                tags:MainArr[i]['tags'].split(',')[1],
                titles:[
                    {
                        name:MainArr[i]['title'],
                        nb:i
                    }
                ],
            };
            BigTagArray.push(dd);
        }
        BigArray.push(MainArr[i]['data_txt']);
        i++;
    }
    for(var g=0;g<BigTagArray.length;g++){
        $('#ClassBtns').append(`
            <button class="IsFBshare" key="${g}">${BigTagArray[g]['tags']}</button>
        `);
    }
    //console.log(BigTagArray);
}
function IGTwitterControlInit(MainArr,KIND){
    $('#ClassBtns').empty();
    $('#ClassBtns').css('display','block');
    let i=0;
    while(i<MainArr.length){
        if(i==0){
            if(KIND=='ig'){
                $('#ClassBtns').append(`
                    <button class="IsIG ISactive" key="${i}">${MainArr[i]['title']}</button>
                `);
            }else{
                $('#ClassBtns').append(`
                    <button class="IsTW ISactive" links="${MainArr[i]['url']}" key="${i}">${MainArr[i]['title']}</button>
                `);
            }
        }else{
            if(KIND=='ig'){
                $('#ClassBtns').append(`
                    <button class="IsIG" key="${i}">${MainArr[i]['title']}</button>
                `);
            }else{
                $('#ClassBtns').append(`
                    <button class="IsTW" links="${MainArr[i]['url']}" key="${i}">${MainArr[i]['title']}</button>
                `);
            }
        }
        for(var s=0;s<MainArr[i]['data_txt'].length;s++){//設置刪除位置記號
            MainArr[i]['data_txt'][s]['sort']=[i,s];
        }
        BigArray.push(MainArr[i]['data_txt']);
        i++;
    }
    if(KIND=='ig')IGshowData(0);
    else if(KIND=='twitter'){TWshowData(0,MainArr[0]['url'])}
}
function YoutubeInit(MainArr,KIND,IsBegin){//Youtube Init Chennels Menu
    $('#ClassBtns').empty();
    $('#ClassBtns').css('display','block');
    let i=0;
    while(i<MainArr.length){
        if(MainArr[i]['data'].length==0){//沒有 code 跳過RenderBtn
            i++;
            continue;
        }
        if(i==0&&IsBegin){
            $('#ClassBtns').append(`
                <button class="IsYt" key="${BigArray.length}">${MainArr[i]['name']}</button>
            `);
        }
        else if(i==0){
            $('#ClassBtns').append(`
                <button class="IsYt ISactive" key="${BigArray.length}">${MainArr[i]['name']}</button>
            `);
        }else{
            $('#ClassBtns').append(`
                <button class="IsYt" key="${BigArray.length}">${MainArr[i]['name']}</button>
            `);
        }

        //先刪減影片最多show 20個 (PC Device)
        // if(MainArr[i]['data'].length>20&&mobileCheck()==false){
        //     MainArr[i]['data']=MainArr[i]['data'].slice(0,20);
        // }else if(mobileCheck()){//(Mobile Device) 只show 5Video
        //     MainArr[i]['data']=MainArr[i]['data'].slice(0,10);
        // }

        BigArray.push(MainArr[i]['data']);
        i++;
    }
    if(IsBegin)return false;
    if(BigArray.length>0)ShowYtEmbed(0);
}
function ShowYtEmbed(NB){//Youtube Single Channel Render Embed
    $('#Outer').empty();
    IMGS=[];
    let IdListArr=[];
    let InfoArr=[];
    for(var i=0;i<BigArray[NB].length;i++){
        let TitleText=BigArray[NB][i]['title'];
        if('name' in BigArray[NB][i]){//如果 是'發燒影片'(包含'name'key)
            TitleText=`(${BigArray[NB][i]['name']})${BigArray[NB][i]['title']}`
        }
        let OBJ={
            title:TitleText,
            time:BigArray[NB][i]['time'],
            views:BigArray[NB][i]['views']
        }
        InfoArr.push(OBJ);
        if('videoID' in BigArray[NB][i]){
            IdListArr.push(BigArray[NB][i]['videoID']);
        }
        else if(BigArray[NB][i]['code'].includes('" frameborder="0"')){
            const Slice0=BigArray[NB][i]['code'].indexOf('/embed/')+7;
            const Slice1=BigArray[NB][i]['code'].indexOf('" frameborder="0"');
            let VideoID=BigArray[NB][i]['code'].slice(Slice0,Slice1);//切割出videoId
            IdListArr.push(VideoID);
        }
    }
    BuildYouTubeIframeAPIReady(IdListArr,InfoArr);
}
function Reshow(){//show個別 社團/粉絲團 PO文
    var arr=[];
    $('#Outer').empty();
    if(GROUP_NB==-1){//全部
        console.log(BigArray);
        arr=BigArray;
        JudgeData(arr,20,GROUP_CLS);
    }else{//單一  社團/粉絲團
        arr.push(BigArray[GROUP_NB]);
        JudgeData(arr,0,GROUP_CLS);
    }
}
function JudgeData(Barr,nb){
    var outdata=[];
    for(var i=0;i<Barr.length;i++){//合併 不同份的array成為一個array
        for(var a=0;a<Barr[i].length;a++){
            outdata.push(Barr[i][a]);
        }
    }
    outdata.sort((a,b) =>//用 likes/nb/msg 排序 陣列(大->小)
        (parseInt(a[GROUP_CLS]) > parseInt(b[GROUP_CLS])) ? -1 :
        ((parseInt(b[GROUP_CLS]) > parseInt(a[GROUP_CLS])) ? 1 : 0));
    if(nb>0)outdata=outdata.slice(0,nb);
    // $('#Outer').append(`
    //     <h1>最近最熱門的${nb}則動態</h1>
    // `);
    //FBshowDatas(outdata);
}
function FBshowDatas(ds){
    IMGS=[];
    for(var i=0;i<ds.length;i++){
        if(ds[i]!=false){//如果該篇 沒有被刪除
            let lks='';
            if(ds[i].content!=null)lks=ds[i].content;
            let TheImg='';
            if(ds[i]['img-src']!=null){
                TheImg=ds[i]['img-src'];
                IMGS.push(TheImg);
            }
            $('#Outer').append(`
            <div class="PostChap">
                <button
                class="btnDelete"
                key="${ds[i].sort[0]},${ds[i].sort[1]}">
                    刪除此篇
                </button>
                <a href="${ds[i].url}" target="_blank">
                    <p>${ds[i].name}</p>
                    <p>${ds[i].date}</p>
                    <p>${lks}</p>
                    <img src="${TheImg}">
                    <p>
                        <span>Likes:${ds[i].likes}</span>
                        <span>  ||  </span>
                        <span>${ds[i].msg}</span>
                    </p>
                </a>
            </div>
            `);
        }
    }
}
function IGshowData(ds){
    $('#Outer').empty();
    IMGS=[];
    for(var i=0;i<BigArray[ds].length;i++){
        // if('code' in BigArray[ds][i]){//先不show embed Code;
        //     console.log(`Embed count Is: ${ds}/${i}`);
        //     continue;
        // }
        if(BigArray[ds][i]!==false&&BigArray[ds][i]['url'][0]!==null&&BigArray[ds][i]['target']!==null){
            const KS=BigArray[ds][i]['likes'];
            let test=``;
            for(var a=0;a<BigArray[ds][i]['url'].length;a++){
                IMGS.push(BigArray[ds][i]['url'][a]);
                test=test+`<img src="${BigArray[ds][i]['url'][a]}">`;
            }
            let Urllink=`${BigArray[ds][i]['target']}`;
            if(Urllink.includes('https://www.instagram.com/')==false)Urllink=`https://www.instagram.com/${BigArray[ds][i]['target']}`;
            $('#Outer').append(`
                <div class="PostChap">
                    <a href='${Urllink}' target="_blank">
                        ${test}
                    </a>
                    <p>${DateToLocalDay(BigArray[ds][i]['datetime'])}</p>
                    <p>${BigArray[ds][i]['content']}</p>
                    <p>Likes:${KS}</p>
                </div>
            `);
        }
    }
}
function TWshowData(ds,links){//Twitter append ele
    $('#Outer').empty();
    IMGS=[];
    for(var i=0;i<BigArray[ds].length;i++){
        let SinglePostImgs="";
        if(BigArray[ds][i]!=null){
            if(BigArray[ds][i]['imgs'].length!=0){
                for (let v = 0; v < BigArray[ds][i]['imgs'].length; v++) {
                    SinglePostImgs=SinglePostImgs+`<img src="${BigArray[ds][i]['imgs'][v]}">`
                    IMGS.push(BigArray[ds][i]['imgs'][v])
                }
            }else{
                SinglePostImgs=`<img src="${BigArray[ds][i]['src']}">`;
                IMGS.push(BigArray[ds][i]['src']);
            }
            $('#Outer').append(`
                <div class="PostChap">
                    <a href="${BigArray[ds][i]['href']}" target="_blank">
                        ${SinglePostImgs}
                    </a>
                    <p>${BigArray[ds][i]['content']}</p>
                    <p>${DateToLocalDay(BigArray[ds][i]['date'])}</p>
                    <p>
                    <span>留言數:${BigArray[ds][i]['msg']}</span>
                    <span>讚:${BigArray[ds][i]['likes']}</span>
                    </p>
                </div>
            `);
        }
    }
}
function FbShareShowTags(ds){
    $('#SubClassBtns').empty();
    $('#SubClassBtns').css('display','block');
    if(ds>=0){
        let DefaultNB=0;
        for(var i=0;i<BigTagArray[ds]['titles'].length;i++){
            if(i==0){
                DefaultNB=BigTagArray[ds]['titles'][i]['nb'];
                $('#SubClassBtns').append(`
                    <button class='ISactive' key="${BigTagArray[ds]['titles'][i]['nb']}">${BigTagArray[ds]['titles'][i]['name']}</button>
                `);
            }else{
                $('#SubClassBtns').append(`
                    <button key="${BigTagArray[ds]['titles'][i]['nb']}">${BigTagArray[ds]['titles'][i]['name']}</button>
                `);
            }
        }
        FbShareShowData(DefaultNB);
    }
    else{//綜合
        FbShareRandomData(20);
    }
}
function FbShareShowData(ds){
    $('#Outer').empty();
    //console.log($('#SocialKind>button.ISactive').text());
    if($('#SocialKind>button.ISactive').text()=='Facebook'){//render FB
        IMGS=[];
        for(var i=0;i<BigArray[ds].length;i++){
            if(BigArray[ds].length!=0||BigArray[ds]!=false)
            FbSingleDataRender(BigArray[ds][i]);
        }
    }else{//render FB share
        for(var i=0;i<BigArray[ds].length;i++){
            $('#Outer').append(`
                ${BigArray[ds][i]}
            `);
        }
    }
}
function FbShareRandomData(max){
    $('#Outer').empty();
    var arr = [];
    while(arr.length < max){//隨機給max個數 從length中
        var r = Math.floor(Math.random() * BigArray.length);
        if(arr.indexOf(r) === -1) arr.push(r);
    }
    for(var s=0;s<arr.length;s++){
        let nn=Math.floor(Math.random() * BigArray[arr[s]].length);
        if($('#SocialKind>button.ISactive').text()=='Facebook'){//render FB
            if(BigArray[arr[s]].length!=0||BigArray[arr[s]]!=false)
            FbSingleDataRender(BigArray[arr[s]][nn]);
        }else{
            $('#Outer').append(`
                ${BigArray[arr[s]][nn]}
            `);
        }
    }
}
function FbSingleDataRender(data){
    if(data!=false){//如果該篇 沒有被刪除
        let contents='';
        let HREF="";
        let TheImg='';
        let Names='';
        let likes='';
        let nbs='0';
        let msgs='';
        //if(data.url!=='')HREF=data.url;
        for(z in data){
            if(z.includes('url')){HREF=data.url;}
            else if(z.includes('content'))contents=data.content;
            else if(z.includes('img-src')){
                TheImg=data['img-src'];
                IMGS.push(TheImg);
            }
            else if(z.includes('name')){Names=data.name}
            else if(z.includes('nb')){nbs=data.nb}
            else if(z.includes('likes')){likes=data.likes}
            else if(z.includes('msg')){msgs=data.msg}
        }
        for(z in data){
            if(z.includes('href'))HREF=data.href;
        }
        $('#Outer').append(`
        <div class="PostChap">
            <a href="${HREF}" target="_blank">
                <p>${Names}</p>
                <p>${DateToLocalDay(parseInt(nbs)*1000)}</p>
                <p>${contents}</p>
                <img src="${TheImg}">
                <p>
                    <span>Likes:${likes}</span>
                    <span>  ||  </span>
                    <span>${msgs}</span>
                </p>
            </a>
        </div>
        `);
    }
}
function ShareInit(ds,kd){
    console.log(ds);
    ClearAllContent();
    console.log(ds);
    if(kd=='igtest'){
        for(var i=0;i<ds.length;i++){
            $('#Outer').append(`
                ${ds[i]['href']}
            `);
        }
        window.instgrm.Embeds.process();//啟用IG appended html tag吃到JS
        console.log("TEST IG done");
    }else{
        for(var i=0;i<ds.length;i++){
            $('#Outer').append(`
                ${ds[i]['data']}
            `);
        }
    }
}
function TikTokShareInit(ds,kd){
    console.log(ds);
    ClearAllContent();
    for(var i=0;i<ds.length;i++){
        for(var a=0;a<ds[i]['data_txt'].length;a++){
            $('#Outer').append(`
                ${ds[i]['data_txt'][a]}
            `);
        }
    }
}
function ClearAllContent(){//點日期 btn/content清空
    BigArray=[];
    BigTagArray=[];
    MyDeletePost=[];
    BigShareArray=[];
    IMGS=[];
    GROUP_NB=-1;
    IsYoutubePage=false;
    $('#ClassBtns').empty();
    $('#ClassBtns').css('display','none');
    $('#SubClassBtns').empty();
    $('#SubClassBtns').css('display','none');
    $("#Outer").empty();
}
function ShowClass(KD){
    if(KD=='normal'){
        $('#btnDownLoad').css('display','inline-block');//開下載圖 btn
        if(Class_NB=='facebook'){
            if(GROUP_NB!=-1)FbShareShowData(parseInt(GROUP_NB));
            else{FbShareShowTags(parseInt(GROUP_NB));}
        }
        else if(Class_NB=='twitter'){
            if(GROUP_NB==-1)GROUP_NB=0;
            TWshowData(parseInt(GROUP_NB));
        }else if(Class_NB=='ig'){
            if(GROUP_NB==-1)GROUP_NB=0;
            IGshowData(parseInt(GROUP_NB));
        }
    }else if(KD=='share'){
        IMGS=[];
        $('#btnDownLoad').css('display','none');//關下載圖 btn
        if(Class_NB=='facebook')RenderShare($('#SubClassBtns>button.ISactive').text());
        else{
            RenderShare($('#ClassBtns>button.ISactive').text());
        }
    }
}
function RenderShare(NM){
    $('#Outer').empty();
    let nn=0;
    for (let i = 0; i < BigShareArray.length; i++) {
        if(Class_NB=='ig'){
            if(BigShareArray[i]['title']==NM){
                $('#Outer').append(`
                    ${BigShareArray[i]['href']}
                `);
                nn++;
            }
        }else{
            if(BigShareArray[i]['name']==NM){
                $('#Outer').append(`
                    ${BigShareArray[i]['data']}
                `);
                nn++;
            }
        }
    }
    if(nn==0){
        $('#Outer').append(`
        <h1>該篇沒有影片.....</h1>
        `);
    }
    window.instgrm.Embeds.process();
}
function GetToday(){
    //new Date().getTime()//給絕對時間
    let dd = new Date();
    let years=dd.toString().slice(11,15);
    let month=dd.getMonth();//會比真實月份-1
    let days=dd.toString().slice(8,10);
    let out=`${years},${month},${days}`
    return out;
}
function DateToLocalDay(StrDay){
    let str=new Date(StrDay);
    let arr=`${str}`.split(" ");
    return `${arr[3]}/${str.getMonth()+1}/${arr[2]}(${arr[4]})`
}
function ToDate(tt){
    if(`${tt}`.length<=10)return tt;//tt已經是(年/月/日)
    tt=parseInt(tt);
    let dd = new Date(tt);
    let years=dd.toString().slice(11,15);
    let month=dd.getMonth()+1;
    let days=dd.toString().slice(8,10);
    let out=`${years}/${month}/${days}`
    return out;
}
function OuterAppendIntro(){
    $('#Outer').append(`
        <div id="IntorD">
        <h1>Amy Music《全新YouTube即時音樂社群播放器》</h1>
        <p class='red'>◎ 快速連續播, 免費、沒有惱人廣告打斷聆聽體驗</p>
        <p class='red'>◎ 預設熱門音樂頻道，滑鼠滾動自動播放，邊聽歌邊選邊換歌相當方便～</p>
        <p class='red'>◎ 一鍵建立自己的歌單，線上聊天室中、大家快速交換歌單，一起享受音樂。</p>
        <p class='blue'>記得使用電腦瀏覽器，大螢幕指令面版獲得更好的體驗喔！</p>
        <p class='blue'>IPhone手機因安全機制因素，無法自動開啟音效，請記得手動開啟；Android手機推薦使用Chrome流覽器以享受完整功能。</p>
        <p class='blue'>下一版，預計將會有更多的音樂頻道加入，和附帶儲存、功能更完整的聊天室系統喔～</p>
        <h1>AmyMusic的功介紹:</h1>
        <p><span class='blue'>(1)</span>收藏影片:</p>
        <p><span class='blue'>(1-1)</span>可以在每個影片下方點擊<span class='red'>加入自訂歌單(按鈕)</span>加入該影片到<span class='red'>自訂歌單</span>中。</p>
        <p><span class='blue'>(1-2)</span>也可以<span class='blue'>自行輸入Youtube的影片網址</span>來加入到自己的<span class='red'>自訂歌單</span>中  <span class='blue'>(↓)步驟:</span></p>
        <p><span class='blue'>(1-2)</span><span class='blue'>撥放器</span>→<span class='blue'>自訂歌單(＋)</span>→<span class='blue'>增加Youtube網址</span>→<span class='blue'>輸入網址/標題</span></p>
        <p><span class='blue'>(2)</span>撥放該頻道所有影片:</p>
        <p><span class='blue'>(2)</span>在每個影片下方點擊<span class='red'>使用撥放器(按鈕)</span>讓撥放器(迷你)來撥放該頻道所有歌單。</p>
        <p><span class='blue'>(3)</span>AmyMusic的<span class='red'>自訂歌單</span>會成為Cookie記錄在使用者的裝置中。</p>
        <p><span class='blue'>(4)</span>當使用者想修改歌單時，可以打開下方<span class='red'>撥放器</span>各清單中的<span class='blue'>X ＋</span>來刪除、增加影片。</p>
        <p><span class='blue'>(5)</span>分享歌單/撥放他人分享歌單:</p>
        <p><span class='blue'>(5-1)</span>分享自己的<span class='red'>自訂歌單</span>給所有人。<span class='blue'>(↓)步驟:</span></p>
        <p><span class='blue'>(5-1)</span><span class='blue'>聊天室</span>→<span class='blue'>(勾選下方)分享歌單</span>→<span class='blue'>輸入分享介紹</span>→<span class='blue'>送出</span></p>
        <p><span class='blue'>(5-2)</span>撥放分享歌單<span class='blue'>(↓)步驟:</span></p>
        <p><span class='blue'>(5-2)</span>打開<span class='blue'>聊天室</span>→<span class='blue'>點擊►按鈕</span></p>
        <p class='red'>請勿在聊天室使用不良、攻擊性、危害他人言論。</p>
        </div>
        `);
}