var tag = document.createElement('script');  
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var PlayerArray=[];//所有Yt Embed建立player OBJ
var VideoIdList=[];//所有Yt videoID List
var VideoInfoList=[];//所有Yt video Info List
var PlayerArrayNotAutoPlay=[];//不自動scroll play的 playerOBJ的indexOf
var IsAutoPlayScroll=false;//自動撥放的scroll(自動撥放 下一支影片時禁止scroll play)
var ReadyCount=0;//已經載入的video count
var IsYoutubePage=false;//該類別是否 Yt類別
var YtNowVideo=0;//現在撥放第幾隻video

//---Fixed Video Data Control & Fixed Video List
var FixedVideoIdList=[];//Fixed Yt videoID List
var FixedVideoChannelList=[];//(OBJs)Fixed List(固定頻道's List)
//var FixedVideoPersonalList=[];//(OBJs)Fixed List(自訂 List)
var FixedVideoPersonalList=TCookieGet('personlist');//(OBJs)Fixed List(自訂 List)
var FixedYtNowVideo=0;//Fixed現在撥放第幾隻video
var FixedYtElem=null;//Fixed video Element
var IsFixedVideoPlaying=false;
var FixedPlayingListKind='channel';//'personal';//現在FixedVideo 撥放的是 channel||personal
var FixedVideoShareList=[];//迷你player 分享List Array(OBJ)
//---Fixed Video Data Control

//---Fixed Video Move Elem
var FixedVideoOpenMoveMode=false;
var FixedListShow=false;

