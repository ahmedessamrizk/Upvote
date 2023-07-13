import { role } from './../../middleware/auth.js';

export const endPoint = {
    addPost:[role.Admin, role.User],
    updatePost:[role.Admin, role.User],
    deletePost:[role.Admin, role.User],
    getPosts:[role.Admin, role.User],
    addComment:[role.Admin, role.User]
}