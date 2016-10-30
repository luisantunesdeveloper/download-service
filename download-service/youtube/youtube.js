'use strict';

const url = require('url');
const qs = require('querystring');
const config = require('../config');
const fs = require('fs');
const http = require('http');
const request = require('superagent');


function getVideoMetadata(videoId) {
  return request
    .get(config.youtube.metadata)
    .query({video_id: videoId});
}

function parseVideoMetadata(videoMetadata) {
    var urls = videoMetadata.url_encoded_fmt_stream_map.split('url=');
    urls.shift();
    var video = urls.map((url) => { //trim the videos
      url = url.replace(/fallback_host(\w|\W)+/, "");
      return { //build the object
        url: unescape(url),
        title: videoMetadata.title
      };
    }).reduce((a, b) => { //reduce to the object that contains the longest url
      if (a && b && a.url && b.url) {
        return a.url.length > b.url.length ? a : b;
      }
    });
    return video;
}

function downloadVideo(videoInfo, requestOptions) {
  var url = videoInfo.url;
  if (requestOptions.downloadPath) {
    var filename = requestOptions.downloadPath + videoInfo.title + config.videoFormat;
  } else {
    var filename = videoInfo.title + config.videoFormat;
  }
  console.log(`Downloading ${url} to ${filename}...`);
  return request
    .get(url)
    .pipe(fs.createWriteStream(filename));
}

function processVideo (req) {
  var requestOptions;
  return new Promise((resolve, reject) => {
    if (req.method === 'GET') {
      var url = req.url.substr(2);
      requestOptions = qs.parse(url);
      if (!requestOptions || !requestOptions.video_id) {
        return reject(Error("Need video id."));
      }
      console.log("Processing video id: ", requestOptions.video_id);
      return resolve(requestOptions);
    }
  })
  .then((requestOptions) => {
    return Promise.resolve(getVideoMetadata(requestOptions.video_id));
  })
  .then((response) => {
    return parseVideoMetadata(response.body);
  })
  .then((response) => {
    return Promise.resolve(downloadVideo(response, requestOptions));
  });

}


module.exports = (req, res) => {
  res.on('error', (err) => {
    console.error(err);
  });
  req.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
  }).on('end', () => {
    processVideo(req)
      .then((response) => {
        res.statusCode = 200;
        res.end("the end");
      })
      .catch((error) => {
        res.statusCode = error.statusCode;
        res.end("Cannot process the video: " + error.message);
      });
  });
};
