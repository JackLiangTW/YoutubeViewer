require('dotenv').config();
const path=require('path');
const express=require("express");
const mongoose=require("mongoose");
const bodyParser=require("body-parser");
const socketIO = require('socket.io');
const schedule = require('node-schedule');
const router = express.Router();
var app=express();
app.use(express.json());
app.use(express.static(__dirname + '/public'));//allows access to public directory
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', router);//use app/router要放在最後(至少要bodyParser之後)
const PORT = process.env.PORT || 5000;
const CrawlerPost=require('./routes/CrawlerData');
const RecordDataDB=require('./routes/RecordData');

let DataRecord={//資料紀錄
  'UserNB':0,
  'MsgNB':0,
  'ListMsgNB':0,    
  'ips':[]
};

mongoose.connect(
  `${process.env.MONGOOSEID}`,
  {     
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true//導致heroku timeout 30000??
   },
  ()=>console.log("Connected mongoose!")
)
//schedule.scheduleJob('0 0 * * *', function(){// (0-59)秒/(0-59)分/(0-23)時/日/月/星期  
schedule.scheduleJob('0 0 * * *',async function(){// 秒/分/時/日/月/星期  
  await RecordDataDB.CrawlerCreateSchema(DataRecord);//..Do Insert Schema  
  //RecordDataDB.MsgDeleteOtherData(20);//刪除所有 聊天室DB除了最新 20筆
  ClearDayData();
});
router.get('/', (req, res) => {//router Render html
  res.sendFile(path.join(__dirname, './public', 'showPost.html'))
});
router.get('/getData',async function(req, res) {//抓該schema的crawler資料
  req.connection.setTimeout( 1000 * 60 * 5 );
  let VAL;
  let TP=0;
  let KIND=req.query.kind;
  if(Object.keys(req.query)[0]=='_id'){//if use _id findOne
    VAL=req.query['_id'];    
    TP=1;
  }else{//if use 日期 findOne
    let Days=req.query.date;
    Days=Days.split(',');
    VAL=new Date(parseInt(Days[0]),parseInt(Days[1]),parseInt(Days[2]));
  }
  //console.log(VAL);
  let datas=await CrawlerPost.CrawlerGetSchema(
    Object.keys(req.query)[0],
    VAL,
    TP,
    KIND
  );
  res.send({data:datas});
});
router.get('/getMsg',async function(req,res){  
  let DD=await RecordDataDB.MsgGetData('all',parseInt(req.query.nb));
  //let DD=await RecordDataDB.MsgGetData('list',parseInt(req.query.nb));//只拿 list DB
  //RecordDataDB.MsgDeleteOtherData(0);//刪除所有 聊天室DB除了最新 20筆
  res.send({data:DD});
})
const server=app.listen(PORT, function () {
  console.log(`Listening on ${ PORT }`);
});

//----------------------Do Socket IO------------------------
const io = socketIO(server);
io.on("connection",function(socket){  
  // if(DataRecord['ips'].includes(`${socket.request.connection._peername.address}`)==false){//ip今天第一次connect
  //   //console.log('connection :', socket.request.connection._peername);
  //   //socket.to(`${socket.id}`).emit('FirstVist','Hellow');
  //   DataRecord['ips'].push(`${socket.request.connection._peername['address']}`);
  //   DataRecord['UserNB']=DataRecord['UserNB']+1;
  // }
  console.log(`Got New User No : ${DataRecord['UserNB']}`);
  DataRecord['ips'].push(`${socket.request.connection._peername['address']}`);
  DataRecord['UserNB']=DataRecord['UserNB']+1;

  socket.emit('newclientconnect',{id:socket.id});//--登入後台
  socket.on("ListFromClient",function(msg){
    //console.log(msg);
    if(msg.list.length!==0){//msg是 歌單
      DataRecord['ListMsgNB']=DataRecord['ListMsgNB']+1;
      io.emit("SendList",{id:socket.id,title:msg.title,list:msg.list}); 
      RecordDataDB.MsgInsertData('list',[msg.title,msg.list]);
    }else{//msg pure text
      DataRecord['MsgNB']=DataRecord['MsgNB']+1;
      io.emit("SendList",{id:socket.id,title:msg.title,list:msg.list}); 
      RecordDataDB.MsgInsertData('msg',[msg.title,[]]);
    }    
  });
});
function ClearDayData(){
  DataRecord={//資料紀錄
    'UserNB':0,
    'MsgNB':0,
    'ListMsgNB':0,
    'ips':[]
  };
}
//----------------------Do Socket IO------------------------
 