var WindowIsMobileSize=false;
$( document ).ready(function() {//For 聊天室預設開啟 (PC/Mobile)
    let Wdwd=$(window).width();       
    if(Wdwd<=800){//Is Mobile
        $('#ShareContentArea').removeClass('show');
        $('#YtInfinityPlayer').removeClass('MoreRight');
        $('.Rounds').removeClass('MoreRight');     
    }else{//Is PC
        $('#ShareContentArea').addClass('show');
        $('#YtInfinityPlayer').addClass('MoreRight');
        $('.Rounds').addClass('MoreRight');                   
    }
});
$(window).scroll(function(){
    $('#Controls').removeClass('show');
    JudgeMenuEleInSight();//滾動超過 原本menu高度
    LoopContentVideoJudgeInSight();//在youtube page時 scroll auto play
});
function BuildYouTubeIframeAPIReady(ListArr,InfoArr) {
    VideoIdList=ListArr;
    VideoInfoList=InfoArr;
    PlayerArray=[];
    PlayerArrayNotAutoPlay=[];
    IsAutoPlayScroll=false;
    for(var s=0;s<ListArr.length;s++){
        $('#Outer').append(`
        <div key="${s}" class="videoplayer">
            <div id="player${s}"></div>
            <div>
                <p>${InfoArr[s]['title']}</p>
                <p>${InfoArr[s]['time']}</p>
                <p>觀看次數:${InfoArr[s]['views']}</p>
                
                <p>
                    <button class='fivideobtn' onclick='FixedPlayerBuildYoutubeVideo("${ListArr[s]}","channel")'>
                    使用撥放器</button>
                    <button class='fivideobtn' onclick='FixedPlayerBuildYoutubeVideo("${ListArr[s]}","personal")'>
                    加入自訂歌單</button>
                </p>
                </p>
            </div>
        </div>
        
        `);
    }
    for(var s=0;s<ListArr.length;s++){
        let Wdd=parseInt($('.videoplayer').width());        
        if(Wdd>640)Wdd=640;//640*390
        var LitPlayer = new YT.Player(`player${s}`, {        
            height: `${Wdd*0.6}`,
            width: `${Wdd}`,
            videoId: `${ListArr[s]}`,
            playerVars: { //自訂參數                 
                'loop':1,
                'playlist':`${ListArr[s]}`,
                'rel': 0,//不顯示相關視頻                
                'playsinline': 1,//在iOS的播放器中全屏播放，0:全屏(默認)，1:內嵌
                },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }            
        });
        PlayerArrayNotAutoPlay.push(true);
        PlayerArray.push(LitPlayer);
    }    
}
function onPlayerReady(event) {
    ReadyCount++;
    console.log(`Trigger Player Ready`);    
    if(PlayerArray[0].getPlayerState()!==1&&IsFixedVideoPlaying==false){//event.target.getPlaylist()[0]==PlayerArray[0].getPlaylist()[0]&&
        if(iOS()==true){//---For Apple Device AutoPlay
            //console.log(PlayerArray[0].getVolume());
            PlayerArray[0].mute();
        }        
        PlayerArray[0].playVideo();
        //alert(PlayerArray[0].getPlaylist()[0])//Fixxx
        //PlayerArray[0].unMute();//解除mute        
    }
}  
function onPlayerStateChange(event) {
    // console.log(event.target.getPlayerState())
    // console.log(event.target.getPlaylist());
    // console.log(document[Browserhidden]+"||"+event.target.getPlayerState());
    // console.log(document[Browserhidden]+"||"+event.target.getPlaylist()[0]);
    //let TheCtn=VideoIdList.indexOf(event.target.getPlaylist()[0])
    //console.log(GetVideoIdByUrl(event.target.getVideoUrl()));
    //alert(event.target.getPlaylist()[0]+"||"+event.target.getPlayerState())//Fixxx
    let TheCtn=VideoIdList.indexOf(GetVideoIdByUrl(event.target.getVideoUrl()));        
    // if(event.target.getPlayerState()==-1&&event.target.getPlaylist()[0]==PlayerArray[0].getPlaylist()[0]&&YtNowVideo==0){//Fixxx
    //     event.target.playVideo();
    // }
    if(event.target.getPlayerState()==2&&YtNowVideo==TheCtn){//是"使用者"手動暫停影片 -> 停止這支影片的自動撥放        
        if(PlayerArrayNotAutoPlay.includes(TheCtn)==false)PlayerArrayNotAutoPlay.push(TheCtn);
    }
    else if(event.target.getPlayerState()==1){//使用者 play自動撥放中的video        
        if(IsFixedVideoPlaying&&FixedYtElem!==null){//手動Play content內video -> 關掉FixedVideo系統
            PauseFixedVideo();//暫停FixedVideo
            //CloseFixedVideo();//整個FixedVideo關掉
            //FixedYtElem.pauseVideo();//暫停play FixedVideo
        }
        PlayerArrayNotAutoPlay[PlayerArrayNotAutoPlay.indexOf(TheCtn)]=-1;//移除禁播名單
        PlaySingleVideo(TheCtn);//執行撥放
    }
    //----------2020.7.14 新增 撥放自動下一隻video & scroll to    
    else if(event.target.getPlayerState()==0&&document[Browserhidden]==false){//影片end 撥放下一隻video                
        let nnb=0;
        if(TheCtn<VideoIdList.length-1)nnb=TheCtn+1;
        IsAutoPlayScroll=true;
        $('html, body').animate({
            scrollTop: $(".videoplayer").eq(nnb).offset().top
        },500,function(){
            PlaySingleVideo(nnb);            
        });
    }
    //------------------------------------------------------*/    
}
function AllstopVideo() {//全部停止  
  PlayerArray.forEach(function(item, index) {
    item.stopVideo();
  })
}
function PauseOtherVideo(){//全部暫停      
  PlayerArray.forEach(function(item, index) {
    if(index!==YtNowVideo)item.pauseVideo();
  })
}
function PausePlayingSingleVideo(){//暫停 正在撥放的video    
    PlayerArray[YtNowVideo].pauseVideo();    
}
function PlaySingleVideo(N){//停止其他video 播單支
    //console.log('Trigger Play Single');
    // YtNowVideo=N;//播放第N個 video
    // PauseOtherVideo();//暫停全部(除了第N個)    
    if(YtNowVideo==N)return ;//該隻video正在撥放
    if(YtNowVideo!==-1){//關掉Fixed 開始Scroll Auto Play        
        PausePlayingSingleVideo();
    }
    YtNowVideo=N;
    if(PlayerArrayNotAutoPlay.includes(N)==false
    &&PlayerArray[N].getPlayerState()!==1){//如果第N不再禁止AutoPlay名單 && 第N 沒有正在撥放                
        if(iOS()==true)PlayerArray[N].mute();//---For Apple Device AutoPlay
        PlayerArray[N].playVideo();//第N撥放
        //PlayerArray[N].unMute();//解除mute        
        IsAutoPlayScroll=false;//可以自動scroll撥放
    }
}
function AutoPlayLoadNextVideo(N){//(X)(Browser遮蔽無法使用)Auto Play Next當browser不在視窗內
    console.log('Trigger Auto Play ');
    // YtNowVideo=N;//播放第N個 video
    // PauseOtherVideo();//暫停全部(除了第N個)
    PausePlayingSingleVideo();
    YtNowVideo=N;
    if(PlayerArrayNotAutoPlay.includes(N)==false
    &&PlayerArray[N].getPlayerState()!==1){//如果第N不再禁止AutoPlay名單 && 第N 沒有正在撥放                
        PlayerArray[N].loadVideoById(`${VideoIdList[N]}`,0);        
        //PlayerArray[N].loadPlaylist(`${VideoIdList[N]}`,0,0);
    }
}
function isScrolledIntoView(elem)//判斷ele 是否在window內 (return true/false)
{       
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}
function GetVideoIdByUrl(TheUrl){//Parse Url to Get VideoID
    let nb0=TheUrl.indexOf('v=')+2;
    let nb1=TheUrl.length;
    let Res=TheUrl.slice(nb0,nb1);
    if(Res.includes('&')!==false){//VideoID後面 可能還有帶其他參數(拿掉)
        Res=Res.slice(0,Res.indexOf('&'));
    }
    return Res;    
}
function LoopContentVideoJudgeInSight(){//Loop判斷 ContentVideoEle是否在視窗內
    if(IsYoutubePage&&IsAutoPlayScroll==false&&IsFixedVideoPlaying==false){
        for(var s=0;s<PlayerArray.length;s++){
            if(isScrolledIntoView($('#Outer .videoplayer').eq(s))){//ele 在window 內              
              const TheNb=parseInt($('#Outer .videoplayer').eq(s).attr('key'));
              PlaySingleVideo(TheNb);
              break;
            }            
        }
    }
}

