const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');

//redirect url middleware
const saveRedirectUrl = (req, res, next) => {
  if(req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  } 
  next();
};


// Render registration form
router.get('/signup' , (req, res) => {
    res.render('users/signup');
});

router.post('/signup', wrapAsync(async (req, res) => {
    try{
        let {username, email, password} = req.body;

        const newUser =  new User({username, email});

        let registeredUser = await User.register(newUser, password); // registers user and hashes password
        console.log(registeredUser);
        req.login(registeredUser, (err) => { // logs in the user after registration
            if(err) return next(err);
        });
        req.flash('success', 'Welcome to Wanderlust!');
        res.redirect('/listings');
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('/signup');
    } 
    
}));


router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login',saveRedirectUrl, passport.authenticate("local", {failureRedirect : '/login',failureFlash : true }), async (req, res) => {
    req.flash('success', 'Welcome back!');
    res.redirect(res.locals.redirectUrl || '/listings');
});

router.get('/logout', (req, res) => {
    req.logout((err)  =>{
        if(err) {
            return next(err);
        }
        req.flash('success', "you are logged out!");
        res.redirect('/listings');
    });
});

module.exports = router;