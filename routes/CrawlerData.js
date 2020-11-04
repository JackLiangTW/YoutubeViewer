const CrawlerSchema=require('./schema/CrawlerSchema');
const CopySchema=require('./schema/CopySchema');

function ToDate(tt){
    let dd = new Date(tt);
    let years=dd.toString().slice(11,15);
    let month=dd.getMonth()+1;
    let days=dd.toString().slice(8,10);
    let out=`${years}/${month}/${days}`
    return out;
  }

async function CrawlerCreateSchema(Dd,Ttime,KD){//App.js 使用await Addvalue() 
    return new Promise(async function(resolve,reject){
        let Dt;
        if(Ttime==null)Dt=ToDate(new Date().getTime());
        else{Dt=Ttime;}
        await DeleteSchemaAndAddtoCopy(KD);
        const upschem=new CrawlerSchema({
            date:Dt,
            kind:KD,
            data:Dd
        });
        try{
            await upschem.save();
            console.log("DB DONE");
            resolve("DB DONE");
        }catch(err){
            console.log("DB ERR:"+err);  
            reject("DB ERR:"+err)
        }    
    })
}
async function DeleteSchemaAndAddtoCopy(KD){
    await CrawlerSchema.findOne({kind:`${KD}`},async function (err, userDoc) {             
        if(userDoc){//找到舊的 Post Schema -> 備份+刪除
            await InsertAndDeleteCopySchema(userDoc);
            //console.log(userDoc['_id']);
            await CrawlerSchema.deleteOne({_id:`${userDoc['_id']}`},function (err) {
                if (err) console.log(`D0::`+err);
            });
        }else{
            console.log(`This is first${KD} Schema`);
        }
    })
}
async function InsertAndDeleteCopySchema(data){//App.js 使用await Addvalue() 
    return new Promise(async function(resolve,reject){
        let QuS={kind:`${data.kind}`};
        await CopySchema.deleteMany(QuS,function (err) {//刪除備份區所有該Kind Schema
            if (err) console.log(err);                
        });
        const upschem=new CopySchema({
            date:data.date,
            kind:data.kind,
            data:data.data
        });
        try{
            await upschem.save();
            console.log(`Copy ${data.kind} DONE`);
            resolve("DB DONE");
        }catch(err){
            console.log("DB ERR:"+err);  
            reject(`Copy ${data.kind} ERR:${err}`)
        }    
    })
}
async function CrawlerGetSchema(key,Dd,type,KIND){//-抓schema值
    return new Promise(async function(resolve,reject){
        //console.log(KIND);
        const query ={};
        query[`kind`] = KIND;
        if(type==0){//用日期String 抓DB資料
            let Dt=ToDate(Dd);
            query[`${key}`] = Dt;
        }else if(type==1){//用_id 抓DB資料
            query[`${key}`] = Dd;
        }                 
        await CrawlerSchema.findOne(query,async function (err, userDoc) { 
            if(err){
                console.log(`There is No Related DB${KIND} data`);
                resolve(false);
            }
            if(!userDoc){//找不到對應DB                
                await CrawlerSchema.findOne({kind:`${KIND}`},async function (errr, userDocc) {                     
                    if(errr||!userDocc){                        
                        await CopySchema.findOne({kind:`${KIND}`}, function (e,Doc) { 
                            if(e||!Doc){
                                resolve(false);
                            }else{//找 copy備份區 DB
                                resolve(Doc);
                            }
                        });                        
                    }else{//直接給最新 DB
                        resolve(userDocc);                        
                    }
                });                
            }
            else{//正確找到當天對應 DB
                resolve(userDoc);                
            }
        })
    })   
}

async function ChangeSchema(ids,NewData){//-抓schema值
    return new Promise(async function(resolve,reject){
        const query = {};               
        query[`_id`] = ids;                        
        await CrawlerSchema.findOne(query,async function (err, userDoc) { 
            if(err){
                resolve('DB錯誤');
            }
            if(!userDoc){//找不到對應DB
                resolve('找不到該筆資料!');
            }
            else{//正確找到對應DB                
                let NEW=JsonAddfalseByArray(userDoc,NewData);//整理 刪除不備刊登的 POST
                await CrawlerSchema.deleteOne(query,function (err) {//刪除該DB
                    if (err) console.log(err);
                });
                await CrawlerCreateSchema(NEW.data,NEW.date,'facebook');//在建立一個新的DB 哈哈
                resolve("Change DONE");                
            }
        })
        
    })   
}

async function CrawlerGetAllSchema(){//-抓全部schema
    return new Promise(async function(resolve,reject){               
        await CrawlerSchema.find({}, function (err, userDoc) { 
            if(err){
                resolve(['GET 錯誤!',false]);
            }
            if(!userDoc){//找不到對應DB
                resolve(['找尋錯誤!',false]);
            }
            else{//正確找到對應DB
                let outs=[];
                var inb=0;
                while(inb<userDoc.length){
                    let s={date:'',_id:''};
                    s.date=userDoc[inb].date;
                    s['_id']=userDoc[inb]['_id'];
                    outs.push(s);
                    inb++;
                }                
                resolve(outs);
            }
        })
    })   
}
function JsonAddfalseByArray(data,NewData){
    let userDoc=data;
    let i=0;  
    while(i<userDoc.data.length){
      var s=0;
      while(s<userDoc.data[i].data_txt.length){        
        for(var t=0;t<NewData.length;t++){
          if(i==NewData[t][0]&&s==NewData[t][1]){
            userDoc.data[i].data_txt[s]=false;
          }
        }
        s++
      }        
      i++;
    }
    return DeleteJson(userDoc); 
  }
function DeleteJson(data){
    let userDoc=data;
    let i=0;  
    while(i<userDoc.data.length){
        var s=0;
        while(s<userDoc.data[i].data_txt.length){
        if(userDoc.data[i].data_txt[s]==false){//該child為false/空直
            userDoc.data[i].data_txt.splice(s,1);//length被裁短,s不用++
        }else{
            s++;
        }            
        }        
        i++;
    }
    return userDoc;
}
module.exports.CrawlerCreateSchema =CrawlerCreateSchema;
module.exports.CrawlerGetSchema =CrawlerGetSchema;
module.exports.ChangeSchema=ChangeSchema;
module.exports.CrawlerGetAllSchema=CrawlerGetAllSchema;
module.exports.DeleteSchemaAndAddtoCopy=DeleteSchemaAndAddtoCopy;