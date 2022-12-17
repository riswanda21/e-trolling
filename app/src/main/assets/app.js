let app = new App();
let http = new Http();
let storage = new Storage();
var API_URL = '';

if (storage.get('nama') == null) {
	route('/', 'login.mellow');
} else {
	if(storage.get('type') == 'kplp' || storage.get('type') == 'kalapas') {
		route('/', 'kplp.mellow');
	}else{
		route('/', 'home.mellow');
	}
}

if(storage.get('type') == 'kplp') {
	route('/home', 'kplp.mellow');
}else{
	route('/home', 'home.mellow');
}
route('/kplp', 'kplp.mellow');
route('/apel', 'apel.mellow');
route('/laporan-kplp', 'laporan-kplp.mellow');
route('/laporan-apel', 'laporan-apel.mellow');
route('/login', 'login.mellow');
route('/laporan', 'list-laporan.mellow');
route('/izin-kamera', 'izin-kamera.mellow');
route('/profile', 'profile.mellow');
route('/lapor', 'lapor.mellow');
route('/jadwal-kontrol', 'jadwal-kontrol.mellow');

const Mellow = function() {
	let app = new App();
	let http = new Http();
	let storage = new Storage();

	app.setTitle('E-Trolling');
	if (app.route == '/lapor') {
		openCamera();
	}
	return {
		nama: storage.get('nama'),
		jabatan: storage.get('jabatan'),
		currentDate: app.getDatetime('-'),
		menu_home: [
			{
				name: 'Kontrol Keliling',
				desc: 'Laporkan keadaan blok terkini',
				icon: 'buat-laporan.png',
				link: '/lapor'
			},
			{
				name: 'Jadwal Kontrol',
				desc: 'Jadwal kontrol keliling untuk tiap blok',
				icon: 'jadwal-blok.png',
				link: '/jadwal-kontrol'
			},
			{
				name: 'Apel Hunian',
				desc: 'Laporan jumlah narapidana tiap blok',
				icon: 'apel.png',
				link: '/apel'
			}
		],
		menu_kplp: [
			{
				name: 'Laporan Kontrol',
				desc: 'Lihat laporan kontrol keliling',
				icon: 'laporan.png',
				link: '/laporan-kplp'
			},
			{
				name: 'Laporan Apel',
				desc: 'Lihat laporan apel hunian',
				icon: 'apel.png',
				link: '/laporan-apel'
			}
		]
	};
};


function login() {
	fetch(API_URL + '/login/' + document.getElementById('username').value)
		.then((res) => res.json())
		.then((data) => {
			if (data.username == document.getElementById('username').value && data.password == document.getElementById('password').value) {
				storage.add('nama', data.name);
				storage.add('username', data.username);
				storage.add('jabatan', data.jabatan);
				storage.add('type', data.type);
				if(storage.get('type') == 'kplp' || storage.get('type') == 'kalapas') {
					app.redirect('/kplp');
				}else{
					app.redirect('/home');
				}
			} else {
				document.getElementById('incorrect').style.display = 'block';
			}
		});
}

function logout() {
    storage.clear();
	app.redirect('/login');
}

function buatLaporan() {
	http.post(API_URL + '/lapor', 'blok=' + document.getElementById('blok').value + '&tanggal=' + document.getElementById('tanggal').value + '&username=' + storage.get('username') + '&keterangan=' + document.getElementById('keterangan').value + '&author=' + storage.get('nama'));
	app.redirect('/home');
}

function laporapel() {
	http.post(API_URL + '/apel', 'bloka=' + document.getElementById('bloka').value + '&blokb=' + document.getElementById('blokb').value + '&blokc=' + document.getElementById('blokc').value + '&blokd=' + document.getElementById('blokd').value + '&bloke=' + document.getElementById('bloke').value + '&blokf=' + document.getElementById('blokf').value + '&blokg=' + document.getElementById('blokg').value + '&blokh=' + document.getElementById('blokh').value + '&bloki=' + document.getElementById('bloki').value + '&blokj=' + document.getElementById('blokj').value + '&tanggal=' + app.getDatetime('-') + '&username=' + storage.get('username') + '&author=' + storage.get('nama'));
	app.redirect('/home');
}

function openCamera() {
	navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia || navigator.msGetUserMedia);
	navigator.getMedia({ audio: false,
		video: {	
			facingMode: 'environment' }
	}, function(stream) {
		let cameraPreview = document.getElementById("cameraPreview");
        cameraPreview.srcObject = stream;
	}, function() {
		app.redirect('/izin-kamera');
	});
	const config = {
		fps: 10,
		qrbox: {
			width: 300,
			height: 300
		}
	};
	var html5QrCode = new Html5Qrcode("reader");
	html5QrCode.start({
		facingMode: "environment"
	}, config, onScanSuccess);
}

