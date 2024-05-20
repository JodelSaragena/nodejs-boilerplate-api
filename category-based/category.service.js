const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const { Op } = require('sequelize');
const sendEmail = require('_helpers/send-email');
const db = require('_helpers/db');
const Role = require('_helpers/role');

module.exports = {
    getAll,
    getById,
    create,
    delete: _delete
};

async function getAll() {
    const categories = await db.Category.findAll();
    return categories.map(x => basicDetails(x));
}  

async function getById(id) { 
    const category = await getCategory(id);
    return basicDetails(category);
}

async function create(params) {
    const category = new db.Category(params); 
    category.verified = Date.now();
    
    // save account
    await category.save();
    
    return basicDetails (category);
}

async function _delete(id) {
    const category = await getCategory(id);
    await category.destroy();
    
}

// helper functions

async function getCategory(id) {
    const category = await db.Category.findByPk(id);
    if (!category) throw 'Category not found';
    return category; 
}
    
function basicDetails(categoryData) {
    const { id, description, amount, date, category, created, updated } = categoryData;
    return { id, description, amount, date, category, created, updated };
}