
class Level1 extends Level {
    constructor() {
        console.log("Creating Level1");
        super();
        this.setupLevel();
        this.levelState = 'intro'; // intro, exploration, explosion, transition
        this.explosionTimer = 0;
        this.fadeOpacity = 0;
        this.isFadingIn = true;
        this.companionMessageTimer = 0;
        this.hasCompanionSpoken = false;
        this.hasPlayerPickedUpMolot = false;
        this.explosionTriggered = false;
        this.keliaElement = null;
        this.introTimer = 0;
        this.introPhase = 0; // 0: black screen, 1: alarm sounds, 2: screen appears, 3: companion speaks
    }

    init() {
        console.log("Level1 init called");
        this.setupLevel();
    }

    setupLevel() {
        console.log("Setting up level...");
        // Загрузка фона - келья
        this.background = {
            image: new Image(),
            loaded: false
        };
        this.background.image.onload = () => {
            this.background.loaded = true;
            console.log("Келья успешно загружена");
            console.log("Размеры изображения кельи:", this.background.image.width, "x", this.background.image.height);
        };
        this.background.image.onerror = (error) => {
            console.error("Ошибка загрузки кельи:", error);
        };
        console.log("Начинаем загрузку кельи из:", this.background.image.src);
        // Создаем канвас для преобразования SVG в растровое изображение
        const svgCanvas = document.createElement('canvas');
        const svgCtx = svgCanvas.getContext('2d');
        const svgImage = new Image();
        
        svgImage.onload = () => {
            // Устанавливаем размеры канваса равными размерам SVG
            svgCanvas.width = svgImage.width || 800;
            svgCanvas.height = svgImage.height || 600;
            
            // Рисуем SVG на канвас
            svgCtx.drawImage(svgImage, 0, 0);
            
            // Преобразуем канвас в data URL и устанавливаем как источник изображения
            this.background.image.src = svgCanvas.toDataURL('image/png');
            
            console.log("SVG преобразован в PNG");
        };
        
        svgImage.onerror = (error) => {
            console.error("Ошибка загрузки SVG:", error);
            // Если SVG не загрузился, пробуем загрузить напрямую
            this.background.image.src = 'sprites/kelia.svg';
        };
        
        svgImage.src = 'sprites/kelia.svg';

        // Загрузка фона города
        this.cityBackground = {
            image: new Image(),
            loaded: false
        };
        this.cityBackground.image.onload = () => {
            this.cityBackground.loaded = true;
        };
        this.cityBackground.image.src = 'sprites/street.svg';

        // Загрузка изображения взрыва
        this.explosionImage = {
            image: new Image(),
            loaded: false
        };
        this.explosionImage.image.onload = () => {
            this.explosionImage.loaded = true;
        };
        this.explosionImage.image.src = 'sprites/ruin.svg';

        // Загрузка кораблей-призраков
        this.ghostShips = [];
        for (let i = 0; i < 3; i++) {
            const ship = {
                image: new Image(),
                loaded: false,
                x: Math.random() * gameCanvas.width * 2,
                y: 50 + Math.random() * 150,
                speed: 0.5 + Math.random() * 1.0,
                direction: Math.random() > 0.5 ? 1 : -1
            };
            ship.image.onload = () => {
                ship.loaded = true;
            };
            ship.image.src = 'sprites/ship.svg';
            this.ghostShips.push(ship);
        }

        // Установка границ уровня
        this.bounds = {
            left: 0,
            right: gameCanvas.width * 3,
            top: 0,
            bottom: gameCanvas.height * 2
        };

        // Создание персонажа и объектов
        this.createEntities();

        // Запускаем звуковые эффекты
        this.playIntroSounds();
    }

