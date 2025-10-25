class Entity {
    constructor(x, y, width, height, imageSrc) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocity = { x: 0, y: 0 };
        this.image = new Image();
        this.image.src = imageSrc;
        this.loaded = false;
        this.image.onload = () => { this.loaded = true; };
    }

    update(deltaTime) {
        // Базовая физика
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
    }

    draw(ctx) {
        if (this.loaded) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }

    checkCollision(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
}
