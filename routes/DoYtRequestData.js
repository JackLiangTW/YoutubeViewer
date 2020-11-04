var request = require('request');
var iconv = require('iconv-lite'); //編碼 轉換
function GetVideoBySearch(Datas){//Search Page Url Get Videos
    if(Datas.includes('"title":{"runs":[{"text":"')==false)return false;
    let Arr=Datas.split('"title":{"runs":[{"text":"');
    let New=[];
    let UrlArr=[];
    let SuggestKW=false;
    if(Datas.includes('"correctedQuery":{"runs":')){//有 建議關鍵字
        let sgss=Datas.split('"correctedQuery":{"runs":');
        SuggestKW=sgss[1].slice(0,sgss[1].indexOf('},"correctedQueryEndpoint"'));
    }
    Arr.forEach((i,nb)=>{
      if(nb>0&&i.includes('watch?v=')){
        let OBJ={};
        let ss=i.indexOf('"}]');
        OBJ.name=i.slice(0,ss);
        let ss1=i.indexOf('"publishedTimeText":{"simpleText":"');
        let I1=i.slice(ss1,i.length);
        let ss1End=I1.indexOf('"},');
        OBJ.time=I1.slice(35,ss1End);
        let ss2=i.indexOf('watch?v=')
        let I2=i.slice(ss2+8,i.length);
        let ss3=I2.indexOf('",');
        //OBJ.id='https://www.youtube.com/'+I2.slice(0,ss3);//Video Url Link
        OBJ.id=I2.slice(0,ss3);//Only VideoID
        OBJ.id=OBJ.id.slice(0,11);
        if(UrlArr.includes(OBJ.id)==false){
          UrlArr.push(OBJ.id);
          New.push(OBJ);
        }
      }
    });
    return {'word':SuggestKW,'data':New};
}
function GetDataByChannel(Datas){//Get Videos By Channel
  if(Datas.includes('{"videoId":"')==false)return false;
  let Arr=Datas.split('{"videoId":"');
  let New=[];
  let UrlArr=[];
  let Selector=`"title":{"accessibility":{"accessibilityData":{"label":"`;
  Arr.forEach((i,nb)=>{
    if(nb>0&&i.includes(Selector)){
      let OBJ={};
      let ss=i.indexOf('",');
      //OBJ.id='https://www.youtube.com/watch?v='+i.slice(0,ss);
      OBJ.id=i.slice(0,ss);
      let ss1=i.indexOf('"publishedTimeText":{"simpleText":"');
      let I1=i.slice(ss1,i.length);
      let ss1End=I1.indexOf('"},');
      OBJ.time=I1.slice(35,ss1End);
      let ss2=i.indexOf(Selector)
      let I2=i.slice(ss2+Selector.length,i.length);
      let ss3=I2.indexOf('"}},');
      OBJ.name=I2.slice(0,ss3);
      if(UrlArr.includes(OBJ.id)==false){
        UrlArr.push(OBJ.id);
        New.push(OBJ);
      }
    }
  });
  return New;
}
function GetChannelByString(Datas){//Search Page Url Get Channel
  //let Arr=Datas.split('{"url":"/channel/');
  if(Datas.includes('{"runs":[{"text":"')==false)return false;
  let Arr=Datas.split('{"runs":[{"text":"');
  let New=[];
  let UrlArr=[];
  let SuggestKW=false;
  if(Datas.includes('"correctedQuery":{"runs":')){//有 建議關鍵字
      let sgss=Datas.split('"correctedQuery":{"runs":');
      SuggestKW=sgss[1].slice(0,sgss[1].indexOf('},"correctedQueryEndpoint"'));
  }
  Arr.forEach((i,nb)=>{
    if(nb>0&&i.includes('{"url":"/channel/')){
      let OBJ={};
      let ss=i.indexOf('",');
      OBJ.name=i.slice(0,ss);
      let ss2=i.indexOf('{"url":"/channel/')
      let I2=i.slice(ss2+8,i.length);
      let ss3=I2.indexOf('",');
      OBJ.url='https://www.youtube.com'+I2.slice(0,ss3);
      if(UrlArr.includes(OBJ.url)==false&&JudgeStrHasCode(OBJ.name)){
        UrlArr.push(OBJ.url);
        New.push(OBJ);
      }
    }
  })
  //return New;
  return {'word':SuggestKW,'data':New};
}
function JudgeStrHasCode(STR){//判斷字串是否包含 類似"code符號"
  if(STR.includes('}')||STR.includes('],')||STR.includes(']'))return false;
  return true;
}
function SearchVideoRequest(KW,KIND){//KeyWord搜尋 Video
  return new Promise(async function(resolve){
    KW=encodeURIComponent(KW);
    let QueryPar={
      relevance:'&sp=EgIQAQ%253D%253D',
      date:'&sp=CAISAhAB',
      viewCount:'&sp=CAMSAhAB',
      rate:'&sp=CAESAhAB'
    }
    var url = `https://www.youtube.com/results?search_query=${KW}${QueryPar[KIND]}`;//Seach for videos
    await request.get(url,function(err, response, body){
        if(err){
          console.log(err);
          resolve(false);
        }
        resolve(GetVideoBySearch(body));
    });
  })
}
function SearchChannelRequest(KW){//KeyWord搜尋 Channel
    KW=encodeURIComponent(KW);
    return new Promise(async function(resolve){
        var url = `https://www.youtube.com/results?search_query=${KW}&sp=EgIQAg%253D%253D`;
        await request.get(url,function(err, response, body){
            if(err){
              console.log(err);
              resolve(false);
            }
            resolve(GetChannelByString(body));
          });
    })
}
function GetChannelVideoRequest(URL){//Get Channel's Videos
    return new Promise(async function(resolve){
        //URL=encodeURIComponent(URL);
        await request.get(URL,function(err, response, body){
            if(err){
              console.log(err);
              resolve(false);
            }
            resolve(GetDataByChannel(body));
        });
    })
}
function YtKeyWordSuggest(WORD){//文字輸入 提示
  return new Promise(async function(resolve){
    let KW=encodeURIComponent(WORD);
    await request(
    {
      method: "GET",
      uri:`https://clients1.google.com/complete/search?client=youtube&hl=zh-TW&gl=tw&q=${KW}`,
      encoding: null, //设置encoding
      headers:{'Content-Type':'text/javascript; charset=UTF-8'},
      },function(err, response, body){
        if (!err && response.statusCode == 200) {
          const Res=iconv.decode(body, 'CP950').toString();
          resolve(Res);
        }else{
          resolve(false);
        }
      });
  })
}
module.exports.SearchVideoRequest=SearchVideoRequest;
module.exports.SearchChannelRequest=SearchChannelRequest;
module.exports.GetChannelVideoRequest=GetChannelVideoRequest;
module.exports.YtKeyWordSuggest=YtKeyWordSuggest;//文字輸入 提示