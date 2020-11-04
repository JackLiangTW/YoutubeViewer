const mongoose=require("mongoose");

const UPostschema=new mongoose.Schema({
    fbid:{
        type:String,
        default:'none',
    },
    class:{
        type:Number,
        default:0
    },
    stage:{
        type:Number,
        default:0
    },
    mores:{
        type:Array,      
    }
});

module.exports=mongoose.model('UserPost',UPostschema);
/*
default:{
            stage:0,
            way:'none',
            title:'none',
            content:'none',
            distict1:'none',
            distict2:'none',
        },
*/