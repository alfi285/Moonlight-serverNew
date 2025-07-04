const { default: mongoose } = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        username:{
            type:String,
            required:true,
            min: 3,
            max:20,
            unique:true
        },

        email:{
            type:String,
            required:true,
            unique:true
        },

        password:{
            type:String,
            min:6,
            required:true
        },

        profilePicture:{
            type: String,
            default:""
        },

        coverPicture:{
            type:String,
            default:""
        },

        followers:{
            type:Array,
            default:[]
        },

        followings:{
            type:Array,
            default:[]
        },

        isAdmin:{
            type:Boolean,
            default:false
        },

        desc:{
            type: String,
            max: 50
        },
        bio: { type: String, default: "" },

        from:{
            type: String,
            max:50
        },

        relationship:{
            type:String,
            enum:[1, 2, 3],
        }
    },

    {timestamps:true}
);

module.exports = mongoose.model('User',UserSchema);