    createEntities() {
        // Создание персонажа
        const startX = this.bounds.right / 2 - 45;
        const groundY = this.bounds.bottom - 100;

        this.character = new Character(startX, groundY - 150, 90, 90);
        this.addEntity(this.character);

        // Создание молота на постаменте
        this.molot = new Molot(startX + 200, groundY - 30, 60, 60, this.character);
        this.molot.currentState = this.molot.states.PEDESTAL; // Новое состояние для молота на постаменте
        this.addEntity(this.molot);

        // Создание голограммы Щуки-Говоруки
        this.companion = {
            x: startX - 100,
            y: groundY - 150,
            width: 60,
            height: 60,
            image: new Image(),
            loaded: false,
            blinkTimer: 0,
            isBlinking: true
        };
        this.companion.image.onload = () => {
            this.companion.loaded = true;
        };
        this.companion.image.src = 'sprites/companion.svg';

        // Создание постамента для молота
        this.pedestal = {
            x: startX + 180,
            y: groundY - 30,
            width: 100,
            height: 30,
            color: '#8B4513'
        };
    }

    playIntroSounds() {
        // Запускаем тревожные звуки при старте уровня
        setTimeout(() => playAlarmSound(), 500);
        setTimeout(() => playStatic(), 1000);
        setTimeout(() => playExplosion(), 2000);

        // Запускаем фоновую мелодию после того, как игрок поднимет молот
        this.backgroundMusicStarted = false;

        // Переменные для периодических звуков после взрыва
        this.battleSoundsStarted = false;
        this.lastShotTime = 0;
        this.lastExplosionTime = 0;
    }

    playBattleSounds() {
        if (!this.battleSoundsStarted) {
            this.battleSoundsStarted = true;

            // Запускаем периодические звуки выстрелов и взрывов
            this.battleSoundInterval = setInterval(() => {
                const now = Date.now();

                // Периодические выстрелы
                if (now - this.lastShotTime > 2000 + Math.random() * 3000) {
                    playPulseWave(800 + Math.random() * 400, 0.1 + Math.random() * 0.1, 0.05);
                    this.lastShotTime = now;
                }

                // Периодические взрывы
                if (now - this.lastExplosionTime > 4000 + Math.random() * 4000) {
                    playExplosion();
                    this.lastExplosionTime = now;
                }
            }, 1000);
        }
    }

    update(deltaTime) {
        if (!this.updateStarted) {
            console.log("Level update started");
            this.updateStarted = true;
        }
        super.update(deltaTime);

        // Обновление состояния уровня
        this.updateLevelState(deltaTime);

        // Обновление компаньона
        if (this.companion) {
            this.companion.blinkTimer += deltaTime;
            if (this.companion.blinkTimer > 500) {
                this.companion.isBlinking = !this.companion.isBlinking;
                this.companion.blinkTimer = 0;
            }
        }

        // Обновление кораблей-призраков
        if (this.ghostShips && (this.levelState === 'explosion' || this.levelState === 'transition')) {
            this.ghostShips.forEach(ship => {
                // Двигаем корабли
                ship.x += ship.speed * ship.direction;

                // Если корабли выходят за границы экрана, разворачиваем их
                if (ship.x > this.bounds.right || ship.x < -100) {
                    ship.direction *= -1;
                }

                // Добавляем небольшое колебание по вертикали
                ship.y += Math.sin(Date.now() * 0.001 + ship.x) * 0.2;
            });
        }

        // Проверка, подобрал ли игрок молот
        if (!this.hasPlayerPickedUpMolot && this.character && this.molot) {
            if (this.character.checkCollision(this.molot)) {
                this.hasPlayerPickedUpMolot = true;
                this.molot.currentState = this.molot.states.HELD;

                // Запускаем фоновую музыку
                if (!this.backgroundMusicStarted) {
                    playBackgroundMelody();
                    this.backgroundMusicStarted = true;
                }
            }
        }

        // Проверка, коснулся ли игрок трещины после взрыва
        if (this.levelState === 'explosion' && this.character) {
            const crackX = this.bounds.right / 2 + 200;
            const crackY = this.bounds.bottom - 100;
            const crackWidth = 150;
            const crackHeight = 200;

            if (this.character.x + this.character.width > crackX &&
                this.character.x < crackX + crackWidth &&
                this.character.y + this.character.height > crackY) {
                this.levelState = 'transition';
                this.isFadingIn = false;
            }
        }
    }

