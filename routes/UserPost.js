//const router=require('express').Router();
const UPschema=require('./schema/UserPostSchema');
//const USschema=require('./UserSearchSchema');

async function USCreateValue(fbids){//App.js 使用await Addvalue() 
    return new Promise(async function(resolve,reject){
        const upschem=new UPschema({
            fbid:fbids,
            class:1
        });
        try{
            await upschem.save();
            resolve("JSON DONE");
            //console.log("Added DONE");        
        }catch(err){
            //console.log("Added ERR");        
            reject("JSON err:"+err)
        }    
    })
}

async function UPCreateValue(fbids){//App.js 使用await Addvalue() 
    return new Promise(async function(resolve,reject){
        const upschem=new UPschema({
            fbid:fbids,
            class:0                     
        });
        try{
            await upschem.save();
            resolve("Add DONE");
            //console.log("Added DONE");        
        }catch(err){
            //console.log("Added ERR");        
            reject("Add err:"+err)
        }    
    })   
}

async function UPGetValue(fbids){//-抓schema值
    return new Promise(async function(resolve,reject){
        await UPschema.findOne({'fbid':fbids}, function (err, userDoc) { 
            if(err){
                resolve(['流程或輸入錯誤，請重新執行',false]);
            }
            if(!userDoc){//找不到對應DB
                resolve(['流程或輸入錯誤，請重新執行',false]);
            }
            else{//正確找到對應DB
                resolve(userDoc);
            }
        })
    })   
}

async function UPDeleteValue(fbids){//-Delete schema
    return new Promise(async function(resolve,reject){
        await UPschema.deleteOne({'fbid':fbids}, function (err) {
            if (err) console.log(err); 
            resolve("DELETE DONE");
        });
    })   
}

async function UPTextAddValue(fbids,text){//fbID / 需要改變的database項名 / 上傳stage / 傳入文字 
    return new Promise(async function(resolve,reject){
        await UPschema.findOne({'fbid':fbids}, function (err, userDoc) { 
            if(err){
                resolve(['流程或輸入錯誤，請重新執行',false]);
            }
            if(!userDoc){//找不到對應DB
                resolve(['流程或輸入錯誤，請重新執行',false]);
            }
            else{//正確找到對應DB
                let RunMsg='';
                let RunStage=false;  
                let cls=-1;
                if(userDoc.class==1&&userDoc.stage==1){//Search模式 輸入關鍵字
                    userDoc.stage = userDoc.stage+1;
                    userDoc.mores.push({
                        key:`content`,
                        value:`${text}`
                    });
                    RunMsg='輸入搜尋名稱成功';
                    RunStage=true;
                    cls=1;
                }           
                else if(userDoc.stage>=1&&userDoc.stage<=2&&userDoc.class==0){//-Upload模式 輸入 title/content
                    if(userDoc.stage==1){
                        userDoc.stage = userDoc.stage+1;
                        userDoc.mores.push({
                            key:`title`,
                            value:`${text}`
                        });                        
                        RunMsg='輸入標題成功,請輸入文章內容';
                        RunStage=false;
                    }else if(userDoc.stage==2){
                        userDoc.stage = userDoc.stage+1;
                        userDoc.mores.push({
                            key:`content`,
                            value:`${text}`
                        });
                        RunMsg='輸入文章內容成功';
                        RunStage=true;
                        cls=0;
                    }                               
                }else{
                    resolve(['流程或輸入錯誤，請重新執行',false]);
                }

                userDoc.save(function (err) {
                    if (err){
                        resolve(['流程或輸入錯誤，請重新執行',false]);
                    }                   
                    resolve([RunMsg,RunStage,cls]);
                });   
            }
        })
    })   
}

async function UPTempAddValue(fbids,datas){//fbID / 需要改變的database項名 / 上傳stage / 傳入文字 
    return new Promise(async function(resolve,reject){
        await UPschema.findOne({'fbid':fbids}, function (err, userDoc) { 
            if(err){
                resolve([false,'流程錯誤，請重新執行']);
            }
            if(!userDoc){//找不到對應DB
                resolve([false,'找不到對應資料']);
            }
            else{//正確找到對應DB
                //console.log(datas);
                if(userDoc.stage==datas.TarStage){             
                    userDoc.stage=userDoc.stage+1;
                    userDoc.mores.push({
                        key:`${datas.key}`,
                        value:`${datas.value}`
                    })
                }

                userDoc.save(function (err) {                    
                    if (err){                        
                        resolve([false,'DB處存失敗']);
                    }                    
                    resolve([true,`${datas.key}已處存`]);
                });
            }
        })
    })   
}

//User Post DB export
module.exports.UPCreateValue =UPCreateValue;
module.exports.UPDeleteValue =UPDeleteValue
module.exports.UPGetValue =UPGetValue
module.exports.UPTextAddValue =UPTextAddValue;
module.exports.UPTempAddValue =UPTempAddValue;
//User Search DB export
module.exports.USCreateValue=USCreateValue;