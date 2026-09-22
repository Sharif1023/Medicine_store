import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveAssetUrl} from '../src/api/assets.js';
test('images resolve under the configured API origin and application subpath',()=>{
 for(const value of ['/uploads/products/a.png','uploads/products/a.png','server/uploads/products/a.png','server\\uploads\\products\\a.png','products/a.png','http://localhost:5000/uploads/products/a.png'])assert.equal(resolveAssetUrl(value,'https://api.example.com/shop/api/v1/'),'https://api.example.com/shop/uploads/products/a.png');
 assert.equal(resolveAssetUrl('/uploads/products/a.png','/api/v1'),'/uploads/products/a.png');
 assert.equal(resolveAssetUrl('https://cdn.example.com/a.png','/api/v1'),'https://cdn.example.com/a.png');
 assert.equal(resolveAssetUrl('javascript:alert(1)'), '');
 assert.equal(resolveAssetUrl('/product-placeholder.svg','https://api.example.com/api/v1'),'/product-placeholder.svg');
});
