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
/*global $:false */

'use strict';


$(document).ready(function() {

  // Only works on Chrome
  if (!$('body').hasClass('chrome')) {
    $('.unsupported-overlay').show();
  }

  // UI
  var micButton = $('.micButton'),
    micText = $('.micText'),
    transcript = $('#text'),
    errorMsg = $('.errorMsg');

  // Service
  var recording = false,
    speech = new SpeechRecognizer({
      ws: '',
      model: 'WatsonModel'
    });

  speech.onstart = function() {
    console.log('demo.onstart()');
    recording = true;
    micButton.addClass('recording');
    micText.text('Press again when finished');
    errorMsg.hide();
    transcript.show();

    // Clean the paragraphs
    transcript.empty();
    $('<p></p>').appendTo(transcript);
  };

  speech.onerror = function(error) {
    console.log('demo.onerror():', error);
    recording = false;
    micButton.removeClass('recording');
    displayError(error);
  };

  speech.onend = function() {
    console.log('demo.onend()');
    recording = false;
    micButton.removeClass('recording');
    micText.text('Press to start speaking');
  };

  speech.onresult = function(data) {
    //console.log('demo.onresult()');
    showResult(data);
  };

  micButton.click(function() {
    if (!recording) {
      speech.start();
    } else {
      speech.stop();
      micButton.removeClass('recording');
      micText.text('Processing speech');
    }
  });

  function showResult(data) {
    //console.log(data);
    var socket = io();
    //if there are transcripts
    if (data.results && data.results.length > 0) {

      //if is a partial transcripts
      if (data.results.length === 1 ) {
        var paragraph = transcript.children().last(),
          text = data.results[0].alternatives[0].transcript || '';

        //Capitalize first word
        text = text.charAt(0).toUpperCase() + text.substring(1);
        // if final results, append a new paragraph
        if (data.results[0].final){
          text = text.trim() + '.';
          $('<p></p>').appendTo(transcript);
        }
        paragraph.text(text);
      }
    }
    transcript.show();  
    socket.emit('data', text);
  }

  function displayError(error) {
    var message = error;
    try {
      var errorJson = JSON.parse(error);
      message = JSON.stringify(errorJson, null, 2);
    } catch (e) {
      message = error;
    }

    errorMsg.text(message);
    errorMsg.show();
    transcript.hide();
  }

  //Sample audios
  var audio1 = 'audio/hackAudio1.wav',
    audio2 = 'audio/sample2.wav';

  function _error(xhr) {
    $('.loading').hide();
    displayError('Error processing the request, please try again.');
  }

  function stopSounds() {
    $('.sample2').get(0).pause();
    $('.sample2').get(0).currentTime = 0;
    $('.sample1').get(0).pause();
    $('.sample1').get(0).currentTime = 0;
  }

  $('.audio1').click(function() {
    $('.audio-staged audio').attr('src', audio1);
    stopSounds();
    $('.sample1').get(0).play();
  });

  $('.audio2').click(function() {
    $('.audio-staged audio').attr('src', audio2);
    stopSounds();
    $('.sample2').get(0).play();
  });

  $('.send-api-audio1').click(function() {
    transcriptAudio(audio1);
  });

  $('.send-api-audio2').click(function() {
    transcriptAudio(audio2);
  });
 
 
  
   $('.send-image').click(function(){
    $(".chart1").append("Image features are: \n " );
    var socket = io();
    
      
    var video  = document.getElementById('video');
    var output = document.getElementById('output');
    
    var scaleFactor = 1;
    
    
    var w = video.videoWidth * scaleFactor;
    var h = video.videoHeight * scaleFactor;   
    var canvas = document.createElement('canvas');
        canvas.width  = w;
        canvas.height = h;
    var ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, w, h);  
        var dataURI = canvas.toDataURL();
        var cleanURI = dataURI.replace(/^data:image\/(png|jpg);base64,/, ""); 
      
    socket.emit('faceDataSend', cleanURI);
    socket.on('faceDataReturn', function(msg){
      $(".chart1").append(msg);
    });    
  });

  $('.send-text').click(function(){
    
    var socket = io();
    var myText = 'Romney: ...for amber waves of grain...for purple mountains majesty...[Caption: As Governor, Romney outsourced jobs to India. The Boston Globe 5/1/12] Romney: ...above the fruited plain...';

    socket.emit('textData', myText);       
    
        
       // var data = ctx.getImageData(0,0,w,h);
       // var jData = JSON.stringify(data);
       // console.log('jdata is: '+ jData);
        
        
       // console.log('cleanURL is: '+cleanURL);       
       // console.log('decodeData is: ');
       // console.log('dataURI is: '+ dataURL);
       // console.log('cleanURI is: '+ cleanURL);
        $(".chart").append("textual features are  : ");
       
        
        
//        canvas.toBlob(function(blob) {
//          var objectURL = URL.createObjectURL(blob);
//           var cleanURL = objectURL.substr(5);
//           console.log('cleanURL is : ' +cleanURL);
//          console.log('objectURL is: ' + objectURL);
//         // classifyImage(cleanURL);
//          });
        
        //socket.emit('dataImg', dataURL);
        socket.on('faces', function(msg){
          $(".chart1").append(msg);
        }); 
        socket.on('keywords', function(msg){
          console.log('keywords are: ' + msg)
          var msgJSON = JSON.parse(msg);
          var keywords = $('#keywords');         
          keywords.show();
          $(".chart").append(msg);
         // console.log('msgJSON length is: ' + msgJSON.length);
//          keyword.children().last().text(msg);
//          keyword.show();
          for(var i = 0 ; i < msgJSON.length; i++){
          // console.log('msgJSON element is: ' + JSON.stringify(msgJSON[i]) );
          // $(".chart").append("<h1>Keyword:</h1>");
          //  $(".chart").append("<h3>"+ msgJSON[i].text +"</h3>");
           
           // $("<h3>"+ msgJSON[i].text +"</h3>").appendTo(keywords);
           // $(".chart").append("<h1>Relevance Score:</h1>");            
           // $(".chart").append("<h3>"+ msgJSON[i].relevance +"</h3>");
           
          }
         
         
          
      });
  });  
        

  function showAudioResult(data){
    $('.loading').hide();
    transcript.empty();
    $('<p></p>').appendTo(transcript);
    showResult(data);
  }
  // submit event
  function transcriptAudio(audio) {
    $('.loading').show();
    $('.error').hide();
    transcript.hide();
    $('.url-input').val(audio);
    $('.upload-form').hide();
    // Grab all form data
    $.ajax({
      url: '/',
      type: 'POST',
      data: $('.upload-form').serialize(),
      success: showAudioResult,
      error: _error
    });
  }
  
  function classes(root) {
    var classes = [];

    function recurse(name, node) {
      if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
      else classes.push({packageName: name, className: node.name, value: node.size});
    }

    recurse(null, root);
    return {children: classes};
  }

});

