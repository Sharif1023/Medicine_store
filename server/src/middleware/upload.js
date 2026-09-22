import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import {uploadsRoot} from '../config/paths.js';

const mk=d=>{fs.mkdirSync(d,{recursive:true});return d};
const fileName=(req,file,cb)=>cb(null,crypto.randomUUID()+path.extname(file.originalname).toLowerCase());
const imageTypes=['image/jpeg','image/png','image/webp'];

function uploader(folder,{maxMb=5,types=imageTypes}={}){
  return multer({
    storage:multer.diskStorage({destination:(r,f,cb)=>cb(null,mk(path.join(uploadsRoot,folder))),filename:fileName}),
    limits:{fileSize:maxMb*1024*1024},
    fileFilter:(r,f,cb)=>cb(null,types.includes(f.mimetype))
  });
}

export const productUpload=uploader('products',{maxMb:8});
export const mediaUpload=uploader('media',{maxMb:8});
export const prescriptionUpload=uploader('private/prescriptions',{maxMb:10,types:[...imageTypes,'application/pdf']});
