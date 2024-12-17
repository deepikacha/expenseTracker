
const User=require('../models/user')
const{verifyToken}=require('../util/jwt')
exports.Authorize = async (req, res,next) => {
   // console.log("start")
    try{
 const token= req.headers.authorization;   
//  console.log(token,"middlewareauth line 6");
 if(!token){
    return res.status(401).json({message:"Authorization token is missing"})
 }
 const data=verifyToken(token);
 if(!data){
    return res.status(401).json({message:"invalid or expired token"})
 }
 console.log(data)
 const user=await User.findByPk(data.userId);
 if(!user){
    return res.status(404).json({message:"User not found"})
 }

 req.user=user;
//  console.log("end")
 next();

    }
    catch(error){
      console.log(error.message)
   return res.status(500).json({message:"Internal Server Error"})
    }

}

// Define checkPremium middleware

 // Export the middleware if needed
 
 

