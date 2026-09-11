import {Router} from 'express';
import {auth} from '../middleware/auth.js';
import {isAdmin} from '../middleware/admin.js';
import catalogRoutes from './admin/catalog.routes.js';
import operationsRoutes from './admin/operations.routes.js';
import contentRoutes from './admin/content.routes.js';
import systemRoutes from './admin/system.routes.js';

const r=Router();
r.use(auth,isAdmin);
r.use(catalogRoutes);
r.use(operationsRoutes);
r.use(contentRoutes);
r.use(systemRoutes);
export default r;
