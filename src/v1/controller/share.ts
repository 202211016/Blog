import express from "express";
import { dbshares } from "../model/dbshares";
import{ dbusers } from "../model/dbuser";
import { functions } from "../library/functions";

const router = express.Router();

/* 
//routes 
*/
router.post('/article/:id/share/:targetUserId', shareArticle);
router.get('/sharedarticle',getSharedArticles);
router.get('/article/:id/shares/count', validateID, getSharesCount);

/*
//validation for the id in the parameter  
*/
export function validateID(req: any, res: any, next: any) {
    let functionsObj = new functions();
    try {
        const id: number = Number(req.params.id);
        if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
            return res.send(functionsObj.output(0, 'Invalid id parameter (not an integer)', {}));
        }
        next();
    } catch (err) {
        res.send(functionsObj.output(0, 'Internal Server Error', {}));
    }
}
/*
// shareArticle 
*/
async function shareArticle(req: any, res: any) {  
    var functionsObj = new functions();
    try {
        const articleId = req.params.id;
        const user_id = req.tokenData.user.user_id;
        const targetUserId = req.params.targetUserId;
        if (!articleId || !targetUserId) {
            return res.send(functionsObj.output(0,'Articleid or the Target id parameter is missing',null));
        }
        const sharesObj = new dbshares();
        const shareData = {
            user_id: user_id,
            target_user_id: targetUserId,
            article_id: articleId,       
        };
        const result = await sharesObj.saveShareData(shareData);
        if (!result) {
            return res.send(functionsObj.output(0,'Failed to share the article',null));
        }
        return res.send(functionsObj.output(1,'Article shared Sucessfully'));
    } catch (error) {
        console.error('Error sharing the article:', error);
        res.send(functionsObj.output(0, 'Internal Server Error', null));
    }
}

async function getSharedArticles(req: any, res: any) {
    var functionsObj = new functions();
    try {
        const sharesObj = new dbshares();
        const usersObj = new dbusers();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        usersObj.page = page;
        usersObj.rpp = limit;
        const targetUserId = req.tokenData.user.user_id;  
        const sharedArticles = await sharesObj.getSharesCountByArticleId(targetUserId);
        if (!sharedArticles || sharedArticles.length === 0) {
            return res.send(functionsObj.output(0, 'No shared articles found for the specified user.', null));
        }
        res.send(functionsObj.output(1, 'Shared Articles', { sharedArticles: sharedArticles }));
    } catch (error) {
        console.error('Error retrieving shared articles:', error);
        res.send(functionsObj.output(0, 'Internal Server Error', null));
    }
}

/*
// get sharecount 
*/
async function getSharesCount(req: any, res: any) {
    var functionsObj = new functions();
    try {
        const articleId = req.params.id;
        if (!articleId) {
            return res.send(functionsObj.output(0,'Articleid or the Target id parameter is missing',null));
        }
        const sharesObj = new dbshares();
        const sharesCount = await sharesObj.getSharesCountByArticleId(articleId);
        if (sharesCount === null) {
            return res.send(functionsObj.output(0,'Failed to retrive share counts'));
        }
        res.send(functionsObj.output(1,'Counts',{sharesCount}))
    } catch (error) {
        console.error('Error retrieving shares count for article:', error);
        res.send(functionsObj.output(0, 'Internal Server Error', null));
    }
}   


export default router;
