class Level1 extends Level {
    constructor() {
        super();
        this.setupLevel();
    }

    setupLevel() {
        // Загрузка фона
        this.background = {
            image: new Image(),
            loaded: false
        };
        this.background.image.onload = () => {
            this.background.loaded = true;
        };
        this.background.image.src = 'sprites/kelia.svg';

        // Установка границ уровня
        this.bounds = {
            left: 0,
            right: gameCanvas.width * 2.5,
            top: 0,
            bottom: gameCanvas.height * 2.5
        };

        // Создание персонажа и молота
        this.createEntities();
    }

    createEntities() {
        const startX = this.bounds.right / 2 - 45;
        const groundY = this.bounds.bottom - 45;
        
        const character = new Character(startX, groundY - 90, 90, 90);
        const molot = new Molot(startX + 300, groundY - 30, 30, 30, character);
        
        this.addEntity(character);
        this.addEntity(molot);
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
