// config file

module.exports = {
	port: process.env.PORT || 8080,
	videoFormat: '.mp4',
	youtube: {
		metadata: 'http://www.youtube.com/get_video_info'
	}
};
