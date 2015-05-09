/**
 * Copyright 2014 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var app = require('express')(),
  server = require('http').Server(app),
  fs = require('fs'),
  io = require('socket.io')(server),  
  bluemix = require('./config/bluemix'),
  watson = require('watson-developer-cloud'), 
  express = require('express'),  
  AlchemyAPI = require('./alchemyapi.js'),  
  extend = require('util')._extend;



//Create the AlchemyAPI object

var alchemyapi = new AlchemyAPI();

// if bluemix credentials exists, then override local
var credentials = extend({
  version:'v1',
	username: '9f89ac94-949b-45b3-b34b-e4f64134c4ae',
	password: 'cLXZCiiMdRut'
}, bluemix.getServiceCreds('speech_to_text')); // VCAP_SERVICES

// Create the service wrapper
var speechToText = watson.speech_to_text(credentials);

// Configure express
require('./config/express')(app, speechToText);

// Configure sockets
require('./config/socket')(io, speechToText);


var AlchemyAPI = require('./alchemyapi');
var alchemyapi = new AlchemyAPI();
var textData = '';

//fs.open('./public/images/Clinton.jpg', 'r', function(err, fd) {
//  fs.fstat(fd, function(err, stats) {
//      var bufferSize=stats.size,
//          chunkSize=512,
//          buffer=new Buffer(bufferSize),
//          bytesRead = 0;
//
//      while (bytesRead < bufferSize) {
//          if ((bytesRead + chunkSize) > bufferSize) {
//              chunkSize = (bufferSize - bytesRead);
//          }
//          fs.read(fd, buffer, bytesRead, chunkSize, bytesRead);
//          bytesRead += chunkSize;
//      }
//      var bufferString = buffer.toString('hex', 0, bufferSize);
//      console.log(bufferString);
//      alchemyapi.image_keywords("image", bufferString , {}, function(response) {
////      console.log("image keywords are  : " + JSON.stringify(response["image_keywords"])+ '\n' );
//      fs.close(fd);
//  });
//});
//});
//fs.readFile('./public/images/Clinton.jpg','ucs2',function(err, data) {
//  if (err){
//    return console.log(err);
//  }
//  alchemyapi.image_keywords("image", data, {}, function(response) {
//  console.log("image keywords are  : " + JSON.stringify(response["image_keywords"])+ '\n' );
//})
//
//});
//  alchemyapi.image_keywords("image", './public/images/Clinton.jpg', {outputMode: JSON}, function(response) {
//  console.log("image keywords are  : " + response['imageKeywords']['text']+ '\n');
//});
//  alchemyapi.image_faces("image", './public/images/Clinton.jpg', {outputMode: JSON}, function(response) {
//    console.log("image faces are  : " + JSON.stringify(response)+ '\n');
//  });
io.on('connection', function(socket){
  socket.on('textData', function(msg){
    textData += msg;
    console.log('textData is now: ' + textData);
    alchemyapi.keywords("text", textData, {}, function(response) {
      console.log("Keywords are: " + JSON.stringify(response["keywords"])+'\n');
      var keywords = JSON.stringify(response["keywords"]);
      console.log("Keywords that are stringified are: "+keywords)
      socket.emit('keywords', keywords);    
    });
    });
  socket.on('faceDataSend', function(msg){
    alchemyapi.image_faces("image", './public/images/Clinton.jpg', {outputMode: JSON}, function(response) {
      console.log("image faces are  : " + JSON.stringify(response) + '\n');
      var faces = JSON.stringify(response);
      socket.emit('faceDataReturn', faces);
    });
  }); 
  
});
    
 
// //  socket.on('dataImg', function(msg){
// //    console.log('image message received');
// //    fs.readFile('./public/images/Clinton.jpg','ucs2',function(err, data) {
// //      if (err){
// //        return console.log(err);
// //      }
// //      alchemyapi.image_keywords("image", data, {}, function(response) {
// //      console.log("image keywords are  : " + JSON.stringify(response["image_keywords"])+ '\n' );
// //    })
// //    
// //    });
// //  });
  
// //});


//function AnalyzeThis(myText){
//
//
//alchemyapi.keywords("text", myText, {}, function(response) {
//  console.log("Keywords are: " + JSON.stringify(response["keywords"])+'\n');
//  var keywords = JSON.stringify(response["keywords"]);
//  console.log("Keywords that are stringified are: "+keywords)
//  //socket.emit('keywords', keywords);  
//  return keywords;
//  });
//alchemyapi.concepts("text", myText, {}, function(response) {
//  console.log("concepts are : " + JSON.stringify(response["concepts"])+'\n');
//  var concepts = response["concepts"];
//  });
//alchemyapi.entities("text", myText, {}, function(response) {
//  console.log("entities are : " + JSON.stringify(response["entities"])+ '\n' );
//  var entities = response["entities"];
//  });
////var results =keywords.concat(concepts);
////console.log('the concat JSON is:' + JSON.stringify(results));
//
//}
var port = process.env.VCAP_APP_PORT || 3000;
server.listen(port);

//

console.log('listening at:', port);



function example(req, res) {
  var output = {};
  console.log("Hello world");
  //Start the analysis chain
  entities(req, res, output);
}
var demo_url = 'http://www.npr.org/2013/11/26/247336038/dont-stuff-the-turkey-and-other-tips-from-americas-test-kitchen';
var demo_html = '<html><head><title>Node.js Demo | AlchemyAPI</title></head><body><h1>Did you know that AlchemyAPI works on HTML?</h1><p>Well, you do now.</p></body></html>';




function entities(req, res, output) {
  alchemyapi.entities('text', demo_text,{ 'sentiment':1 }, function(response) {
    output['entities'] = { text:demo_text, response:JSON.stringify(response,null,4), results:response['entities'] };
    keywords(req, res, output);
    console.log('Hello you are analyzing entities and the entities are' + entitites.text);
  });
}


function keywords(req, res, output) {
  alchemyapi.keywords('text', demo_text, { 'sentiment':1 }, function(response) {
    output['keywords'] = { text:demo_text, response:JSON.stringify(response,null,4), results:response['keywords'] };
    concepts(req, res, output);
  });
}


function concepts(req, res, output) {
  alchemyapi.concepts('text', demo_text, { 'showSourceText':1 }, function(response) {
    output['concepts'] = { text:demo_text, response:JSON.stringify(response,null,4), results:response['concepts'] };
    sentiment(req, res, output);
  });
}


function sentiment(req, res, output) {
  alchemyapi.sentiment('html', demo_html, {}, function(response) {
    output['sentiment'] = { html:demo_html, response:JSON.stringify(response,null,4), results:response['docSentiment'] };
    text(req, res, output);
  });
}


function text(req, res, output) {
  alchemyapi.text('url', demo_url, {}, function(response) {
    output['text'] = { url:demo_url, response:JSON.stringify(response,null,4), results:response };
    author(req, res, output);
  });
}


function author(req, res, output) {
  alchemyapi.author('url', demo_url, {}, function(response) {
    output['author'] = { url:demo_url, response:JSON.stringify(response,null,4), results:response };
    language(req, res, output);
  });
}


function language(req, res, output) {
  alchemyapi.language('text', demo_text, {}, function(response) {
    output['language'] = { text:demo_text, response:JSON.stringify(response,null,4), results:response };
    title(req, res, output);
  });
}


function title(req, res, output) {
  alchemyapi.title('url', demo_url, {}, function(response) {
    output['title'] = { url:demo_url, response:JSON.stringify(response,null,4), results:response };
    relations(req, res, output);
  });
}


function relations(req, res, output) {
  alchemyapi.relations('text', demo_text, {}, function(response) {
    output['relations'] = { text:demo_text, response:JSON.stringify(response,null,4), results:response['relations'] };
    category(req, res, output);
  });
}


function category(req, res, output) {
  alchemyapi.category('text', demo_text, {}, function(response) {
    output['category'] = { text:demo_text, response:JSON.stringify(response,null,4), results:response };
    feeds(req, res, output);
  });
}


function feeds(req, res, output) {
  alchemyapi.feeds('url', demo_url, {}, function(response) {
    output['feeds'] = { url:demo_url, response:JSON.stringify(response,null,4), results:response['feeds'] };
    microformats(req, res, output);
  });
}


function microformats(req, res, output) {
  alchemyapi.microformats('url', demo_url, {}, function(response) {
    output['microformats'] = { url:demo_url, response:JSON.stringify(response,null,4), results:response['microformats'] };
    taxonomy(req, res, output);
  });
}


function taxonomy(req, res, output) {
  alchemyapi.taxonomy('url', demo_url, {}, function(response) {
    output['taxonomy'] = { url:demo_url, response:JSON.stringify(response,null,4), results:response };
    combined(req, res, output);
  });
}

function combined(req, res, output) {
  alchemyapi.combined('url', demo_url, {}, function(response) {
    output['combined'] = { url:demo_url, response:JSON.stringify(response,null,4), results:response };
    image(req, res, output);
  });
}

function image(req, res, output) {
  alchemyapi.image('url', demo_url, {}, function(response) {
    output['image'] = { url:demo_url, response:JSON.stringify(response,null,4), results:response };
    image_keywords(req, res, output);
  });
}

function image_keywords(req, res, output) {
  alchemyapi.image_keywords('url', demo_url, {}, function(response) {
    output['image_keywords'] = { url:demo_url, response:JSON.stringify(response,null,4), results:response };
    res.render('example',output);
  });
}
