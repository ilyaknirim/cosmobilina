// Level 1: ACT I - DEATH OF SVAROZHIY-KRUG
// Episode 1: "Awakening"

class Level1 extends Level {
    constructor() {
        super();
        this.backgroundImage = null;
        this.companionImage = null;
        this.explosionImage = null;
        this.textDisplay = '';
        this.textTimer = 0;
        this.flashTimer = 0;
    }

    init() {
        this.state = 'black_screen';
        this.timer = 0;
        this.textDisplay = '';
        this.textTimer = 0;
        this.cameraX = 0;
        this.cameraY = 0;
        this.flashTimer = 0;

        // Load background images
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'sprites/kelia.svg'; // Cell-room background

        this.companionImage = new Image();
        this.companionImage.src = 'sprites/companion.svg'; // Shchuka-Govoruka hologram

        this.explosionImage = new Image();
        this.explosionImage.src = 'sprites/street.svg'; // Exploding wall view

        // Position character in cell - room is full screen, character starts on left
        const startX = 100;
        const groundY = gameCanvas.height - gameCanvas.height / 6;
        character = new Character(startX, groundY - 60, 60, 60);

        // Molot starts on the ground, not held - place it further right
        molot = new Molot(startX + 300, groundY - 30, 30, 30, character);
        molot.held = false; // Not held initially
    }

    update() {
        this.timer++;

        // Update camera to follow character
        this.cameraX = character.x - gameCanvas.width / 2;
        this.cameraY = character.y - gameCanvas.height / 2;

        switch (this.state) {
            case 'black_screen':
                if (this.timer > 60) { // 1 second at 60fps
                    this.state = 'awakening';
                    this.timer = 0;
                    // Play alarm sound
                    playAlarmSound();
                }
                break;

            case 'awakening':
                if (this.timer > 120) { // 2 seconds
                    this.state = 'control';
                    this.timer = 0;
                    this.textDisplay = 'ЩУКА-ГОВОРУКА: "Витязь! Пробуждайся! Защитные купола трескаются! Чаромута прорывается в нижние уровни!"';
                    this.textTimer = 300; // 5 seconds display
                }
                break;

            case 'control':
                if (this.textTimer > 0) {
                    this.textTimer--;
                } else {
                    this.textDisplay = '';
                }

                // Check if player picks up molot
                if (!molot.held && Math.abs(character.x - molot.x) < 50 && Math.abs(character.y - molot.y) < 50) {
                    // Player is close to molot, can pick it up
                    // For now, auto-pickup when close
                    molot.held = true;
                    molot.x = character.x + 35;
                    molot.y = character.y + 10;
                }

                if (this.timer > 600) { // 10 seconds after control
                    this.state = 'explosion';
                    this.timer = 0;
                    this.flashTimer = 30; // 0.5 second flash
                    playExplosion();
                }
                break;

            case 'explosion':
                if (this.flashTimer > 0) {
                    this.flashTimer--;
                }
                // Explosion event
                if (this.timer > 180) { // 3 seconds
                    // Transition to next part or level
                }
                break;
        }
    }

    draw(ctx) {
        switch (this.state) {
            case 'black_screen':
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
                break;

            case 'awakening':
                // Fade in background
                const alpha = Math.min(this.timer / 120, 1);
                ctx.globalAlpha = alpha;
                if (this.backgroundImage.complete) {
                    const scaledWidth = gameCanvas.width * (10 / 3);
                    const scaledHeight = gameCanvas.height * (10 / 3);
                    const centerX = gameCanvas.width / 2 - scaledWidth / 2;
                    const centerY = gameCanvas.height / 2 - scaledHeight / 2;
                    ctx.drawImage(this.backgroundImage, centerX - this.cameraX, centerY - this.cameraY, scaledWidth, scaledHeight);
                }
                ctx.globalAlpha = 1;
                break;

            case 'control':
            case 'explosion':
                // Flash effect before explosion
                if (this.flashTimer > 0) {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
                    return; // Skip drawing other elements during flash
                }

                // Draw background
                if (this.backgroundImage.complete) {
                    const scaledWidth = gameCanvas.width * (10 / 3);
                    const scaledHeight = gameCanvas.height * (10 / 3);
                    const centerX = gameCanvas.width / 2 - scaledWidth / 2;
                    const centerY = gameCanvas.height / 2 - scaledHeight / 2;
                    ctx.drawImage(this.backgroundImage, centerX - this.cameraX, centerY - this.cameraY, scaledWidth, scaledHeight);
                }

                // Draw companion hologram above table
                if (this.companionImage.complete && this.state === 'control') {
                    ctx.drawImage(this.companionImage, 200 - this.cameraX, 100 - this.cameraY, 150, 100);
                }

                // Draw explosion view if exploded
                if (this.state === 'explosion' && this.explosionImage.complete) {
                    ctx.drawImage(this.explosionImage, gameCanvas.width / 2 - 200, gameCanvas.height / 2 - 150, 400, 300);
                }

                // Draw character and molot
                if (character && character.loaded) {
                    character.draw(ctx);
                }
                if (molot && molot.loaded) {
                    molot.draw(ctx);
                }

                // Draw text
                if (this.textDisplay) {
                    ctx.fillStyle = 'white';
                    ctx.font = '20px Arial';
                    ctx.fillText(this.textDisplay, 50, gameCanvas.height - 50);
                }
                break;
        }
    }
}
