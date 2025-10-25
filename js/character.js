class Character extends Entity {
    constructor(x, y, width, height) {
        super(x, y, width, height, 'sprites/character.svg');
        this.velocityY = 0;
        this.gravity = 0.5;
        this.jumpStrength = -15;
        this.groundY = gameCanvas.height - gameCanvas.height / 6;
        this.isJumping = false;
        this.targetX = x;
        this.moveSpeed = 2;
        this.isMouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastDirection = 0; // 0: idle, 1: right, -1: left
        this.rightImage = new Image();
        this.rightImage.src = 'sprites/left_c.svg';
        this.rightLoaded = false;
        this.rightImage.onload = () => { this.rightLoaded = true; };
        this.leftImage = new Image();
        this.leftImage.src = 'sprites/right_c.svg';
        this.leftLoaded = false;
        this.leftImage.onload = () => { this.leftLoaded = true; };
    }

    update() {
        if (this.isMouseDown) {
            this.targetX = this.mouseX - this.width / 2;
            if (this.mouseY < this.y && !this.isJumping) {
                this.velocityY = this.jumpStrength;
                this.isJumping = true;
            }
        }

        if (Math.abs(this.x - this.targetX) > this.moveSpeed) {
            if (this.x < this.targetX) {
                this.lastDirection = 1; // moving right
                this.x += this.moveSpeed;
            } else {
                this.lastDirection = -1; // moving left
                this.x -= this.moveSpeed;
            }
        } else {
            this.lastDirection = 0; // idle
            this.x = this.targetX;
        }

        if (this.isJumping) {
            this.velocityY += this.gravity;
            this.y += this.velocityY;
            if (this.y >= this.groundY - this.height) {
                this.y = this.groundY - this.height;
                this.velocityY = 0;
                this.isJumping = false;
            }
        }
    }

    draw(ctx) {
        let imageToDraw = this.image;
        if (this.lastDirection === 1 && this.rightLoaded) {
            imageToDraw = this.rightImage;
        } else if (this.lastDirection === -1 && this.leftLoaded) {
            imageToDraw = this.leftImage;
        }
        ctx.drawImage(imageToDraw, this.x, this.y, this.width, this.height);
    }

    handleMouseDown(event) {
        this.isMouseDown = true;
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
    }

    handleMouseMove(event) {
        if (this.isMouseDown) {
            this.mouseX = event.clientX;
            this.mouseY = event.clientY;
        }
    }

    handleMouseUp() {
        this.isMouseDown = false;
    }

    handleTouchStart(touch) {
        this.isMouseDown = true;
        this.mouseX = touch.clientX;
        this.mouseY = touch.clientY;
    }

    handleTouchMove(touch) {
        if (this.isMouseDown) {
            this.mouseX = touch.clientX;
            this.mouseY = touch.clientY;
        }
    }

    handleTouchEnd() {
        this.isMouseDown = false;
    }
}
