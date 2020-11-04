const mongoose=require("mongoose");

const RecordDataschema=new mongoose.Schema({
    date:{
        type:String,
        default:'0',
    },
    kind:{
        type:String,
        default:'RecordData',
    },
    data:{
        type:Object,      
    }
});
module.exports=mongoose.model('RecordData',RecordDataschema);
