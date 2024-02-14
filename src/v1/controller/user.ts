import express from "express";
import Joi from "joi";
import { functions } from "../library/functions";
import { validations } from '../library/validation';
import { dbusers } from "../model/dbuser";

const bcrypt = require ('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
/*
//routes 
*/
router.post('/register',registerSchema, register);
router.post('/login',loginSchema, login );
router.put('/profile/update-username/:username',updateUsernameSchema, updateUsername);
/* 
//        validation
*/import express from "express";
import Joi from "joi";
import { functions } from "../library/functions";
import { validations } from '../library/validation';
import { dbusers } from "../model/dbuser";

const bcrypt = require ('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
/*
//routes 
*/
router.post('/register',registerSchema, register);
router.post('/login',loginSchema, login );
router.put('/profile/update-username/:username',updateUsernameSchema, updateUsername);
/* 
//        validation
*/
function registerSchema(req: any, res: any, next: any) {
    console.log('in registerschema');
    let schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),
        email: Joi.string().email().required(),
       password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/).required(),
        registration_date: Joi.date().iso().default(Date.now)
    });

    let validationsObj = new validations();
    if (!validationsObj.validateRequest(req, res, next, schema)) {
        return false;
    }
}

/**
 * User registration  
 */
async function register(req: any, res: any) {
    var functionsObj = new functions();
    console.log('in register');
    let usersObj = new dbusers();
    
    const existingUsername = await usersObj.getUserByUsername(req.body.username);
    if (existingUsername) {
        return res.send(functionsObj.output(0,'Username already exits '));
    }
    const existingEmail = await usersObj.getUserByEmail(req.body.email);
    if (existingEmail) {
        return res.send(functionsObj.output(0, 'Invalid Password'));
    }
    const hashedPassword = await bcrypt.hash(req.body.password,10);
    console.log(hashedPassword);
    interface UserData {
        username: string;
        email: string;
        password: string;
        registration_date: string; 
        user_id?: number; 
    }
    const userData = {} as UserData;
        userData.username = req.body.username;
        userData.email= req.body.email;
       userData.password = hashedPassword;
    
    if(req.body.user_id){
        userData.user_id = req.body.user_id;
        }

    const result: any = await usersObj.saveUserData(userData);
    var functionsObj = new functions();
    res.send(functionsObj.output(1, 'Regiseter Sucessfully', result));
    return false;
}


/**
 * User login  
 */
function loginSchema(req: any, res: any, next: any) {
    let schema =Joi.object({
        email: Joi.string().email({ tlds: { allow: false } }).max(100).required(),
       password: Joi.string().min(6).max(255).required()
    });

    let validationsObj = new validations();
    if (!validationsObj.validateRequest(req, res, next, schema)) {
        return false;
    }
}

 export async function login(req: any, res: any) {
    var functionsObj = new functions();
    try {
        const { email, password } = req.body;
        let usersObj = new dbusers();
        const user = await usersObj.getUserByEmail(email);
        if (!user) {
            res.send(functionsObj.output(0, 'Invalid Email'));
        } else {
            const storedHashedPassword = user ? user.password.trim() : null;
            if (!storedHashedPassword) {
                res.send(functionsObj.output(0, 'Invalid Password'));
                return;
            }    
            const passwordMatch: boolean = await bcrypt.compare(password.trim(), storedHashedPassword);
            console.log("Stored Hashed Password:", storedHashedPassword);
            console.log('Generated Hashed Password:', await bcrypt.hash(password.trim(), 10));
            console.log('Password Match:', passwordMatch);
            if (!passwordMatch) {
                res.send(functionsObj.output(0, 'Invalid Password'));
            } else {
                // Generate JWT token
                const token = jwt.sign({ user: user }, process.env.SECRET_KEY || 'abcdefg', { expiresIn: '1h' });
                res.send(functionsObj.output(1, 'LOGIN SUCCESS', token));
                console.log('Generated Token:', token);
            }
        }
    } catch (error: any) {
        console.error(error);
        res.send(functionsObj.output(0, 'Error', error.message));
    }

}
/*
// user update
*/
function updateUsernameSchema(req: any, res: any, next: any) {
    let schema =Joi.object({
        username: Joi.string(),
    });
    let validationsObj = new validations();
    if (!validationsObj.validateRequest(req, res, next, schema)) {
        return false;
    }
}
 async function updateUsername(req: any, res: any) {
    var functionsObj = new functions();
    try {
        const tokenData = req.tokenData;
        const currentUsername = tokenData.user.username;
        const newUsername = req.body.newUsername;
        if (!newUsername) {
            return res.send(functionsObj.output(0,'NewUseername is required'));
        }
        let usersObj = new dbusers();
        const updatedProfile = await usersObj.updateProfileByUsername(currentUsername, newUsername);
        if (!updatedProfile) {
            return res.send(functionsObj.output(0,'Failed to update the username'));
        }
        res.send(functionsObj.output(1, 'Username updated Sucessfully', { username: updatedProfile.username }));
    } catch (error) {
        console.error(error);
        res.send(functionsObj.output(0, 'Internal Server Error', null));
    }
}

