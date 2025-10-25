class Molot extends Entity {
    constructor(x, y, width, height, character) {
        super(x, y, width, height, 'sprites/molot.svg');
        this.character = character;
        this.held = true;
        this.thrown = false;
        this.returning = false;
        this.returningToCharacter = false;
        this.targetX = x;
        this.targetY = y;
        this.speed = 6;
        this.offsetX = 40;
        this.offsetY = 10;
        this.rotation = 0;
    }

    update() {
        if (this.held) {
            this.x = this.character.x + this.offsetX;
            this.y = this.character.y + this.offsetY;
            this.rotation = 0;
        }

        if (this.returning) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < this.speed) {
                this.x = this.targetX;
                this.y = this.targetY;
                this.returning = false;
                this.returningToCharacter = true;
                this.targetX = this.character.x + this.offsetX;
                this.targetY = this.character.y + this.offsetY;
            } else {
                this.x += (dx / distance) * this.speed;
                this.y += (dy / distance) * this.speed;
                this.rotation += 0.1;
            }
        }

        if (this.returningToCharacter) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < this.speed) {
                this.x = this.targetX;
                this.y = this.targetY;
                this.returningToCharacter = false;
                this.held = true;
                this.rotation = 0;
            } else {
                this.x += (dx / distance) * this.speed;
                this.y += (dy / distance) * this.speed;
                this.rotation += 0.1;
            }
        }
    }

    draw(ctx) {
        if (this.held || this.returning || this.returningToCharacter) {
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(this.rotation);
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        }
    }

    throw(targetX, targetY) {
        if (this.held) {
            this.held = false;
            this.returning = true;
            this.targetX = targetX - this.width / 2;
            this.targetY = targetY - this.height / 2;
        }
    }
}
