const ytdl = require('ytdl-core');

const baseAdress = 'https://www.youtube.com/watch?v=';

function load(videoId) {
  let filters = { filter: 'audioonly' };

  return new Promise((resolve) => {
    const newStream = ytdl(`${baseAdress}${videoId}`, filters);
    length = 0;
    ytdl(`${baseAdress}${videoId}`, filters).on('data', function(chunk) {
      length += chunk.byteLength;
    }).on('end', function() {
      resolve({ success: true, data: newStream, length, });
    }).on('error', function(error) {
      resolve({ success: false, data: null, error })
    });
  });
}




module.exports = {
  load,
}