export default router;







function registerSchema(req: any, res: any, next: any) {
    console.log('in registerschema');
    let schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),
        email: Joi.string().email().required(),
       password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/).required(),
        registration_date: Joi.date().iso().default(Date.now)
    });

    let validationsObj = new validations();
    if (!validationsObj.validateRequest(req, res, next, schema)) {
        return false;
    }
}

/**
 * User registration  
 */
async function register(req: any, res: any) {
    console.log('in register');
    let usersObj = new dbusers();
    
    const existingUsername = await usersObj.getUserByUsername(req.body.username);
    if (existingUsername) {
        return res.send({
            status: 0,
            message: 'Username already exists. Please choose a different username.'
        });
    }
    const existingEmail = await usersObj.getUserByEmail(req.body.email);
    if (existingEmail) {
        return res.send({
            status: 0,
            message: 'Email already exists. Please use a different email address.'
        });
    }
    const hashedPassword = await bcrypt.hash(req.body.password,10);
    console.log(hashedPassword);
    interface UserData {
        username: string;
        email: string;
        password: string;
        registration_date: string; 
        user_id?: number; 
    }
    const userData = {} as UserData;
        userData.username = req.body.username;
        userData.email= req.body.email;
       userData.password = hashedPassword;
    
    if(req.body.user_id){
        userData.user_id = req.body.user_id;
        }

    const result: any = await usersObj.saveUserData(userData);
    var functionsObj = new functions();
    res.send(functionsObj.output(1, 'Regiseter Sucessfully', result));
    return false;
}


/**
 * User login  
 */
function loginSchema(req: any, res: any, next: any) {
    let schema =Joi.object({
        email: Joi.string().email({ tlds: { allow: false } }).max(100).required(),
       password: Joi.string().min(6).max(255).required()
    });

    let validationsObj = new validations();
    if (!validationsObj.validateRequest(req, res, next, schema)) {
        return false;
    }
}

 export async function login(req: any, res: any) {
    var functionsObj = new functions();
    try {
        const { email, password } = req.body;
        let usersObj = new dbusers();
        const user = await usersObj.getUserByEmail(email);
        if (!user) {
            res.send(functionsObj.output(0, 'Invalid Email'));
        } else {
            const storedHashedPassword = user ? user.password.trim() : null;
            if (!storedHashedPassword) {
                res.send(functionsObj.output(0, 'Invalid Password'));
                return;
            }    
            const passwordMatch: boolean = await bcrypt.compare(password.trim(), storedHashedPassword);
            console.log("Stored Hashed Password:", storedHashedPassword);
            console.log('Generated Hashed Password:', await bcrypt.hash(password.trim(), 10));
            console.log('Password Match:', passwordMatch);
            if (!passwordMatch) {
                res.send(functionsObj.output(0, 'Invalid Password'));
            } else {
                // Generate JWT token
                const token = jwt.sign({ user: user }, process.env.SECRET_KEY || 'abcdefg', { expiresIn: '1h' });
                res.send(functionsObj.output(1, 'LOGIN SUCCESS', token));
                console.log('Generated Token:', token);
            }
        }
    } catch (error: any) {
        console.error(error);
        res.send(functionsObj.output(0, 'Error', error.message));
    }

}
/*
// user update
*/
function updateUsernameSchema(req: any, res: any, next: any) {
    let schema =Joi.object({
        username: Joi.string(),
    });
    let validationsObj = new validations();
    if (!validationsObj.validateRequest(req, res, next, schema)) {
        return false;
    }
}
 async function updateUsername(req: any, res: any) {
    var functionsObj = new functions();
    try {
        const tokenData = req.tokenData;
        const currentUsername = tokenData.user.username;
        const newUsername = req.body.newUsername;
        if (!newUsername) {
            return res.send(functionsObj.output(0,'NewUseername is required'));
        }
        let usersObj = new dbusers();
        const updatedProfile = await usersObj.updateProfileByUsername(currentUsername, newUsername);
        if (!updatedProfile) {
            return res.send(functionsObj.output(0,'Failed to update the username'));
        }
        res.send(functionsObj.output(1, 'Username updated Sucessfully', { username: updatedProfile.username }));
    } catch (error) {
        console.error(error);
        res.send(functionsObj.output(0, 'Internal Server Error', null));
    }
}

export default router;






