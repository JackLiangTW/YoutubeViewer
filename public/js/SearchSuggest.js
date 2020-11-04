let RequestCoolTime=false;
let NowSuggestListWord='';

//--------Search KeyWord Suggest-------------
$('#SearchPannel input').on('input', function() {
    if($('#SearchPannel input').val()==''){        
        ClearSuggestUI();
        return false;
    }
    if(RequestCoolTime){
        console.log('Time Not Yet');
        return false;
    }
    console.log('Time Good');
    let OrVal=$('#SearchPannel input').val();
    $.ajax({//[Request Ajax]初始化 抓今日data
        url: '/KwSuggest',
        type:'POST',
        contentType:"application/json",
        dataType:"json",
        data:JSON.stringify({'word':OrVal}),
        timeout:0,
        success: function(result){
            if(result.data.includes('window.google.ac.h(')&&
            OrVal==$('#SearchPannel input').val()){//符合格式 && UI關鍵字和API使用一樣
                RequestCoolTime=true;
                NowSuggestListWord=$('#SearchPannel input').val();
                setTimeout(function(){RequestCoolTime=false},300);
                // console.log(JSON.parse(result.data.slice(19,result.data.length-1)));
                MakeSuggestUI(JSON.parse(result.data.slice(19,result.data.length-1))[1]);
            }
        }
    });
});
function MakeSuggestUI(DATAS){    
    $('#SuggestList').empty();
    let Res='';
    DATAS.forEach((i) => {
        // console.log(i);
        // console.log(decodeURIComponent(i));
        Res=Res+`<p onclick="DoApiRequestYtPage('${i[0]}')">${i[0]}</p>`
    });
    $('#SuggestList').append(`${Res}`);
}
function ClearSuggestUI(){
    $('#SuggestList').empty();
}
//--------Search KeyWord Suggest-------------
