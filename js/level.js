class Level {
    constructor() {
        this.entities = [];
        this.camera = {
            x: 0,
            y: 0,
            width: gameCanvas.width,
            height: gameCanvas.height
        };
        this.bounds = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        };
    }

    init() {
        // Переопределяется в подклассах
    }

    update(deltaTime) {
        this.entities.forEach(entity => entity.update(deltaTime));
        this.updateCamera();
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);
        this.entities.forEach(entity => entity.draw(ctx));
        ctx.restore();
    }

    updateCamera() {
        // Базовая логика следования камеры
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
        }
    }
}
