import {clerkClient} from '@clerk/express';
import 'dotenv/config';


export const auth= async (req,res,next)=>{
    try {
        const {userId, has}= await req.auth();
        const hasPremiumPlan = await has({plan: 'pro'});

        const user = await clerkClient.users.getUser(userId);
        if(!hasPremiumPlan && user.privateMetadata.free_usage){
            req.free_usage = user.privateMetadata.free_usage
        }else{
            await clerkClient.users.updateUserMetadata(userId,{
                privateMetadata:{
                    free_usage:0
                }
            })
            req.free_usage=0;
        }
        req.plan=hasPremiumPlan?'pro':'free';
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ success: false, message: "Unauthorized" });
    }
}