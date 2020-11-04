let MySocketID='';
const socket = io({transports: ['websocket'],forceNew:true, 'multiplex':false});
let CanSendMsg=true;//冷卻時間-可以Send Msg
let ShareVideoAllData=[
        [   
            {videoId:'T4SimnaiktU',title:'G.E.M.【光年之外 LIGHT YEARS AWAY 】'},
            {videoId:'bu7nU9Mhpyo',title:'周杰倫-告白氣球'},
            {videoId:'_sQSXwdtxlY',title:'【我的少女時代 Our Times】'},            
            {videoId:'Ew4VvF0DPMc',title:'Eric周興哲《以後別做朋友 The Distance of Love》'},
            {videoId:'XKuL5xaKZHM',title:'薛之謙 Joker Xue【演員】'},
            {videoId:'38lcQsEMGrk',title:'五月天-我不願讓你一個人'},
            {videoId:'-sM8SynMM5I',title:'兄弟本色 G.U.T.S【FLY OUT】'},            
            {videoId:'DyFIzKYQQYE',title:'田馥甄 Hebe Tien [寂寞寂寞就好 Leave Me Alone] '},            
            {videoId:'hjXrL7CuAvc',title:'哈林庾澄慶【缺口】'},
            {videoId:'F2uX6ByoW7A',title:'聽見下雨的聲音'},
        ],
        [
            {videoId:'JGwWNGJdvx8',title:'Ed Sheeran - Shape of You'},
            {videoId:'09R8_2nJtjg',title:'Maroon 5 - Sugar'},
            {videoId:'fLexgOxsZu0',title:'Bruno Mars - The Lazy Song'},
            {videoId:'RgKAFK5djSk',title:'Wiz Khalifa - See You Again'},
            {videoId:'3AtDnEC4zak',title:"Charlie Puth - We Don't Talk Anymore"},
            {videoId:'60ItHLz5WEA',title:'Alan Walker - Faded'},
            {videoId:'7wtfhZwyrcc',title:'Imagine Dragons - Believer'},            
            {videoId:'ytQ5CYE1VZw',title:'Eminem - Till I Collapse'},
            {videoId:'ALZHF5UqnU4',title:'Marshmello - 孤獨'},
            {videoId:'r6zIGXun57U',title:'Legends Never Die'},
        ],

];
$(document).ready(function(){    

    socket.on('reconnect_attempt', () => {        
        // on reconnection, reset the transports option, as the Websocket
        // connection may have failed (caused by proxy, firewall, browser, ...)
        socket.io.opts.transports = ['polling', 'websocket'];
    });
    socket.on("newclientconnect",function(msg){//--如果禁止對戰 新進玩家直接接收            
        //console.log("NewConnect::"+msg.id);
        MySocketID=msg.id;
    }); 
    socket.on("SendList",function(msg){//Get Msg From Server Socket
        //console.log(`Scoket Get Msg ${msg}`);
        if(MySocketID==msg.id){//自己的訊息            
            if(msg.list.length==0){//純 文字訊息
                $('#ShareContentArea div.datas').append(`
                <p class="myself">                
                <span>${msg.title}</span>
                </p>
                `);                                    
            }else{//Video List 分享                                
                $('#ShareContentArea div.datas').append(`
                <p class="myself">
                <button key="${ShareVideoAllData.length}" class="PlayShareList">►</button>
                <span>${msg.title}</span>
                </p>    
                `);
                ShareVideoAllData.push(msg.list);
            }            
        }
        else{//別人的訊息
            if(msg.list.length==0){//純 文字訊息
                $('#ShareContentArea div.datas').append(`
                <p class="Other">
                <span>${msg.title}</span>                
                </p>
                `);
            }else{//Video List 分享                
                $('#ShareContentArea div.datas').append(`
                <p class="Other">
                <span>${msg.title}</span>
                <button key="${ShareVideoAllData.length}" class="PlayShareList">►</button>
                </p>
                `);
                ShareVideoAllData.push(msg.list);
            }
        }
        $('#ShareContentArea div.datas').animate({
            scrollTop: $('#ShareContentArea div.datas').prop("scrollHeight")
        },400);
        // console.log(msg.id);
        // console.log(msg.IsVideo);
        //console.log(Array.isArray(msg.list));
    });    
});
function EmitMsg(TheTitle,TheList){
    //socket.emit('ListFromClient',{IsVideo:true,list:[{name:'???'}]});
    //console.log(TheTitle+"||"+TheList);
    socket.emit('ListFromClient',{
        title:TheTitle,
        list:TheList
    });
    CanSendMsg=false;
    RunCoolTimeSendMsg();
}
function RunCoolTimeSendMsg(){//冷卻時間發訊息 5s
    setTimeout(function(){ 
        CanSendMsg=true;
    },5000);
}