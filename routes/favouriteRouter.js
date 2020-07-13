const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Favorites = require('../models/favourites');
const Dishes = require('../models/dishes');
var authenticate = require('../authenticate');
var cors = require('./cors');

const favouriteRouter = express.Router();

favouriteRouter.use(bodyParser.json());

favouriteRouter.route('/')
.options(cors.corsWithOptions, (req, res)=>{res.sendStatus = 200})
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id}).populate('user').populate('dishes')
    .then((favs) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favs);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favs) => {
        if(!favs){
            Favorites.create({user: req.user._id, dishes: req.body})  
            .then((fav)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(fav.populate('user').populate('dishes'));
             
			}, (err)=>next(err))
            .catch((err)=>next(err));
		}
        else{
            for(let i=0;i<req.body.length;i++){
                if(favs.dishes.indexOf(req.body[i])===-1) favs.dishes.push(req.body[i]);
			}
  
            favs.save()
            .then((favs)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favs.populate('user').populate('dishes'));
		    }, (err)=>next(err))
            .catch((err)=>next(err));
		}
        
    }).catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.deleteOne({user: req.user._id})
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
	}, (err) => next(err))
    .catch((err) => next(err));    
});



favouriteRouter.route('/:favId')
.options(cors.corsWithOptions, (req, res)=>{res.sendStatus = 200})
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {

    Favorites.findOne({user: req.user._id})
    .then((favs) => {
        if(favs && (favs.dishes.indexOf(req.params.favId)!==-1)) {
            Dishes.findById(req.params.favId)
            .then((favDish)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favDish);
			}, (err)=>next(err))
            .catch((err)=>next(err));
        }
        else{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({status: 'This dish is not your favorite '});
		}

    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favs)=>{

        if(!favs){
            Favorites.create({user: req.user._id})  
            .then((favs)=>{

                favs.dishes.push(req.params.favId);
                favs.save()
                .then((fav)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(fav.populate('user').populate('dishes'));
                }, (err)=>next(err))
                .catch((err)=>next(err));

			}, (err)=>next(err))
            .catch((err)=>next(err));
		}
        else{
              if(favs.dishes.indexOf(req.params.favId)===-1) {
                    favs.dishes.push(req.params.favId);
                    favs.save()
                    .then((fav)=>{
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(fav.populate('user').populate('dishes'));
					}, (err)=>next(err))
                    .catch((err)=>next(err));
			  }
              else{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({status: 'Already favorite'});
			  }
		}
	}, (err)=>next(err))
    .catch((err)=>next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/'+ req.params.favId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favs) => {
        if(favs){
        
            favs.dishes = favs.dishes.filter((Id) => !Id.equals(req.params.favId));
            favs.save()
            .then((fav)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({status: 'Removed from favorite'});
		    }, (err) => next(err))
            .catch((err) => next(err));
        }
        else{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({status: 'not in favorite list'});
		}
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favouriteRouter;
