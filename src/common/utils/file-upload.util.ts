import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';


export const profileImageUploadOptions = {

    storage: diskStorage({
        destination: './uploads/profile',

        filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const fileExt = extname(file.originalname);
            callback(null, `${uniqueSuffix}${fileExt}`);
        },
    }),

    fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
            return callback(new BadRequestException('Only image files are allowed (jpg, jpeg, png, webp)'), false);
        }
        callback(null, true);
    },

    limits: {
        fileSize: 5 * 1024 * 1024,
    },
};
