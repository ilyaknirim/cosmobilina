
class Level1 extends Level {
    constructor() {
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
    }

    setupLevel() {
        // Загрузка фона - келья
        this.background = {
            image: new Image(),
            loaded: false
        };
        this.background.image.onload = () => {
            this.background.loaded = true;
        };
        this.background.image.src = 'sprites/kelia.svg';

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

        this.character = new Character(startX, groundY - 90, 90, 90);
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
        // Проявление изображения в начале
        if (this.levelState === 'intro' && this.isFadingIn) {
            this.fadeOpacity = Math.min(1, this.fadeOpacity + deltaTime * 0.001);
            if (this.fadeOpacity >= 1) {
                this.levelState = 'exploration';
            }
        }

        // Сообщение от компаньона
        if (this.levelState === 'exploration' && !this.hasCompanionSpoken) {
            this.companionMessageTimer += deltaTime;
            if (this.companionMessageTimer > 2000) {
                this.hasCompanionSpoken = true;
                // Здесь можно добавить отображение сообщения от Щуки-Говоруки
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
        // Рисуем фон
        if (this.levelState === 'explosion' || this.levelState === 'transition') {
            if (this.cityBackground.loaded) {
                ctx.drawImage(this.cityBackground, 0, 0, this.bounds.right, this.bounds.bottom);
            }

            // Рисуем корабли-призраки
            if (this.ghostShips) {
                this.ghostShips.forEach(ship => {
                    if (ship.loaded) {
                        ctx.save();
                        ctx.globalAlpha = 0.7;
                        if (ship.direction === -1) {
                            // Отражаем корабль, если он движется влево
                            ctx.translate(ship.x + 100, 0);
                            ctx.scale(-1, 1);
                            ctx.translate(-100, 0);
                            ctx.drawImage(ship.image, 0, ship.y, 100, 50);
                        } else {
                            ctx.drawImage(ship.image, ship.x, ship.y, 100, 50);
                        }
                        ctx.restore();
                    }
                });
            }

            // Рисуем взрыв
            if (this.explosionImage.loaded) {
                const explosionX = this.bounds.right / 2 + 100;
                const explosionY = this.bounds.bottom - 200;
                ctx.drawImage(this.explosionImage, explosionX, explosionY, 300, 300);
            }
        } else {
            if (this.background.loaded) {
                ctx.drawImage(this.background, 0, 0, this.bounds.right, this.bounds.bottom);
            }
        }

        // Рисуем постамент
        if (this.pedestal && this.molot.currentState === this.molot.states.PEDESTAL) {
            ctx.fillStyle = this.pedestal.color;
            ctx.fillRect(this.pedestal.x, this.pedestal.y, this.pedestal.width, this.pedestal.height);
        }

        // Рисуем компаньона
        if (this.companion && this.companion.loaded) {
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
            ctx.fillStyle = `rgba(0, 0, 0, ${1 - this.fadeOpacity})`;
            ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        }

        // Отображение сообщений
        if (this.hasCompanionSpoken && this.levelState === 'exploration') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(gameCanvas.width / 2 - 200, 50, 400, 80);
            ctx.fillStyle = '#D4AF37';
            ctx.font = '18px SHRIFT';
            ctx.textAlign = 'center';
            ctx.fillText('ЩУКА-ГООВОРУКА:', gameCanvas.width / 2, 80);
            ctx.fillStyle = '#E0E0E0';
            ctx.font = '16px SHRIFT';
            ctx.fillText('Витязь! Защитные купола трескаются!', gameCanvas.width / 2, 105);
            ctx.fillText('Чаромута прорывается в нижние уровни!', gameCanvas.width / 2, 120);
        }

        // Инструкция для игрока
        if (!this.hasPlayerPickedUpMolot) {
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
}
