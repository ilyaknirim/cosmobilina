class Character extends Entity {
    constructor(x, y, width, height) {
        super(x, y, width, height, 'sprites/character.svg');
        this.setupAnimation();
        this.setupPhysics();
        this.setupControls();
    }

    setupAnimation() {
        this.sprites = {
            idle: 'sprites/character.svg',
            left: 'sprites/left_c.svg',
            right: 'sprites/right_c.svg'
        };
        this.currentSprite = 'idle';
        this.loadSprites();
    }

    setupPhysics() {
        this.gravity = 0.5;
        this.jumpStrength = -15;
        this.moveSpeed = 2;
        this.isJumping = false;
    }

    setupControls() {
        this.targetX = this.x;
        this.isMouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.handleMovement();
        this.handleJump();
        this.updateAnimation();
    }

    handleMovement() {
        if (this.isMouseDown) {
            this.targetX = this.mouseX - this.width / 2;
        }
        const dx = this.targetX - this.x;
        if (Math.abs(dx) > this.moveSpeed) {
            this.velocity.x = dx > 0 ? this.moveSpeed : -this.moveSpeed;
        } else {
            this.velocity.x = 0;
        }
    }

    handleJump() {
        if (this.isMouseDown && this.mouseY < this.y && !this.isJumping) {
            this.velocity.y = this.jumpStrength;
            this.isJumping = true;
        }
        if (this.isJumping) {
            this.velocity.y += this.gravity;
        }
    }

    updateAnimation() {
        if (Math.abs(this.velocity.x) > 0) {
            this.currentSprite = this.velocity.x > 0 ? 'right' : 'left';
        } else {
            this.currentSprite = 'idle';
        }
    }
}
