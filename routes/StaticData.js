const UploadResTemplate=require('../jsons/UploadResTemplate.json');
const SearchTemplate=require('../jsons/SearchTemplate.json');

function JudgeResponse(payload,title_name){
    //console.log(title_name);
    let response;//傳出回復的值
    let response2=0;//傳出回復的值
    let IsQickMode=false;
    let DB_stage=0;
    let mydata={
      TarStage:-1,
      key:'',
      value:title_name,      
    }
    switch (payload) {
        case '<GET_STARTED_PAYLOAD>'://(點)開始使用
          response =  UploadResTemplate.tp0;
          break;
        case 'QICKUPLOAD'://(點)快速許願/上架
            DB_stage=-1;//刪除原DB
            response =  UploadResTemplate.tp0a;
            break;
        case 'QICKSEARCH'://(點)關於AMI
            DB_stage=-1;//刪除原DB
            response =  SearchTemplate.tp0;
            //response =  {'text':'快速搜尋......'};
            break;
        case '<GoTP1>'://(點)選擇中文
            IsQickMode=true;
            response2 =  UploadResTemplate.tp1;
            response =  UploadResTemplate.tp2;
            break;
        case '<GoTP3a>'://(點)我是店家
            DB_stage=1;
            IsQickMode=true;            
            response =  UploadResTemplate.tp3a;
            mydata.TarStage=0;
            mydata.key='way';            
            break;
        case '<GoTP3b>'://(點)我是商品
            DB_stage=1;            
            IsQickMode=true;
            response =  UploadResTemplate.tp3b;
            mydata.TarStage=0;
            mydata.key='way';            
            break;
        case '<GoTP3c>'://(點)我提供服務
            DB_stage=1;            
            IsQickMode=true;
            response =  UploadResTemplate.tp3c;
            mydata.TarStage=0;
            mydata.key='way';            
            break;
        case '<GoTP3d>'://(點)我是小廣告
            DB_stage=1;            
            IsQickMode=true;
            response =  UploadResTemplate.tp3d;
            mydata.TarStage=0;
            mydata.key='way';            
            break;
        case '<GoTP4a>'://(點)北部            
            IsQickMode=true;            
            response =  UploadResTemplate.tp4a;
            mydata.TarStage=3;
            mydata.key='distict1';            
            break;
        case '<GoTP4b>'://(點)中部
            IsQickMode=true;
            response =  UploadResTemplate.tp4b;
            mydata.TarStage=3;
            mydata.key='distict1';            
            break;
        case '<GoTP4c>'://(點)南部
            IsQickMode=true;
            response =  UploadResTemplate.tp4c;
            mydata.TarStage=3;
            mydata.key='distict1';            
            break;
        case '<GoTP4d>'://(點)東/其他部
            IsQickMode=true;
            response =  UploadResTemplate.tp4d;
            mydata.TarStage=3;
            mydata.key='distict1';            
            break;
        case '<GoTP4e>'://(點)不分區
            response =  UploadResTemplate.tp5;
            mydata.TarStage=3;
            mydata.key='distict1';            
            break;
        case '<GoTP5>'://(點)縣市
            DB_stage=99;//finished
            mydata.TarStage=4;
            mydata.key='distict2';
            response =  UploadResTemplate.tp5;
            break;
        case '<GoSP1>'://點 "選擇搜尋類別"
            DB_stage=2;
            mydata.TarStage=0;
            mydata.key='SearchClass';
            IsQickMode=true;
            response =  SearchTemplate.tp1;
            break;        
        case '<GoSP3>':
            mydata.TarStage=2;
            mydata.key='SortClass';
            IsQickMode=true;
            response =  SearchTemplate.tp3;
            break;
        case '<GoSP4>':
            mydata.TarStage=3;
            mydata.key='SortTime';            
            response =  SearchTemplate.tp4;
            break;
        default:
            response ={ "text": "流程或輸入錯誤，請重新執行" }
             console.log('Sorry,ERRRRRR');
      }
      return [
        [IsQickMode,response,response2,DB_stage],
        mydata
      ]
}

function GetUPTemNameV(name){
    return UploadResTemplate[name];
}
function GetUSTemNameV(name){
    return SearchTemplate[name];
}

module.exports.JudgeResponse=JudgeResponse;
module.exports.GetUPTemNameV=GetUPTemNameV;
module.exports.GetUSTemNameV=GetUSTemNameV;