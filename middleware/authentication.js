const { validateToken } = require("../services/authentication");

function checkForAuthenticationCookie(cookieName){
    return (req,res,next) =>{
        const tokencookieValue =req.cookies[cookieName];
        if(!tokencookieValue){
            return next();
        }
        try{
            const userpayload=validateToken(tokencookieValue);
            req.user=userpayload;
        }
        catch (error){};
       return  next();
    }
}
module.exports={
    checkForAuthenticationCookie,
}
