import express from "express";
import Joi from "joi";
import { validations } from "./library/validation";
const bcryptjs = require('bcryptjs');
import jwt from "jsonwebtoken";
import userRouter from './controller/user';
import articleRouter from './controller/article';
import commentRouter from './controller/comment';
import likeRouter from './controller/like';
import searchRouter from'./controller/search';
import bookmarkRouter from './controller/boomark';
import shareRouter from './controller/share';
import { functions } from "./library/functions";

const router = express.Router();
router.use('/users', userRouter);

router.use(validateSchema);
router.use(verifyToken);

/*
 * Validation function 
 */
function validateSchema(req: any, res: any, next: any) {
    const schema = Joi.object({
        // user_id: Joi.number().integer().required(),optional()
        // accesstoken: Joi.string().trim().alphanum().min(32).max(32).required()
    });

    let validationsObj = new validations();
    if (!validationsObj.validateRequest(req, res, next, schema)) {
        return false;
    }
    else{
        next();
    }
}

 export const validateID =(req: any, res: any, next: any)=> {
    let functionsObj = new functions();
    try {
        const id:number = Number(req.params.id);
        
        if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
            return res.send(functionsObj.output(0, 'Invalid id parameter (not an integer)', {}));
        }
        next();
    } catch (err) {
        res.send(functionsObj.output(0, 'Internal Server Error', {}));
    }
}



// Middleware to verify the JWT token and extract the user_id
 function verifyToken(req: any, res: any, next: any) {
        const token = req.header('Authorization');
    
        if (!token) {
            return res.send({ error: 'Access denied. Token is missing.' });
        }
    
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY || 'abcdefg')as { user?: any };;
            if (!decoded || !decoded.user) {
                return res.send({ error: 'Invalid token. User data not found.' });
            }
            
            req.tokenData = decoded;
            next();
        } catch (error) {
            res.send({ error: 'Invalid token' });
        }
    }


/*
 * Primary app routes.
 */

router.use('/articles',articleRouter);
router.use('/comment',commentRouter);
router.use('/like',likeRouter);
router.use('/search',searchRouter);
router.use('/bookmark',bookmarkRouter);
router.use('/share',shareRouter);
module.exports = router;

export default validateID;