//--------------------Fixed Video Build--------------------------------------------
function FixedPlayerBuildYoutubeVideo(ViID,KIND){//建立 Yt Fixed PlayerElement    
    IsFixedVideoPlaying=true;
    if(KIND=='channel'){//固定撥放
        FixedPlayingListKind='channel';
        FixedVideoIdList=VideoIdList;//List ID繼承/傳遞
        FixedVideoChannelList=[];//清空
        VideoIdList.forEach((i,nb)=>{//重新輸入
            let OBJ={
                videoId:i,
                title:VideoInfoList[nb]['title']
            }
            FixedVideoChannelList.push(OBJ);
        })
    }
    else if(KIND=='personal'){//自訂撥放
        FixedPlayingListKind='personal';
        let NowPersonalIdList=[...FixedVideoPersonalList].map((i)=>{return i['videoId']});
        if(NowPersonalIdList.includes(ViID)==false){//if自訂清單"沒有"該Video
            let lNb=VideoIdList.indexOf(ViID);
            let OBJ={
                videoId:`${ViID}`,
                title:VideoInfoList[lNb]['title']
            }
            //if(FixedYtElem!==null)
            FixedVideoPersonalList.push(OBJ);//增加 Single Video Data To Personal List        
            TCookieSet(FixedVideoPersonalList);//更新Personal List Cookie            
        }
        FixedVideoIdList=[...FixedVideoPersonalList].map((i)=>{return i['videoId'];});//List ID繼承/傳遞
    }
    else if(KIND=='ShareChannel'){//固定撥放
        FixedPlayingListKind='channel';        
    }
    YtNowVideo=-1;
    FixedYtNowVideo=FixedVideoIdList.indexOf(ViID);
    if(IsYoutubePage)PauseOtherVideo();
    if(FixedYtElem==null){//Fixed VideoPlayer Not Exisit        
        $('#YtInfinityPlayer').empty();//清空
        InitRenderFixedVideoList();//Render FixedVideoList
        //RenderFixedVideo控制btns
        $('#YtInfinityPlayer').append(`
            <p class='show'>
            <button class='fivideobtn' onclick="FixedPlayerMoveElem()">►</button>
            <button class='fivideobtn' onclick="FixedVideoListToggle()">歌單</button>
            <button id='FixedPauseBtn' class='fivideobtn' onclick="FixedVideoTogglePause()">暫停</button>
            <button class='fivideobtn' onclick="FixedPlayPrevVideo()">上一首</button>
            <button class='fivideobtn' onclick="FixedPlayNextVideo()">下一首</button>
            <button class='fivideobtn' onclick="CloseFixedVideo()">X</button>        
            </p>
            <div id="FixedPlayer"></div>
        `);
        let StartVideoSeconds=0;//點 "撥放器" 開啟狀態 時間=0
        if(VideoIdList.indexOf(ViID)!=-1)StartVideoSeconds=parseInt(PlayerArray[VideoIdList.indexOf(ViID)].getCurrentTime());
        FixedYtElem=new YT.Player(`FixedPlayer`, {
            width: `360`,
            height: `240`,
            videoId: `${ViID}`,
            playerVars: { //自訂參數                 
                'loop':1,
                'playlist':`${ViID}`,
                //('start'的秒數只能是正整數)
                'start':StartVideoSeconds,
                'rel': 0,//不顯示相關視頻
                'playsinline': 1,//在iOS的播放器中全屏播放，0:全屏(默認)，1:內嵌
                },
            events: {
                'onReady': FixedonPlayerReady,
                'onStateChange': FixedonPlayerStateChange
            }
        });
        SetFixedVideoMobileSize();//如過是 手機 (FixedVideo resize)        
    }
    else{//Fixed Video Player 存在        
        $('#FixedVideoList').remove();//清空List
        InitRenderFixedVideoList();//重新Render List
        $("#FixedVideoList").prependTo("#YtInfinityPlayer");
        let StartVideoSeconds=0;//點 "撥放器" 開啟狀態 時間=0
        if(VideoIdList.indexOf(ViID)!=-1)StartVideoSeconds=parseInt(PlayerArray[VideoIdList.indexOf(ViID)].getCurrentTime());
        //FixedPlayVideoId(ViID,parseInt(PlayerArray[VideoIdList.indexOf(ViID)].getCurrentTime()));
        FixedPlayVideoId(ViID,StartVideoSeconds);
        SetFixedVideoMobileSize();//如過是 手機 (FixedVideo resize)
    }
}
function FixedonPlayerReady(event){//Fixed Video 初始化play
    //let IsOrMute=event.target.isMuted();//原來影片是否靜音(中)
    if(iOS()==true)event.target.mute();//---For Apple Device AutoPlay
    event.target.playVideo();    
    //if(IsOrMute==false)event.target.unMute();//如果(使用者)沒有靜音->解除mute
}
function FixedonPlayerStateChange(event){//Fixed Video判斷auto play next    
    //console.log('Du Du Du DuＤ'+event.target.getPlayerState());
    if(event.target.getPlayerState()==1){//手動play Fixed video
        $('#FixedPauseBtn').text('暫停');
        YtNowVideo=-1;
        IsFixedVideoPlaying=true;
        PauseOtherVideo();
    }
    else if(event.target.getPlayerState()==2){//Paused Fixed Video
        $('#FixedPauseBtn').text('撥放')
        //IsFixedVideoPlaying=false;
        //LoopContentVideoJudgeInSight();//恢復 撥放content內當前video
    }
    else if(event.target.getPlayerState()==0){//(Browser不在視窗內可以Play Next)Play Next Video        
        let NowNB=FixedVideoIdList.indexOf(event.target.getPlaylist()[0])
        let NextNb=NowNB+1;
        if(NowNB==FixedVideoIdList.length-1)NextNb=0;
        FixedYtNowVideo=NextNb;
        FixedVideoListShowPlayingDom();
        event.target.loadPlaylist(`${FixedVideoIdList[NextNb]}`,0,0);        
    }
}
function CloseFixedVideo(){//關掉 Fixed Video Panel
    $('.Rounds').removeClass('MoveUpLittle');//恢復(Mobile)選單/Top Elem位置
    $('#YtInfinityPlayer').empty();
    IsFixedVideoPlaying=false;
    FixedYtElem=null;
    LoopContentVideoJudgeInSight();//關掉fixed Video -> 撥放視窗內當前video
}
function PauseFixedVideo(){
    $('#FixedPauseBtn').text('撥放');
    FixedYtElem.pauseVideo();
    IsFixedVideoPlaying=false;
    //LoopContentVideoJudgeInSight();//恢復 撥放content內當前video
}
function FixedPlayPrevVideo(){
    if(FixedVideoIdList.length==0)return false;//影片List為空
    let NowNB=FixedYtNowVideo;
    let PrevNb=FixedYtNowVideo-1;
    if(FixedYtNowVideo==0)PrevNb=FixedVideoIdList.length-1;
    //if(VideoIdList.length<=1)PrevNb=NowNB;//影片數量<=1支 撥放同一支
    if(FixedVideoIdList.length<=1)PrevNb=NowNB;//影片數量<=1支 撥放同一支
    FixedYtNowVideo=PrevNb;
    FixedVideoListShowPlayingDom();//更新PlayList Playing狀態
    FixedYtElem.loadPlaylist(`${FixedVideoIdList[PrevNb]}`,0,0);
}
function FixedPlayNextVideo(){    
    if(FixedVideoIdList.length==0)return false;//影片List為空
    let NowNB=FixedYtNowVideo;    
    let NextNb=NowNB+1;
    if(NowNB==FixedVideoIdList.length-1)NextNb=0;
    if(FixedVideoIdList.length<=1)NextNb=NowNB;//影片數量<=1支 撥放同一支
    FixedYtNowVideo=NextNb;
    FixedVideoListShowPlayingDom();//更新PlayList Playing狀態    
    FixedYtElem.loadPlaylist(`${FixedVideoIdList[NextNb]}`,0,0);
}
function FixedVideoTogglePause(){//暫停FixedVideo -> Play Content Video
    if(FixedYtElem.getPlayerState()==1){
        $('#FixedPauseBtn').text('撥放');
        FixedYtElem.pauseVideo();
        IsFixedVideoPlaying=false;
        LoopContentVideoJudgeInSight();//恢復 撥放content內當前video
    }
    else if(FixedYtElem.getPlayerState()==2){
        $('#FixedPauseBtn').text('暫停');
        FixedYtElem.playVideo();
    }    
}
function FixedPlayVideoId(Idd,Time){//以VideoId撥放 Fixed Video
    FixedYtElem.loadPlaylist(`${Idd}`,0,Time);
}
function FixedVideoListToggle(){
    $('#FixedVideoList').toggleClass('show');
    FixedListShow=$('#FixedVideoList').hasClass('show');
}
function FixedPlayerMoveElem(){//Fixed Player Menu收合
    //$('#MoveVideoElemBlock').css('display','block');
    //$('#YtInfinityPlayer').toggleClass('GoLeft');//FixedVideo Position最左/最右 移動    
    $('#YtInfinityPlayer>p').toggleClass('show');
    if($('#YtInfinityPlayer>p').hasClass('show')){
        if(WindowIsMobileSize==false)$('#YtInfinityPlayer>p>button').eq(0).text('►');
        else{//是 "手機" 版型 ForMible
            $('#FixedVideoList').removeClass('show');//收掉PlayList
            $('#YtInfinityPlayer>p>button').eq(0).text('▲');
            $('#YtInfinityPlayer').animate({
                'bottom':`-${$('#FixedPlayer').height()+5}px`
            },300);
            $('.Rounds').addClass('MoveUpLittle');
        }
    }
    else{        
        if(WindowIsMobileSize==false){
            $('#FixedVideoList').removeClass('show');//收掉PlayList
            $('#YtInfinityPlayer>p>button').eq(0).text('◄');
        }
        else{//是 "手機" 版型 ForMible
            $('#YtInfinityPlayer>p>button').eq(0).text('▼');
            $('#YtInfinityPlayer').animate({
                'bottom':`0`
            },300);
            $('.Rounds').removeClass('MoveUpLittle');
        }
    }
}
//--------------------Fixed Video Build--------------------------------------------

