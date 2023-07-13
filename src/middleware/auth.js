import jwt from 'jsonwebtoken'
import { userModel } from './../../DB/models/user.model.js';

export const role = {
    Admin: 'Admin',
    User: 'User'
}

export const auth = (accessRoles = []) => {
    return async(req, res, next) => {
        try {
            const { authorization } = req.headers;
            if(!authorization?.startsWith(process.env.BEARERKEY))
            {
                res.status(400).json({message: "Invalid bearer"});
            }else
            {
                const token = authorization.split(process.env.BEARERKEY)[1];
                const decoded = jwt.verify(token, process.env.EMAILTOKEN);
                if (!decoded?.id) {
                    res.status(400).json({message: "Invalid payload data"});
                } else {
                    const user = await userModel.findById(decoded.id).select('userName role');
                    if (!user) {
                        res.status(404).json({message: "Invalid id"});
                    } else {
                        if(accessRoles.includes(user.role))
                        {
                            req.user = user;
                            next();
                        }
                        else
                        {
                            res.status(403).json({message: "Not authorized"});
                        }
                    }
                }
            }
        } catch (error) {
            res.status(400).json({message: "Catch error", error})
        }
    }
}