//function filter() {
//  var video  = document.getElementById('video');
//  $('#filter').show();
//  video.muted = true;
//}
//
//function unfilter(){
//  var video  = document.getElementById('video');
//  $('#filter').hide();
//  video.muted = false;
//}
//
//document.getElementById("video").addEventListener('play', false);
$('#filter').hide();
//
//document.getElementById("video").addEventListener("timeupdate", function() {
//  if (this.currentTime >= 1 && this.currentTime <= 67) {
//       unfilter();
//   }
//}, false);
//document.getElementById("video").addEventListener("timeupdate", function() {
//  if (this.currentTime >= 68 && this.currentTime <=98) {
//       filter();
//   }
//}, false);
//
//
//document.getElementById("video").addEventListener("timeupdate", function() {
//  if (this.currentTime > 99 && this.currentTime <= 124) {
//       unfilter();
//   }
//}, false);
//
//document.getElementById("video").addEventListener("timeupdate", function() {
//  if (this.currentTime >= 125 && this.currentTime <= 155) {
//       filter();
//   }
//}, false);
//
//document.getElementById("video").addEventListener("timeupdate", function() {
//  if (this.currentTime >= 156 && this.currentTime <= 229) {
//       unfilter();
//   }
//}, false);
//document.getElementById("video").addEventListener("timeupdate", function() {
//  if (this.currentTime >= 230 && this.currentTime <= 259) {
//       filter();
//   }
//}, false);
//document.getElementById("video").addEventListener("timeupdate", function() {
//  if (this.currentTime >= 260 && this.currentTime <= 264) {
//       unfilter();
//   }
//}, false);
//document.getElementById("video").addEventListener("timeupdate", function() {
//  if (this.currentTime >= 265 && this.currentTime <= 297) {
//       filter();
//   }
//}, false);
//
//document.getElementById("video").addEventListener("timeupdate", function() {
//  if (this.currentTime >= 298 && this.currentTime <= 300) {
//       unfilter();
//   }
//}, false);
//
//document.getElementById("video").addEventListener("timeupdate", function() {
//  if (this.currentTime >= 298 && this.currentTime <= 327) {
//       filter();
//   }
//}, false);
//
//document.getElementById("video").addEventListener("timeupdate", function() {
//  if (this.currentTime >= 328 && this.currentTime <= 350) {
//       unfilter();
//   }
//}, false);
//document.getElementById("video").addEventListener("timeupdate", function() {
//  if (this.currentTime >= 351 && this.currentTime <= 385) {
//       filter();
//   }
//}, false);
//document.getElementById("video").addEventListener("timeupdate", function() {
//  if (this.currentTime >= 386 && this.currentTime <= 433) {
//       unfilter();
//   }
//}, false);
//document.getElementById("video").addEventListener("timeupdate", function() {
//  if (this.currentTime >= 434 && this.currentTime <= 433) {
//       filter();
//   }
//}, false);
//document.getElementById("video").addEventListener("timeupdate", function() {
//  if (this.currentTime >= 434 && this.currentTime <= 463) {
//       filter();
//   }
//}, false);
//document.getElementById("video").addEventListener("timeupdate", function() {
//  if (this.currentTime >= 464 && this.currentTime <= 475) {
//       unfilter();
//   }
//}, false);
//document.getElementById("video").addEventListener("timeupdate", function() {
//  if (this.currentTime >= 476 && this.currentTime <= 505) {
//       filter();
//   }
//}, false);
//document.getElementById("video").addEventListener("timeupdate", function() {
//  if (this.currentTime >= 506 && this.currentTime <= 508) {
//       unfilter();
//   }
//}, false);
//document.getElementById("video").addEventListener("timeupdate", function() {
//  if (this.currentTime >= 509 && this.currentTime <= 567) {
//       filter();
//   }
//}, false);
//document.getElementById("video").addEventListener("timeupdate", function() {
//  if (this.currentTime >= 567 && this.currentTime <= 596) {
//       unfilter();
//   }
//}, false);
//document.getElementById("video").addEventListener("timeupdate", function() {
//  if (this.currentTime >= 597 && this.currentTime <= 625) {
//       filter();
//   }
//}, false);
//document.getElementById("video").addEventListener("timeupdate", function() {
//  if (this.currentTime >= 626) {
//       unfilter();
//   }
//}, false);