    updateLevelState(deltaTime) {
        // Начальная заставка
        if (this.levelState === 'intro') {
            this.introTimer += deltaTime;
            
            // Фаза 0: черный экран
            if (this.introPhase === 0 && this.introTimer > 500) {
                this.introPhase = 1;
                // Запускаем тревожный гудок
                playAlarmSound();
            }
            
            // Фаза 1: тревожные звуки
            if (this.introPhase === 1 && this.introTimer > 1500) {
                this.introPhase = 2;
                // Запускаем треск статики
                playStatic();
            }
            
            // Фаза 2: треск статики
            if (this.introPhase === 2 && this.introTimer > 2500) {
                this.introPhase = 3;
                // Запускаем далекие взрывы
                playExplosion();
                // Начинаем проявление изображения
                this.isFadingIn = true;
            }
            
            // Фаза 3: проявление изображения
            if (this.introPhase === 3 && this.isFadingIn) {
                this.fadeOpacity = Math.min(1, this.fadeOpacity + deltaTime * 0.001);
                if (this.fadeOpacity >= 1) {
                    this.levelState = 'exploration';
                    this.companionMessageTimer = 0;
                }
            }
        }
        
        // Проявление изображения в начале (старый код, оставлен для совместимости)
        if (this.levelState === 'exploration' && this.isFadingIn) {
            this.fadeOpacity = Math.min(1, this.fadeOpacity + deltaTime * 0.001);
            if (this.fadeOpacity >= 1) {
                this.isFadingIn = false;
            }
        }

        // Сообщение от компаньона
        if (this.levelState === 'exploration' && !this.hasCompanionSpoken) {
            this.companionMessageTimer += deltaTime;
            if (this.companionMessageTimer > 2000) {
                this.hasCompanionSpoken = true;
                this.companionMessage = "Витязь! Пробуждайся! Защитные купола трескаются! Чаромута прорывается в нижние уровни!";
            }
        }

        // Взрыв стены
        if (this.levelState === 'exploration' && this.hasPlayerPickedUpMolot && !this.explosionTriggered) {
            this.explosionTimer += deltaTime;
            if (this.explosionTimer > 3000) {
                this.levelState = 'explosion';
                this.explosionTriggered = true;
                playExplosion();
                // Запускаем звуки битвы
                this.playBattleSounds();
                
                // Добавляем эффект тряски камеры
                this.cameraShake = {
                    intensity: 20,
                    duration: 1000,
                    startTime: Date.now()
                };
            }
        }
        
        // Обновление эффекта тряски камеры
        if (this.cameraShake) {
            const elapsed = Date.now() - this.cameraShake.startTime;
            if (elapsed < this.cameraShake.duration) {
                const progress = elapsed / this.cameraShake.duration;
                const intensity = this.cameraShake.intensity * (1 - progress);
                this.camera.x += (Math.random() - 0.5) * intensity;
                this.camera.y += (Math.random() - 0.5) * intensity;
            } else {
                this.cameraShake = null;
            }
        }

        // Затемнение при переходе
        if (this.levelState === 'transition' && !this.isFadingIn) {
            this.fadeOpacity = Math.max(0, this.fadeOpacity - deltaTime * 0.002);
            if (this.fadeOpacity <= 0) {
                // Останавливаем звуки битвы при переходе
                if (this.battleSoundInterval) {
                    clearInterval(this.battleSoundInterval);
                    this.battleSoundInterval = null;
                    this.battleSoundsStarted = false;
                }
                // Здесь можно добавить переход к следующей части уровня
            }
        }
    }

