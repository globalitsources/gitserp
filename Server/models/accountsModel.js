import mongoose from 'mongoose';

const accountSchema=new mongoose.Schema({
    company:{
        type:String,
        required:true,
    },
    address:{
        type:String,
        required:true,
    },
    gstin:{
        type:String,
        required:true,
    },
    rates:{
        type:Number,
    },
    invoiceDate:{
        type:Date
    },
    serviceType:{
        type:String,
    },
},
{
    timestamps:true,}
)
const Account=mongoose.model('Account',accountSchema);
export default Account;