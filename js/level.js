class Level {
    constructor() {
        this.state = 'black_screen';
        this.timer = 0;
        this.cameraX = 0;
        this.cameraY = 0;
    }

    init() {
        // Переопределяется в подклассах
    }

    update() {
        // Переопределяется в подклассах
    }

    draw(ctx) {
        // Переопределяется в подклассах
    }
}