    draw(ctx) {
        console.log("Drawing level, state:", this.levelState, "intro phase:", this.introPhase);
        
        // Начальная заставка - черный экран
        if (this.levelState === 'intro' && this.introPhase < 3) {
            // Полностью черный экран
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        } else {
            // Келья уже встроена в HTML, просто убеждаемся, что она отображается
            this.keliaElement = keliaContainer;
            console.log("Используем встроенную келью из HTML");
            
            // Рисуем фон
        if (this.levelState === 'explosion' || this.levelState === 'transition') {
            console.log("Drawing explosion/transition background");
            // Скрываем келью при взрыве
            if (this.keliaElement) {
                this.keliaElement.style.display = 'none';
            }
            
            if (this.cityBackground.loaded) {
                ctx.drawImage(this.cityBackground, 0, 0, this.bounds.right, this.bounds.bottom);
            }

            // Рисуем корабли-призраки
            if (this.ghostShips) {
                this.ghostShips.forEach(ship => {
                    if (ship.loaded) {
                        ctx.save();
                        
                        // Эффект прозрачности и мерцания
                        ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.002 + ship.x) * 0.2;
                        
                        // Эффект тени
                        ctx.shadowColor = 'rgba(138, 0, 0, 0.8)';
                        ctx.shadowBlur = 10;
                        
                        if (ship.direction === -1) {
                            // Отражаем корабль, если он движется влево
                            ctx.translate(ship.x + 100, 0);
                            ctx.scale(-1, 1);
                            ctx.translate(-100, 0);
                            ctx.drawImage(ship.image, 0, ship.y, 100, 50);
                        } else {
                            ctx.drawImage(ship.image, ship.x, ship.y, 100, 50);
                        }
                        
                        // Эффект следования за кораблем
                        ctx.globalAlpha = 0.2;
                        ctx.shadowBlur = 20;
                        
                        for (let i = 1; i <= 3; i++) {
                            const trailX = ship.direction === -1 ? ship.x + 100 + i * 20 : ship.x - i * 20;
                            
                            if (ship.direction === -1) {
                                ctx.save();
                                ctx.translate(trailX, 0);
                                ctx.scale(-1, 1);
                                ctx.translate(-100, 0);
                                ctx.drawImage(ship.image, 0, ship.y, 100, 50);
                                ctx.restore();
                            } else {
                                ctx.drawImage(ship.image, trailX, ship.y, 100, 50);
                            }
                        }
                        
                        ctx.restore();
                    }
                });
            }

            // Рисуем взрыв
            if (this.explosionImage.loaded) {
                const explosionX = this.bounds.right / 2 + 100;
                const explosionY = this.bounds.bottom - 200;
                
                // Основной взрыв
                ctx.save();
                ctx.globalAlpha = 0.9;
                ctx.drawImage(this.explosionImage, explosionX, explosionY, 300, 300);
                ctx.restore();
                
                // Эффект волны от взрыва
                const elapsed = Date.now() - this.explosionStartTime || 0;
                const waveRadius = Math.min(300, elapsed * 0.1);
                const waveOpacity = Math.max(0, 1 - elapsed * 0.001);
                
                ctx.save();
                ctx.globalAlpha = waveOpacity * 0.3;
                ctx.strokeStyle = 'rgba(255, 100, 0, 0.8)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(explosionX + 150, explosionY + 150, waveRadius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
                
                // Частицы от взрыва
                if (!this.explosionParticles) {
                    this.explosionParticles = [];
                    for (let i = 0; i < 30; i++) {
                        this.explosionParticles.push({
                            x: explosionX + 150,
                            y: explosionY + 150,
                            vx: (Math.random() - 0.5) * 10,
                            vy: (Math.random() - 0.5) * 10,
                            size: Math.random() * 5 + 2,
                            color: Math.random() > 0.5 ? 'rgba(255, 100, 0, 0.8)' : 'rgba(255, 200, 0, 0.8)',
                            life: 1
                        });
                    }
                    this.explosionStartTime = Date.now();
                }
                
                // Обновляем и рисуем частицы
                this.explosionParticles = this.explosionParticles.filter(particle => {
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    particle.vy += 0.2; // Гравитация
                    particle.life -= 0.02;
                    
                    if (particle.life > 0) {
                        ctx.save();
                        ctx.globalAlpha = particle.life;
                        ctx.fillStyle = particle.color;
                        ctx.beginPath();
                        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                        return true;
                    }
                    return false;
                });
            }
        } else {
            console.log("Попытка нарисовать келью. Загружена:", this.background.loaded);
            if (this.background.loaded) {
                console.log("Drawing kelia background");
                ctx.drawImage(this.background.image, 0, 0, this.bounds.right, this.bounds.bottom);
            } else {
                console.log("Келья еще не загружена");
            }
        }

        // Рисуем постамент
        if (this.pedestal && this.molot.currentState === this.molot.states.PEDESTAL) {
            console.log("Drawing pedestal");
            ctx.fillStyle = this.pedestal.color;
            ctx.fillRect(this.pedestal.x, this.pedestal.y, this.pedestal.width, this.pedestal.height);
        }

        // Рисуем компаньона
        if (this.companion && this.companion.loaded) {
            console.log("Drawing companion");
            ctx.save();
            if (this.companion.isBlinking) {
                ctx.globalAlpha = 0.7 + Math.sin(Date.now() * 0.005) * 0.3;
            }
            ctx.drawImage(this.companion.image, this.companion.x, this.companion.y, this.companion.width, this.companion.height);
            ctx.restore();
        }

        // Рисуем остальные объекты
        super.draw(ctx);

        // Затемнение/проявление
        if (this.fadeOpacity < 1) {
            console.log("Drawing fade effect, opacity:", this.fadeOpacity);
            ctx.fillStyle = `rgba(0, 0, 0, ${1 - this.fadeOpacity})`;
            ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        }

        // Отображение сообщений
        if (this.hasCompanionSpoken && this.levelState === 'exploration') {
            console.log("Drawing companion message");
            // Фон для сообщения
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(gameCanvas.width / 2 - 250, 50, 500, 100);
            
            // Граница для сообщения
            ctx.strokeStyle = '#D4AF37';
            ctx.lineWidth = 2;
            ctx.strokeRect(gameCanvas.width / 2 - 250, 50, 500, 100);
            
            // Имя говорящего
            ctx.fillStyle = '#D4AF37';
            ctx.font = '20px Kramola';
            ctx.textAlign = 'center';
            ctx.fillText('ЩУКА-ГОВОРУКА:', gameCanvas.width / 2, 80);
            
            // Текст сообщения с эффектом помех
            ctx.fillStyle = '#E0E0E0';
            ctx.font = '16px SHRIFT';
            
            // Эффект помех
            const glitchText = this.companionMessage.split('').map((char, i) => {
                if (Math.random() < 0.05) {
                    return String.fromCharCode(33 + Math.floor(Math.random() * 94));
                }
                return char;
            }).join('');
            
            // Разбиваем текст на строки
            const lines = this.wrapText(glitchText, 460);
            lines.forEach((line, index) => {
                ctx.fillText(line, gameCanvas.width / 2, 110 + index * 25);
            });
        }

        // Инструкция для игрока
        if (!this.hasPlayerPickedUpMolot) {
            console.log("Drawing instruction");
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(gameCanvas.width / 2 - 150, gameCanvas.height - 100, 300, 60);
            ctx.fillStyle = '#E0E0E0';
            ctx.font = '16px SHRIFT';
            ctx.textAlign = 'center';
            ctx.fillText('Подойди к молоту, чтобы поднять его', gameCanvas.width / 2, gameCanvas.height - 70);
            ctx.fillText('Используй мышь или касание для управления', gameCanvas.width / 2, gameCanvas.height - 45);
        }
    }

    updateCamera() {
        const character = this.entities.find(e => e instanceof Character);
        if (character) {
            this.camera.x = character.x + character.width / 2 - this.camera.width / 2;
            this.camera.y = character.y + character.height / 2 - this.camera.height / 2;

            // Ограничение камеры границами уровня
            this.camera.x = Math.max(0, Math.min(this.bounds.right - this.camera.width, this.camera.x));
            this.camera.y = Math.max(0, Math.min(this.bounds.bottom - this.camera.height, this.camera.y));
        }
    }
    
    // Метод для разбивки текста на строки
    wrapText(text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (let i = 0; i < words.length; i++) {
            const testLine = currentLine + (currentLine ? ' ' : '') + words[i];
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = words[i];
            } else {
                currentLine = testLine;
            }
        }
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines;
    }
}