function onScanSuccess(decodedText, decodedResult) {
	document.getElementById('reader').style.display = 'none';
	document.getElementById('bg-result').style.display = 'block';
	document.getElementById('blok').value = `${decodedText}`;
	var html5QrCode = new Html5Qrcode("reader");
	html5QrCode.stop();
	html5QrCode.clear();
}

function getLaporan() {
	return {
		dataSearch: storage.get('username'),
		dataLaporan: null,
		fetchLaporan() {
			fetch(API_URL + `/list-laporan/${this.dataSearch}`)
				.then((res) => res.json())
				.then((data) => {
					this.dataLaporan = data;
				});
		},
	};
}

function getLaporanKPLP() {
	return {
		dataLaporan: null,
		fetchLaporanKPLP() {
			fetch(API_URL + `/list-laporan-kplp`)
				.then((res) => res.json())
				.then((data) => {
					this.dataLaporan = data;
				});
		},
	};
}

function getLaporanapel() {
	return {
		dataApel: null,
		fetchLaporanapel() {
			fetch(API_URL + `/list-apel-kplp`)
				.then((res) => res.json())
				.then((data) => {
					this.dataApel = data;
				});
		},
	};
}

function checkapel() {
	if(document.getElementById('bloka').value == "" || document.getElementById('blokb').value == "" || document.getElementById('blokc').value == "" || document.getElementById('blokd').value == "" || document.getElementById('bloke').value == "" || document.getElementById('blokf').value == "" || document.getElementById('blokg').value == "" || document.getElementById('blokh').value == "" || document.getElementById('bloki').value == "" || document.getElementById('blokj').value == "") {
		document.getElementById('submitapel').disabled = true;
	}else{
		document.getElementById('submitapel').disabled = false;
	}
}

    const FPS = 30;
    
    let cameraStream = null;
    let processingStream = null;
    let mediaRecorder = null;
    let mediaChunks = null;
    let processingPreviewIntervalId = null;

    function processFrame() {
        let cameraPreview = document.getElementById("cameraPreview");
        
        processingPreview
            .getContext('2d')
            .drawImage(cameraPreview, 0, 0, 300,400);
    }
    
    function generateRecordingPreview() {
		let storage = new Storage();
		let app = new App();
        let mediaBlob = new Blob(mediaChunks, { type: "video/webm" });
        let mediaBlobUrl = URL.createObjectURL(mediaBlob);
		fetch(API_URL + '/upload/' + document.getElementById('blok').value + '/' + storage.get('username') + '/' + document.getElementById('tanggal').value, {method:"POST", body:mediaBlob})
		.then(response => console.log(response.text()));
        let recordingPreview = document.getElementById("recordingPreview");
        recordingPreview.src = mediaBlobUrl;
    }
        
    function startCapture() {
        const constraints = { audio: false,video: 
			{	
				facingMode: 'environment'
			}
		};
        navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
            cameraStream = stream;
            document.getElementById('stopvideo').style.display = "block";
			document.getElementById('startvideo').style.display = "none";
			document.getElementById('processvideo').style.display = "block";
			document.getElementById('previewvideo').style.display = "none";
			document.getElementById('cameraprev').style.display = "none";
            let processingPreview = document.getElementById("processingPreview");
            processingStream = processingPreview.captureStream(FPS);
            
            mediaRecorder = new MediaRecorder(processingStream);
            mediaChunks = []
            
            mediaRecorder.ondataavailable = function(event) {
                mediaChunks.push(event.data);
                if(mediaRecorder.state == "inactive") {
                    generateRecordingPreview();
                }
            };
            
            mediaRecorder.start();
            
            let cameraPreview = document.getElementById("cameraPreview");
            cameraPreview.srcObject = stream;
            processingPreviewIntervalId = setInterval(processFrame, 1000 / FPS);
        })
        .catch((err) => {
            alert("No media device found!");
        });
    };
    
    function stopCapture() {
		document.getElementById('stopvideo').style.display = "none";
		document.getElementById('startvideo').style.display = "none";
		document.getElementById('processvideo').style.display = "none";
		document.getElementById('previewvideo').style.display = "block";
		document.getElementById("submitlaporan").disabled = false;
        if(cameraStream != null) {
            cameraStream.getTracks().forEach(function(track) {
                track.stop();
            });
        }
        
        if(processingStream != null) {
            processingStream.getTracks().forEach(function(track) {
                track.stop();
            });
        }
        
        if(mediaRecorder != null) {
            if(mediaRecorder.state == "recording") {
                mediaRecorder.stop();
            }
        }
        
        if(processingPreviewIntervalId != null) {
            clearInterval(processingPreviewIntervalId);
            processingPreviewIntervalId = null;
        }
    };

ready(Mellow);