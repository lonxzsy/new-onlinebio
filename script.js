document.addEventListener('DOMContentLoaded', function() {
    // --- Музыкальный плеер ---
    const audioPlayer = document.getElementById('audio-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const songTitle = document.getElementById('song-title');
    const songArtist = document.getElementById('song-artist');
    const albumArt = document.getElementById('album-art');
    const playIcon = playPauseBtn.querySelector('.icon-play');
    const pauseIcon = playPauseBtn.querySelector('.icon-pause');

    // ВАЖНО: Замените пути на свои файлы музыки и обложек
    const playlist = [
        {
            title: "in the pool",
            artist: "kensuke ushio",
            src: "music1.mp3", // Правильный путь к файлу в папке music
            art: "music1.jpg" // Правильный путь к обложке в папке images
        },
        {
            title: "the city mouse and the country mouse",
            artist: "kensuke ushio",
            src: "music2.mp3",
            art: "music1.jpg"
        }
        // Можешь добавить сюда другие треки по такому же образцу
        // { title: "Название", artist: "Исполнитель", src: "music/файл.mp3", art: "images/обложка.jpg" }
    ];

    let currentTrackIndex = 0;
    let isPlaying = false;

    function loadTrack(trackIndex) {
        // Плавное исчезновение информации о треке перед сменой
        songTitle.style.opacity = 0;
        songArtist.style.opacity = 0;
        albumArt.style.opacity = 0;

        setTimeout(() => {
            const track = playlist[trackIndex];
            songTitle.textContent = track.title;
            songArtist.textContent = track.artist;
            audioPlayer.src = track.src;
            albumArt.src = track.art;

            // Плавное появление новой информации
            songTitle.style.opacity = 1;
            songArtist.style.opacity = 1;
            albumArt.style.opacity = 1;
        }, 400); // Задержка совпадает с transition в CSS
    }

    function playTrack() {
        isPlaying = true;
        audioPlayer.play();
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'inline-block';
    }

    function pauseTrack() {
        isPlaying = false;
        audioPlayer.pause();
        playIcon.style.display = 'inline-block';
        pauseIcon.style.display = 'none';
    }

    playPauseBtn.addEventListener('click', () => {
        isPlaying ? pauseTrack() : playTrack();
    });

    function nextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(currentTrackIndex);
        playTrack(); // Сразу включаем следующий трек
    }

    function prevTrack() {
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrackIndex);
        playTrack(); // Сразу включаем предыдущий трек
    }

    nextBtn.addEventListener('click', nextTrack);
    prevBtn.addEventListener('click', prevTrack);

    // Автоматически переключать на следующий трек, когда текущий закончился
    audioPlayer.addEventListener('ended', nextTrack);


    // --- Логика для цитат ---
    const quoteElement = document.getElementById('quote');
    const quotes = [
        "「ダンジ、私も学校に行ったことないよ。」",
        "「一緒に村に来てほしい…村へ。静かに暮らしたいんだ、そんな風に。ご飯を作ってあげるし、読み書きも教えるよ。」",
        "「明日は…一緒に逃げよう。」",
        "「あなたはどちらですか？都会のネズミですか、それとも田舎のネズミですか？」"
    ];

    let currentQuoteIndex = 0;

    function changeQuote() {
        // 1. Делаем цитату невидимой
        quoteElement.style.opacity = 0;

        // 2. Ждем, пока закончится анимация исчезновения (1.5 секунды)
        setTimeout(() => {
            // 3. Меняем текст цитаты
            currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
            quoteElement.textContent = quotes[currentQuoteIndex];
            
            // 4. Делаем новую цитату видимой
            quoteElement.style.opacity = 1;
        }, 1500); // Это время должно совпадать с transition в CSS
    }

    // --- Инициализация при загрузке ---
    function init() {
        // Загружаем первый трек
        loadTrack(currentTrackIndex);

        // Показываем первую цитату
        quoteElement.textContent = quotes[currentQuoteIndex];
        setTimeout(() => {
            quoteElement.style.opacity = 1;
        }, 100);

        // Запускаем смену цитат
        setInterval(changeQuote, 8000);
    }

    // --- Логика для анимации частиц ---
    function initParticles() {
        const canvas = document.getElementById('particles-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particlesArray;

        // Класс для отдельной частицы
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = Math.random() * 0.4 - 0.2; // Медленная скорость по X
                this.speedY = Math.random() * 0.4 - 0.2; // Медленная скорость по Y
                this.color = 'rgba(255, 255, 255, 0.3)'; // Сделали частицы более прозрачными
            }
            update() {
                if (this.x > canvas.width || this.x < 0) { this.speedX = -this.speedX; }
                if (this.y > canvas.height || this.y < 0) { this.speedY = -this.speedY; }
                this.x += this.speedX;
                this.y += this.speedY;
            }
            draw() {
                // Добавляем эффект свечения
                ctx.shadowColor = 'white';
                ctx.shadowBlur = 10;

                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
        }

        function createParticles() {
            particlesArray = [];
            const numberOfParticles = (canvas.height * canvas.width) / 9000;
            for (let i = 0; i < numberOfParticles; i++) {
                particlesArray.push(new Particle());
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Важно: сбрасываем свечение перед отрисовкой нового кадра, чтобы оно не накапливалось
            ctx.shadowBlur = 0;

            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();
            }
            requestAnimationFrame(animateParticles);
        }

        createParticles();
        animateParticles();

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            createParticles();
        });
    }

    // --- Логика для статуса Telegram ---
    function updateStatusIndicator(status) {
        const indicator = document.getElementById('status-indicator');
        if (status === 'online') {
            indicator.classList.remove('status-offline');
            indicator.classList.add('status-online');
            indicator.title = "В сети";
        } else {
            indicator.classList.remove('status-online');
            indicator.classList.add('status-offline');
            indicator.title = "Не в сети";
        }
    }

    function connectWebSocket() {
        // Используем 'ws://' для WebSocket. Замени на 'wss://' для защищенного соединения (https), когда будешь размещать на хостинге
        const ws = new WebSocket('ws://127.0.0.1:5000/ws');

        ws.onmessage = function(event) {
            const data = JSON.parse(event.data);
            console.log('Получен новый статус:', data.status);
            updateStatusIndicator(data.status);
        };

        ws.onclose = function(e) {
            console.log('WebSocket соединение закрыто. Попытка переподключения через 5 секунд.', e.reason);
            updateStatusIndicator('offline'); // Устанавливаем статус оффлайн при потере соединения
            setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = function(err) {
            console.error('Ошибка WebSocket. Закрытие сокета.', err);
            ws.close();
        };
    }

    init();
    // Запускаем WebSocket соединение
    connectWebSocket();
    // Запускаем анимацию частиц
    initParticles();
});
