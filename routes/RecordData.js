const RecordSchema=require('./schema/RecordDataSchema');
const MsgSchema=require('./schema/MsgSchema');

async function CrawlerCreateSchema(TheData){//App.js 使用await Addvalue() 
    return new Promise(async function(resolve,reject){        
        const upschem=new RecordSchema({
            date:`${new Date().toLocaleString('zh-TW', {timeZone: 'Asia/Taipei'})}`,//new Date().getTime()
            kind:`RecordData`,
            data:TheData
        });
        try{
            await upschem.save();
            console.log("Record DB DONE");
            resolve("DB DONE");
        }catch(err){
            console.log("Record DB Err:"+err);  
            reject("DB ERR:"+err)
        }    
    })
}
async function MsgInsertData(KD,TheData){
    return new Promise(async function(resolve,reject){
        const upschem=new MsgSchema({
            date:`${new Date().getTime()}`,//new Date().getTime()
            kind:`${KD}`,
            data:TheData
        });
        try{
            await upschem.save();
            console.log("DB DONE");
            resolve("DB DONE");
        }catch(err){
            console.log("DB ERR:"+err);  
            reject("DB ERR:"+err);
        }
    })
}
async function MsgGetData(KIND,Max){
    return new Promise(async function(resolve,reject){
        let query={};
        if(KIND=='msg')query['kind']='msg';
        else if(KIND=='list')query['kind']='list';
        await MsgSchema.find(query).sort('-date').limit(Max).exec(function(err, posts){
            //console.log(posts.length);
            if(err)resolve([]);
            resolve(posts);
        });
    })
}
async function MsgDeleteOtherData(Max){//除了最新 Max 個,其他刪除
    return new Promise(async function(resolve){
        if(Max!==0){
            await MsgSchema.find({}).sort('-date').limit(Max).exec(async function(err, posts){
                //console.log(posts.length);
                if(err)resolve([]);
                let Nids=posts.map((doc)=> doc._id);
                await MsgSchema.deleteMany({_id: {$nin: Nids}}, (err)=> {
                    console.log("D Down");
                });             
                resolve();
            });
        }else{
            await MsgSchema.deleteMany({}, (err)=> {
                console.log("D All Down");
            });             
        }
    });
}
module.exports.CrawlerCreateSchema =CrawlerCreateSchema;
module.exports.MsgInsertData =MsgInsertData;
module.exports.MsgGetData =MsgGetData;
module.exports.MsgDeleteOtherData=MsgDeleteOtherData;