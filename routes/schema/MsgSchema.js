const mongoose=require("mongoose");

const Msgschema=new mongoose.Schema({
    date:{
        type:String,
        default:'0',
    },
    kind:{
        type:String,
        default:'msg',
    },
    data:{
        type:Array,      
    }
});
module.exports=mongoose.model('MsgData',Msgschema);
