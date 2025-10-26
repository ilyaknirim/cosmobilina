class Molot extends Entity {
    constructor(x, y, width, height, character) {
        console.log("Creating molot at position:", x, y);
        super(x, y, width, height, 'sprites/molot.svg');
        this.character = character;
        this.setupStates();
        this.setupPhysics();
    }

    setupStates() {
        this.states = {
            HELD: 'held',
            FLYING: 'flying',
            RETURNING: 'returning',
            PEDESTAL: 'pedestal'  // Новое состояние - молот на постаменте
        };
        this.currentState = this.states.PEDESTAL; // Начинаем с состояния на постаменте
        this.offset = { x: 40, y: 10 };
    }

    setupPhysics() {
        this.speed = 6;
        this.rotation = 0;
        this.rotationSpeed = 0.1;
    }

    update(deltaTime) {
        super.update(deltaTime);
        switch(this.currentState) {
            case this.states.HELD:
                this.followCharacter();
                break;
            case this.states.FLYING:
                this.updateFlight();
                break;
            case this.states.RETURNING:
                this.updateReturn();
                break;
            case this.states.PEDESTAL:
                // Молот на постаменте - не двигается
                break;
        }
    }

    throw(targetX, targetY) {
        if (this.currentState === this.states.HELD) {
            this.currentState = this.states.FLYING;
            this.target = { x: targetX, y: targetY };
        }
    }

    updateFlight() {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.speed) {
            this.currentState = this.states.RETURNING;
        } else {
            this.velocity.x = (dx / distance) * this.speed;
            this.velocity.y = (dy / distance) * this.speed;
            this.rotation += this.rotationSpeed;
        }
    }
    
    updateReturn() {
        // Возвращение молота к персонажу
        this.followCharacter();
    }
    
    followCharacter() {
        // Следование за персонажем
        this.x = this.character.x + this.character.width / 2 - this.width / 2 + this.offset.x;
        this.y = this.character.y + this.character.height / 2 - this.height / 2 + this.offset.y;
    }
}
