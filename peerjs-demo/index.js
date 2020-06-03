var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var peer = new Peer(null, {
    // host: 'ec2-52-14-65-218.us-east-2.compute.amazonaws.com',
    // port: 9000,
    // secure: false,
    debug: 3
});

peer.on('open', function(id) {
    document.querySelector('#peer-id').innerText = id;
});

peer.on('call', function(call) {
    getUserMedia({video: true, audio: true}, function(stream) {
	call.answer(stream); // Answer the call with an A/V stream.
	call.on('stream', function(remoteStream) {
	    // Show stream in some video/canvas element.
	    showVideo('#local-video', stream);
	    showVideo('#remote-video', remoteStream);
	});
    }, function(err) {
	console.log('Failed to get local stream', err);
    });
});

peer.on('error', function(err) {
    console.log(err);
});


function call() {
    var peerId = document.querySelector('#remote-id').value;

    getUserMedia({video: true, audio: true}, function(stream) {
	var call = peer.call(peerId, stream);
	call.on('stream', function(remoteStream) {
	    // Show stream in some video/canvas element.
	    showVideo('#local-video', stream);
	    showVideo('#remote-video', remoteStream);
	});
    }, function(err) {
	console.log('Failed to get local stream' ,err);
    });
}

function showVideo(selector, stream) {
    var video = document.querySelector(selector);
    video.srcObject = stream;
    video.onloadedmetadata = function(e) {
	video.play();
    };
}
