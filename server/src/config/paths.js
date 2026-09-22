import path from 'path';
import {fileURLToPath} from 'url';
import {env} from './env.js';

const here=path.dirname(fileURLToPath(import.meta.url));
export const serverRoot=path.resolve(here,'../..');
export const uploadsRoot=path.isAbsolute(env.uploadDir)?env.uploadDir:path.resolve(serverRoot,env.uploadDir);
