class Level1 extends Level {
    constructor() {
        super();
        this.backgroundImage = null;
        this.scaledWidth = 0;
        this.scaledHeight = 0;
        this.centerX = 0;
        this.centerY = 0;
    }

    init() {
        this.state = 'black_screen';
        this.timer = 0;

        // Load background image
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'sprites/kelia.svg';

        // Calculate kelya scaling (3x larger)
        this.scaledWidth = gameCanvas.width * 3;
        this.scaledHeight = gameCanvas.width * (9 / 4);
        this.centerX = gameCanvas.width / 2 - this.scaledWidth / 2;
        this.centerY = gameCanvas.height / 2 - this.scaledHeight / 2;

        // Position character in center of kelya
        const startX = this.centerX + this.scaledWidth / 2 - 45; // Center of kelya horizontally
        const groundY = this.centerY + this.scaledHeight / 2 + 45; // Center of kelya vertically
        character = new Character(startX, groundY - 90, 90, 90);

        // Molot starts on the ground, not held - place it further right
        molot = new Molot(startX + 300, groundY - 30, 30, 30, character);
        molot.held = false; // Not held initially
    }

    update() {
        this.timer++;
        if (this.state === 'black_screen' && this.timer > 60) { // 1 second at 60fps
            this.state = 'kelia';
            this.timer = 0;
        }
        // Clamp character movement to kelya boundaries
        if (character) {
            character.x = Math.max(this.centerX, Math.min(this.centerX + this.scaledWidth - character.width, character.x));
            character.y = Math.max(this.centerY, Math.min(this.centerY + this.scaledHeight - character.height, character.y));
        }
    }

    draw(ctx) {
        if (this.state === 'black_screen') {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        } else if (this.state === 'kelia') {
            if (this.backgroundImage.complete) {
                ctx.drawImage(this.backgroundImage, this.centerX, this.centerY, this.scaledWidth, this.scaledHeight);
            }
            // Draw character and molot
            character.draw(ctx);
            molot.draw(ctx);
        }
    }
}