//--------------------Fixed Video List---------------------------------------
$(document).on("click",'#FixedVideoList .btns button',function(){
    $(this).addClass('show').siblings('button').removeClass('show');
    let TheNb=$('#FixedVideoList .btns button').index($(this))
    $('#FixedVideoList .contents .ItemOut').eq(TheNb)
      .addClass('show').siblings('.ItemOut').removeClass('show');  
});
$(document).on("click",'#FixedVideoList .ItemOut .removeListItem',function(){//Fiexd List按刪除video    
    let IsChannel=$(this).parent('.Items').parent('.ItemOut').hasClass('channel');
    let TheKey=$(this).parent('.Items').attr('key');
    $(this).parent('.Items').remove();
    if(IsChannel)
    {//Delete Channel List Video
        FixedVideoChannelList=[];
        [...$('.ItemOut.channel .Items')].forEach((i)=>{
            let OBJ={
                videoId:$(i).attr('key'),
                title:$(i).find('span').text()
            }
            FixedVideoChannelList.push(OBJ);
        })        
        if(FixedPlayingListKind=='channel'){//刪除的list==Channel正在撥放
            if(TheKey==FixedVideoIdList[FixedYtNowVideo])
            {//刪除的video 是正在撥放的video
                if(FixedVideoIdList.length<=1){FixedYtElem.stopVideo();}//沒video了 先stop
                else{FixedPlayNextVideo();}//先幫她撥下一支video
            }
            let FixedID=FixedVideoIdList[FixedYtNowVideo];
            FixedVideoIdList=[...FixedVideoChannelList].map((i)=>{return i['videoId']})                        
            FixedYtNowVideo=FixedVideoIdList.indexOf(FixedID);            
        }
    }else{//Delete Personal List Video
        FixedVideoPersonalList=[];
        [...$('.ItemOut.personal .Items')].forEach((i)=>{
            let OBJ={
                videoId:$(i).attr('key'),
                title:$(i).find('span').text()
            }
            FixedVideoPersonalList.push(OBJ);
        });
        TCookieSet(FixedVideoPersonalList);//更新Personal List Cookie
        if(FixedPlayingListKind=='personal'){//刪除的list==Personal正在撥放
            if(TheKey==FixedVideoIdList[FixedYtNowVideo])
            {//刪除的video 是正在撥放的video
                if(FixedVideoIdList.length<=1){FixedYtElem.stopVideo();}//沒video了 先stop
                else{FixedPlayNextVideo();}//先幫她撥下一支video                
            }
            let FixedID=FixedVideoIdList[FixedYtNowVideo];
            FixedVideoIdList=[...FixedVideoPersonalList].map((i)=>{return i['videoId']})                        
            FixedYtNowVideo=FixedVideoIdList.indexOf(FixedID); 
        }
    }
});
$(document).on("click",'#FixedVideoList .ItemOut .playListItem',function(){//Fiexd List按撥放
    $('#FixedVideoList .Items').removeClass('playing');
    $(this).parent('.Items').addClass('playing');

    if($(this).parent('.Items').parent('.ItemOut').hasClass('channel'))
    {//Play Channel List        
        FixedPlayingListKind='channel';
        FixedVideoIdList=[];        
        FixedVideoChannelList.forEach((i)=>{            
            FixedVideoIdList.push(i['videoId']);
        });
    }
    else{//Play Personal List        
        FixedPlayingListKind='personal';
        FixedVideoIdList=[];
        FixedVideoPersonalList.forEach((i)=>{            
            FixedVideoIdList.push(i['videoId']);
        });
    }
    FixedYtNowVideo=FixedVideoIdList.indexOf($(this).parent('.Items').attr('key'));    
    FixedPlayVideoId($(this).parent('.Items').attr('key'),0);
});
$(document).on("click",'#FixedVideoList .ItemOut .addToPseronal',function(){//Fixed Channel單支vid加入自訂List
    // console.log(FixedVideoChannelList);    
    // console.log(Hr+'||'+Ti)
    const Hr=$(this).parent('.Items').attr('key');
    const Ti=$(this).parent('.Items').find('span').text();    
    if(Hr!==null&&Ti!==null){
        JudgeAndInsertOneVideoPersonlList(`https://www.youtube.com/watch?v=`+Hr,Ti);
    }else{
        alert('頻道VideoID錯誤');
        return false;
    }
});
function FixedVideoListShowPlayingDom(){//更新 PlayList 撥放狀態(playing變紅色)
    $('#FixedVideoList .Items.playing').removeClass('playing');
    if(FixedPlayingListKind=='channel'){
        [...$('#FixedVideoList .channel .Items')].forEach((i,nb)=>{
            if($(i).attr('key')==FixedVideoIdList[FixedYtNowVideo])
            $(i).addClass('playing');
        })
    }else if(FixedPlayingListKind=='personal'){
        [...$('#FixedVideoList .personal .Items')].forEach((i,nb)=>{
            if($(i).attr('key')==FixedVideoIdList[FixedYtNowVideo])
            $(i).addClass('playing');
        });
    }    
}
function InitRenderFixedVideoList(){//初始化Render Fixed List    
    let ShowClass=['show','']
    if(FixedPlayingListKind=='channel'){//選擇PlayList Show 哪一種List        
        ShowClass[0]='';
        ShowClass[1]='show';
    }
    let FixedListClass='show';
    //if(FixedListShow==false)FixedListClass='';//根據 使用者上一紀錄 選擇 開/不開
    $('#YtInfinityPlayer').append(`
    <div id='FixedVideoList' class='${FixedListClass}'>
        <div class='btns'>
            <button class='${ShowClass[0]}'>
            <span class='AddLinkbtn'>+</span>
            自訂歌單
            </button>
            <button class='${ShowClass[1]}'>頻道歌單</button>
        </div>
        <div class='contents'>
            <div class='ItemOut ${ShowClass[0]} personal'>
            </div>
            <div class='ItemOut ${ShowClass[1]} channel'>
            </div>
        </div>
        <div class='AddLinkPanel'>
            <div class='tops'>
                <button class='show'>分享自訂歌單</button>
                <button>增加Youtube網址</button>
            </div>
            <div class='bottoms'>
                <div class='show'>
                    <input type="text" class="Lists" placeholder="輸入你的歌單簡介">
                    <button id="FixedSendShareList">分享</button>
                </div>
                <div>
                    <h1>自訂歌單增加Youtube網址</h1>
                    <input type="text" class="links" placeholder="請輸入Youtube網址">
                    <input type="text" class="title" placeholder="請輸入此Youtube影片標題">
                    <button class='add'>確定</button>
                </div>                
            </div>            
        </div>
    </div>
    `);
    FixedVideoChannelList.forEach((i)=>{
        let ClassAdd='';
        if(i['videoId']==FixedVideoIdList[FixedYtNowVideo]&&FixedPlayingListKind=='channel')
        {ClassAdd='playing';}
        $('#FixedVideoList .ItemOut.channel').append(`
        <div class='Items ${ClassAdd}' key='${i['videoId']}'>
          <button class='removeListItem'>X</button>
          <button class='playListItem'>►</button>
          <button class='addToPseronal'>＋</button>
          <span>${i['title']}</span>
        </div>
        `);
    });    
    FixedVideoPersonalList.forEach((i)=>{
        let ClassAdd='';
        if(i['videoId']==FixedVideoIdList[FixedYtNowVideo]&&FixedPlayingListKind=='personal')
        {ClassAdd='playing';}
        $('#FixedVideoList .ItemOut.personal').append(`
        <div class='Items ${ClassAdd}' key='${i['videoId']}'>
          <button class='removeListItem'>X</button>
          <button class='playListItem'>►</button>
          <span>${i['title']}</span>
        </div>
        `);
    });    
}
//--------------------Fixed Video List---------------------------------------

