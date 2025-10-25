class Level1 extends Level {
    constructor() {
        super();
        this.backgroundImage = null;
        this.scaledWidth = 0;
        this.scaledHeight = 0;
        this.centerX = 0;
        this.centerY = 0;
        this.imageLoaded = false;
        this.fadeAlpha = 0;
    }

    init() {
        this.state = 'black_screen';
        this.timer = 0;

        // Load background image
        this.backgroundImage = new Image();
        this.backgroundImage.onload = () => {
            this.imageLoaded = true;
        };
        this.backgroundImage.src = 'sprites/kelia.svg';

        // Calculate kelya scaling (2.5x larger)
        this.scaledWidth = gameCanvas.width * 2.5;
        this.scaledHeight = gameCanvas.width * (9 / 4) * 2.5;
        this.centerX = gameCanvas.width / 2 - this.scaledWidth / 2;
        this.centerY = gameCanvas.height / 2 - this.scaledHeight / 2;

        // Position character on the ground after jump (feet on ground)
        const startX = this.centerX + this.scaledWidth / 2 - 45; // Center of kelya horizontally
        const groundY = this.centerY + this.scaledHeight - 45; // Bottom of kelya
        character = new Character(startX, groundY - 90, 90, 90);

        // Molot starts on the ground, not held - place it further right
        molot = new Molot(startX + 300, groundY - 30, 30, 30, character);
        molot.held = false; // Not held initially
    }

    update() {
        this.timer++;
        if (this.state === 'black_screen') {
            if (this.timer > 60) { // 1 second at 60fps
                this.state = 'fade_in';
                this.timer = 0;
            }
        } else if (this.state === 'fade_in') {
            this.fadeAlpha += 0.02; // Fade in over ~1 second at 60fps
            if (this.fadeAlpha >= 1) {
                this.state = 'kelia';
                this.fadeAlpha = 1;
            }
        }
        // Clamp character movement to kelya boundaries
        if (character) {
            character.x = Math.max(this.centerX + 150, Math.min(this.centerX + this.scaledWidth - character.width - 150, character.x));
            character.y = Math.max(this.centerY, Math.min(this.centerY + this.scaledHeight - character.height, character.y));
        }
        // Update camera to follow character
        if (character) {
            this.cameraX = character.x + character.width / 2 - gameCanvas.width / 2;
            this.cameraY = character.y + character.height / 2 - gameCanvas.height / 2;
            // Clamp camera to kelya boundaries
            this.cameraX = Math.max(0, Math.min(this.scaledWidth - gameCanvas.width, this.cameraX));
            this.cameraY = Math.max(0, Math.min(this.scaledHeight - gameCanvas.height, this.cameraY));
        }
    }

    draw(ctx) {
        if (this.state === 'black_screen') {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        } else if (this.state === 'fade_in') {
            ctx.save();
            ctx.translate(-this.cameraX, -this.cameraY);
            if (this.imageLoaded) {
                ctx.drawImage(this.backgroundImage, this.centerX, this.centerY, this.scaledWidth, this.scaledHeight);
            }
            // Draw character and molot
            character.draw(ctx);
            molot.draw(ctx);
            ctx.restore();
            // Fade overlay
            ctx.fillStyle = `rgba(0, 0, 0, ${1 - this.fadeAlpha})`;
            ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        } else if (this.state === 'kelia') {
            ctx.save();
            ctx.translate(-this.cameraX, -this.cameraY);
            if (this.imageLoaded) {
                ctx.drawImage(this.backgroundImage, this.centerX, this.centerY, this.scaledWidth, this.scaledHeight);
            }
            // Draw character and molot
            character.draw(ctx);
            molot.draw(ctx);
            ctx.restore();
        }
    }
}
