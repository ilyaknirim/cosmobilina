class Level {
    constructor() {
        console.log("Creating base Level");
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
        console.log("Base Level init called");
        // Переопределяется в подклассах
    }

    update(deltaTime) {
        console.log("Base Level update called");
        this.entities.forEach(entity => entity.update(deltaTime));
        this.updateCamera();
    }

    draw(ctx) {
        console.log("Base Level draw called");
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
