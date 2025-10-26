class Entity {
    constructor(x, y, width, height, imageSrc) {
        console.log("Creating entity with image:", imageSrc);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocity = { x: 0, y: 0 };
        this.image = new Image();
        this.image.src = imageSrc;
        this.loaded = false;
        this.image.onload = () => { 
            console.log("Entity image loaded:", imageSrc);
            this.loaded = true; 
        };
    }

    update(deltaTime) {
        // Базовая физика
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
    }

    draw(ctx) {
        if (this.sprites && this.currentSprite) {
            // Если у объекта есть спрайты, используем текущий спрайт
            const sprite = this.sprites[this.currentSprite];
            if (sprite && sprite.loaded) {
                ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
            } else if (this.image) {
                ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            }
        } else if (this.image && this.image.loaded) {
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
