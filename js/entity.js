class Entity {
    constructor(x, y, width, height, imageSrc) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = new Image();
        this.image.src = imageSrc;
        this.loaded = false;
        this.image.onload = () => {
            this.loaded = true;
        };
    }

    draw(ctx) {
        if (this.loaded) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }

    update() {
        // Базовый update, переопределяется в подклассах
    }
}
