/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
const project = 'books';
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if(err) throw err;
        db.collection(project).find({}).toArray(function(err, data){
          if(err) throw err;
          var sendData = [];
          
          data.forEach((ele, i) => {
            sendData.push(JSON.parse(JSON.stringify(ele)));
          });
          
          for(var i = 0; i < sendData.length; i++){
            delete sendData[i].comments;
          } 
          
          
          
          res.send(sendData);
          db.close();
        });      
      });
      
    })
    
    .post(function (req, res){
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
      if(!title || /^\s$/.test(title)){
        return res.type('text').send('No title selected');
      }
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if(err) throw err;
        db.collection(project).insertOne({title: title, comments: [], commentcount: 0}, function(err, data){
          if(err) throw err;
          res.json(data.ops[0]);
          
          db.close();
        });
        
        
      });    
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        db.collection(project).deleteMany({}, function(err, data){
          if(err){
            db.close();
            return res.type('text').send('could not delete book collection');
          } else {
            db.close();
            return res.type('text').send('complete delete successful');
          }         
          
        })
      });
      
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if(err) throw err;
        db.collection(project).findOne({_id: new ObjectId(bookid)}, function(err, data){
          if(err){
            throw err;
          };
          if(!data){
            res.type('text').send('no book exists');
            return;
          }
          
          res.json(data);
          db.close();
        });
      });
      
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if(err) throw err;
        db.collection(project).findOneAndUpdate({_id: new ObjectId(bookid)},
                                                {$push : {comments: comment},
                                                $inc: {commentcount: 1}},
                                                {new: true, upsert: false},
                                                function(err, data){
          if(err) throw err;
          
          
          db.collection(project).findOne({_id: new ObjectId(bookid)}, function(err, data){
            res.json(data);
            db.close(); 
          });                   
        });
      });
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if(err) throw err;
        
        db.collection(project).findOneAndDelete({_id: new ObjectId(bookid)}, function(err, data){
          if(err) throw err;
          
          res.type('text').send('delete successful');
          db.close();
        });
      });
     
    });
  
};
