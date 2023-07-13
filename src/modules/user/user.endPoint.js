import { role } from './../../middleware/auth.js';

export const endPoint = {
    updateProfile:[role.User, role.Admin],
    softDelete:[role.User, role.Admin],
    profilePic: [role.User, role.Admin],
    blockUser: [role.Admin],
}