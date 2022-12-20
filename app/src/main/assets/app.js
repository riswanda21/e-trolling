var app = new App();
var http = new Http();
var storage = new Storage();
var API_URL = '';

if (storage.get('nama') == null) {
    route('/', 'login.mellow');
} else {
    if (storage.get('type') == 'kplp' || storage.get('type') == 'kalapas') {
        route('/', 'kplp.mellow');
    } else {
        route('/', 'home.mellow');
    }
}

if (storage.get('type') == 'kplp' || storage.get('type') == 'kalapas') {
    route('/home', 'kplp.mellow');
} else {
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
    var app = new App();
    var storage = new Storage();

    app.setTitle('SITILING');
    if (app.route == '/lapor') {
        openCamera();
        app.element('#tanggal').value = app.getDatetime('-');
    }
    return {
        nama: storage.get('nama'),
        jabatan: storage.get('jabatan'),
        currentDate: app.getDatetime('-'),
        menu_home: [{
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
        menu_kplp: [{
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
    fetch(API_URL + '/login/' + app.element('#username').value)
        .then((res) => res.json())
        .then((data) => {
            if (data.username == app.element('#username').value && data.password == app.element('#password').value) {
                storage.add('nama', data.name);
                storage.add('username', data.username);
                storage.add('jabatan', data.jabatan);
                storage.add('type', data.type);
                if (storage.get('type') == 'kplp' || storage.get('type') == 'kalapas') {
                    app.redirect('/kplp');
                } else {
                    app.redirect('/home');
                }
            } else {
                app.element('#incorrect').style.display = 'block';
            }
        });
}

function logout() {
    storage.clear();
    app.redirect('/login');
}

function buatLaporan() {
    http.post(API_URL + '/lapor', 'blok=' + app.element('#blok').value + '&tanggal=' + app.element('#tanggal').value + '&username=' + storage.get('username') + '&keterangan=' + app.element('#keterangan').value + '&author=' + storage.get('nama'));
    app.redirect('/home');
}

function laporapel() {
    http.post(API_URL + '/apel', 'bloka=' + app.element('#bloka').value + '&blokb=' + app.element('#blokb').value + '&blokc=' + app.element('#blokc').value + '&blokd=' + app.element('#blokd').value + '&bloke=' + app.element('#bloke').value + '&blokf=' + app.element('#blokf').value + '&blokg=' + app.element('#blokg').value + '&blokh=' + app.element('#blokh').value + '&bloki=' + app.element('#bloki').value + '&blokj=' + app.element('#blokj').value + '&tanggal=' + app.getDatetime('-') + '&username=' + storage.get('username') + '&author=' + storage.get('nama'));
    app.redirect('/home');
}

function openCamera() {
    navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia);
    navigator.getMedia({
        audio: false,
        video: {
            facingMode: 'environment'
        }
    }, function(stream) {
        let cameraPreview = app.element("#cameraPreview");
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
    app.element('#reader').style.display = 'none';
    app.element('#bg-result').style.display = 'block';
    app.element('#blok').value = `${decodedText}`;
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
    if (app.element('#bloka').value == "" || app.element('#blokb').value == "" || app.element('#blokc').value == "" || app.element('#blokd').value == "" || app.element('#bloke').value == "" || app.element('#blokf').value == "" || app.element('#blokg').value == "" || app.element('#blokh').value == "" || app.element('#bloki').value == "" || app.element('#blokj').value == "") {
        app.element('#submitapel').disabled = true;
    } else {
        app.element('#submitapel').disabled = false;
    }
}

function getJadwal() {
    return {
        dataJadwal: null,
        fetchJadwal() {
            fetch(API_URL + `/jadwal`)
                .then((res) => res.json())
                .then((data) => {
                    this.dataJadwal = data;
                });
        },
    };
}

const FPS = 30;

let cameraStream = null;
let processingStream = null;
let mediaRecorder = null;
let mediaChunks = null;
let processingPreviewIntervalId = null;

function processFrame() {
    let cameraPreview = app.element("#cameraPreview");

    processingPreview
        .getContext('2d')
        .drawImage(cameraPreview, 0, 0, 300, 400);
}

function generateRecordingPreview() {
    let storage = new Storage();
    let app = new App();
    let mediaBlob = new Blob(mediaChunks, {
        type: "video/webm"
    });
    let mediaBlobUrl = URL.createObjectURL(mediaBlob);
    fetch(API_URL + '/upload/' + app.element('#blok').value + '/' + storage.get('username') + '/' + app.element('#tanggal').value, {
            method: "POST",
            body: mediaBlob
        })
        .then(response => console.log(response.text()));
    let recordingPreview = app.element("#recordingPreview");
    recordingPreview.src = mediaBlobUrl;
}

function startCapture() {
    const constraints = {
        audio: false,
        video: {
            facingMode: 'environment'
        }
    };
    navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
            cameraStream = stream;
            app.element('#stopvideo').style.display = "block";
            app.element('#startvideo').style.display = "none";
            app.element('#processvideo').style.display = "block";
            app.element('#previewvideo').style.display = "none";
            app.element('#cameraprev').style.display = "none";
            let processingPreview = app.element("#processingPreview");
            processingStream = processingPreview.captureStream(FPS);

            mediaRecorder = new MediaRecorder(processingStream);
            mediaChunks = []

            mediaRecorder.ondataavailable = function(event) {
                mediaChunks.push(event.data);
                if (mediaRecorder.state == "inactive") {
                    generateRecordingPreview();
                }
            };

            mediaRecorder.start();

            let cameraPreview = app.element("#cameraPreview");
            cameraPreview.srcObject = stream;
            processingPreviewIntervalId = setInterval(processFrame, 1000 / FPS);
        })
        .catch((err) => {
            alert("No media device found!");
        });
};

function stopCapture() {
    app.element('#stopvideo').style.display = "none";
    app.element('#startvideo').style.display = "none";
    app.element('#processvideo').style.display = "none";
    app.element('#previewvideo').style.display = "block";
    app.element("#submitlaporan").disabled = false;
    if (cameraStream != null) {
        cameraStream.getTracks().forEach(function(track) {
            track.stop();
        });
    }

    if (processingStream != null) {
        processingStream.getTracks().forEach(function(track) {
            track.stop();
        });
    }

    if (mediaRecorder != null) {
        if (mediaRecorder.state == "recording") {
            mediaRecorder.stop();
        }
    }

    if (processingPreviewIntervalId != null) {
        clearInterval(processingPreviewIntervalId);
        processingPreviewIntervalId = null;
    }
};

ready(Mellow);