//------------Do Menus Fixed Or not---------------------------------
$(document).on("click",'#FixedMenuBtn',async function(){
    $('#Controls').toggleClass('show');    
});
function JudgeMenuEleInSight(){
    //console.log(isScrolledIntoView($('#Controls')));
    var docViewTop = $(window).scrollTop();
    var elemH=$('#Controls').height();
    if(docViewTop >= elemH){
        $('body').css('padding-top',`${elemH}px`);
        $('#Controls').addClass('DoFixed');
    }else{
        $('body').css('padding-top',`0px`);
        $('#Controls').removeClass('DoFixed');
    }    
    //return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}
//------------Do Menus Fixed Or not---------------------------------

//------------Open FixedVideo Player------------------------
$(document).on("click",'#OpenFixedPlayer',async function(){//開啟FixedVideo Player
    // console.log(IsYoutubePage);
    // console.log('FVP第:'+FixedYtNowVideo);
    // console.log('FVP種類:'+FixedPlayingListKind);
    // console.log('FVP撥放中?:'+IsFixedVideoPlaying);    
    if(IsFixedVideoPlaying||FixedYtElem!==null){//FixedVideoPlayer 已存在    
        CloseFixedVideo();//Close撥放器
        return;
    }    
    if(FixedPlayingListKind=='channel'){
        if(FixedVideoChannelList.length!=0&&FixedVideoChannelList[FixedYtNowVideo]!=='undefined'){   
            // (↓)如果 Fix Noew Video ID 包含在 VideoIdList中(是固定撥放play)
            if(VideoIdList.includes(`${FixedVideoChannelList[FixedYtNowVideo]['videoId']}`)){
                FixedPlayerBuildYoutubeVideo(`${FixedVideoChannelList[FixedYtNowVideo]['videoId']}`,"channel")
            }else{//如果 是從Share撥放 
                FixedPlayerBuildYoutubeVideo(`${FixedVideoChannelList[FixedYtNowVideo]['videoId']}`,"ShareChannel")
            }            
        }else if(FixedVideoPersonalList.length!=0){//play自訂
            FixedPlayerBuildYoutubeVideo(`${FixedVideoPersonalList[0]['videoId']}`,"personal");
        }else{
            //alert('請先在Youtube類別建立歌單,再使用撥放器');
            DoSareVideoDataTransform(0);
            //return false;
        }
        //console.log(FixedVideoChannelList[FixedYtNowVideo]['videoId']);
    }else if(FixedPlayingListKind=='personal'){
        if(FixedVideoPersonalList.length!=0&&FixedVideoPersonalList[FixedYtNowVideo]!=='undefined'){
            FixedPlayerBuildYoutubeVideo(`${FixedVideoPersonalList[FixedYtNowVideo]['videoId']}`,"personal");
        }else if(FixedVideoChannelList.length!=0){
            FixedPlayerBuildYoutubeVideo(`${FixedVideoChannelList[0]['videoId']}`,"channel")
        }else{
            DoSareVideoDataTransform(0);
            //alert('請先在Youtube類別建立歌單,再使用撥放器');
        }       
    }
    $('.Rounds').addClass('MoveUpLittle');//UI 往上移動    
});
//------------Open FixedVideo Player------------------------

//------------Change Fixed Video Elem Position
function showCoords(event) {    
    var x = event.clientX;
    var y = event.clientY;
    $('#YtInfinityPlayer').css({
        'top':`${y}px`,
        'left':`${x}px`,
        'transform' : 'translate('-100%','-100%')'
    })
    $('#MoveVideoElemBlock').css('display','none');
}
//------------Change Fixed Video Elem Position

//------------Fixed Personal Video List Add Custom Link
$(document).on("click",'#FixedVideoList .AddLinkbtn',async function(){    
    $('#FixedVideoList .AddLinkPanel').toggleClass('show');
    // if($('#FixedVideoList .AddLinkPanel').hasClass('show'))$(this).text('—');
    // else{$(this).text('+');}
});
$(document).on("click",'#FixedVideoList .AddLinkPanel .bottoms button.add',async function(){
    let Hrefs=$('.AddLinkPanel .bottoms .links').val();
    let Titles=$('.AddLinkPanel .bottoms .title').val();
    JudgeAndInsertOneVideoPersonlList(Hrefs,Titles);
});
function JudgeAndInsertOneVideoPersonlList(Hrefs,Titles){//自訂List(判斷&新增)單支Video
    if(FixedYtElem==null){
        alert('撥放器錯誤--沒有迷你撥放器');
        return false;        
    }
    if(Hrefs.includes('youtube.com/watch?v=')){
        if(Hrefs.includes('&list=')==false){
            var slicenb1=Hrefs.indexOf('v=')+2;
            Hrefs=Hrefs.slice(slicenb1,100);
        }else{
            var slicenb1=Hrefs.indexOf('v=')+2;
            var slicenb2=Hrefs.indexOf('&list');
            Hrefs=Hrefs.slice(slicenb1,slicenb2);
        }
    }else{        
        alert('輸入的Youtube Video網址錯誤!');
        return false;
    }
    let NowPersonalIdList=[...FixedVideoPersonalList].map((i)=>{return i['videoId']});
    if(NowPersonalIdList.includes(Hrefs)==false){//如果 VideoId不再現在名單內
        FixedPlayingListKind='personal';
        if(Titles=='')Titles=`影片:${Hrefs}`;
        let OBJ={
            videoId:`${Hrefs}`,
            title:Titles
        }    
        FixedVideoPersonalList.push(OBJ);        
        FixedVideoIdList=[...FixedVideoPersonalList].map((i)=>{return i['videoId'];});//List ID繼承/傳遞
        TCookieSet(FixedVideoPersonalList);

        YtNowVideo=-1;//關content Video參數
        //if(FixedYtElem.getPlayerState()!=1)
        FixedYtNowVideo=FixedVideoIdList.indexOf(Hrefs);//FixedVideo ID Count
        PauseOtherVideo();//關content Video

        $('#FixedVideoList').remove();//清空List
        InitRenderFixedVideoList();//重新Render List
        $("#FixedVideoList").prependTo("#YtInfinityPlayer");        
        FixedPlayVideoId(Hrefs,0);
        SetFixedVideoMobileSize();//如過是 手機 (FixedVideo resize)
    }else{
        alert('輸入的Youtube Video重複!');
        return false;
    }
}
//------------Fixed Personal Video List Add Custom Link

//------------Fixed Personal Video List Share------------------
$(document).on("click",'#FixedVideoList .AddLinkPanel .tops>button',function(){    
    $(this).addClass('show').siblings('button').removeClass('show');
    let TheNb=$('#FixedVideoList .AddLinkPanel .tops button').index($(this))
    $('#FixedVideoList .AddLinkPanel .bottoms>div').eq(TheNb)
      .addClass('show').siblings('div').removeClass('show'); 
});
//------------Fixed Personal Video List Share------------------

//------------Share Content Area--------------------
function CloseShareContent(){
    SetFixedVideoMobileSize(); 
    $('#ShareContentArea').toggleClass('show');
    if($('#ShareContentArea').hasClass('show')){//聊天UI 出現
        $('#YtInfinityPlayer').addClass('MoreRight');
        $('.Rounds').addClass('MoreRight');
    }else{
        $('#YtInfinityPlayer').removeClass('MoreRight');
        $('.Rounds').removeClass('MoreRight');        
    }
}
$(document).on("click",'button#ShareListBtnAttr',function(){//在 聊天室中 使用/取消 分享List
    $(this).toggleClass('useList');
    if($(this).hasClass('useList')){
        $('#ShareContentArea>p>input').attr('placeholder','請輸入歌單名稱');
        $(this).text('取消分享');
    }
    else{
        $('#ShareContentArea>p>input').attr('placeholder','說些什麼');
        $(this).text('分享歌單');
    }
});
$(document).on("click",'button#SendSays',function(){//送出 訊息(聊天室中)        
    //console.log($('#ShareContentArea div.datas').scrollHeight());
    if(CanSendMsg==false){
        alert('訊息發送過於頻繁(5秒冷卻)');
        return false;
    }
    if($('#ShareContentArea>p>input#says').val()==''){//Title 為空
        alert('請輸入內容');
        return false;
    }
    if($('#ShareContentArea #ShareListBtnAttr').hasClass('useList')){//使用 videoList分享
        if(FixedVideoPersonalList.length==0){
            alert('自訂List沒有Video')
            return false;
        }
        EmitMsg($('#ShareContentArea>p>input#says').val(),FixedVideoPersonalList);
        $('#ShareContentArea>p>input#says').val('');
    }else{//Send文字訊息 No Share VideoList
        EmitMsg($('#ShareContentArea>p>input#says').val(),[]);
        $('#ShareContentArea>p>input#says').val('');
    }
});
$(document).on("click",'button#FixedSendShareList',function(){//送出 訊息(迷你撥放器中)
    if(CanSendMsg==false){
        alert('訊息發送過於頻繁(5秒冷卻)');
        return false;
    }
    if($('.AddLinkPanel .bottoms input.Lists').val()==''){//Title 為空
        alert('請輸入內容');
        return false;
    }    
    if(FixedVideoPersonalList.length==0){
        alert('自訂List沒有Video')
        return false;
    }
    EmitMsg($('.AddLinkPanel .bottoms input.Lists').val(),FixedVideoPersonalList);
    $('.AddLinkPanel .bottoms input.Lists').val('');
    if($('#ShareContentArea').hasClass('show')==false){//如果沒開聊天室
        SetFixedVideoMobileSize();//開啟聊天室
        $('#ShareContentArea').addClass('show');//開啟聊天室
    }    
});
$(document).on("click",'#ShareContentArea .datas button.PlayShareList',function(){//撥放 ShareVideoList
    let TheKey=$(this).attr('key');
    if(ShareVideoAllData[TheKey].length==0){
        alert('錯誤(A)! 該VideoList 為空');
        return false;
    }
    // FixedVideoChannelList=ShareVideoAllData[TheKey];//List OBJ
    // //Video ID Array
    // FixedVideoIdList=[...ShareVideoAllData[TheKey]].map((i)=>{
    //     return i['videoId'];
    // });    
    // FixedPlayerBuildYoutubeVideo(ShareVideoAllData[TheKey][0]['videoId'],'ShareChannel')    
    DoSareVideoDataTransform(TheKey);
});
function DoSareVideoDataTransform(TheKey){
    FixedVideoChannelList=ShareVideoAllData[TheKey];//List OBJ
    //Video ID Array
    FixedVideoIdList=[...ShareVideoAllData[TheKey]].map((i)=>{
        return i['videoId'];
    });    
    FixedPlayerBuildYoutubeVideo(ShareVideoAllData[TheKey][0]['videoId'],'ShareChannel');
}
//------------Share Content Area--------------------

//-----------RWD Resize ForMible--------------------
$( window ).resize(function() {    
    SetFixedVideoMobileSize();    
});
function SetFixedVideoMobileSize(){
    let Wdwd=$(window).width();
    let Wdht=$(window).height();    
    if(Wdwd<=800){//設聊天室Mobile 高度
        console.log(Wdwd)
        let H1=Wdwd*0.6+88;        
        let OutH=Wdht-H1;
        //$('#ShareContentArea>span').text(`${Wdht}||${H1}`);//Get Test Height
        $('#ShareContentArea').css('height',`${OutH+35}px`);//聊天室 高度       
    }
    if(FixedYtElem!==null&&Wdwd<=800){//Mobile版型
        WindowIsMobileSize=true;
        FixedYtElem.setSize(Wdwd,Wdwd*0.6);        
        //----Set List Content Height
        let H1=Wdwd*0.6;
        let H2=$('#YtInfinityPlayer>p').height();
        let H3=50;
        let OutH=Wdht-(H1+H2+H3);        
        $('#FixedVideoList .contents').css('height',`${OutH}px`);         
        //----Set List Content Height

        //----List Btn Show/Hide icon
        if($('#YtInfinityPlayer>p').hasClass('show'))$('#YtInfinityPlayer>p>button').eq(0).text('▲');
        else{$('#YtInfinityPlayer>p>button').eq(0).text('▼');}
    }else if(Wdwd>800&&WindowIsMobileSize){//回到PC版型        
        //$('#FixedVideoList .contents').css('height',`310px`);
        $('#FixedVideoList .contents').removeAttr('style');
        $('#ShareContentArea').removeAttr('style');//聊天室 高度
        $('#YtInfinityPlayer').removeAttr('style');
        FixedYtElem.setSize(360,240);
        WindowIsMobileSize=false;
    }
}
//-----------RWD Resize ForMible--------------------

//----------Judge IOS Device-----------------------
function iOS() {
    return [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform)
    // iPad on iOS 13 detection
    || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}
//----------Judge IOS Device-----------------------
//----------Mobilce Detect-----------------------
window.mobileCheck = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};
//----------Mobilce Detect-----------------------