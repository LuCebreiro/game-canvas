class Game {
    constructor(ctx) {
        this.ctx = ctx
        this.levelSelected = 0;
        this.nubes = new Nubes(this.ctx);
        this.background = new Background(this.ctx, LEVELS[this.levelSelected].background);
        this.obstacles = []
        this.player = new Player(ctx, this)
        this.floors = LEVELS[this.levelSelected].floors;
        this.stairs = LEVELS[this.levelSelected].escaleras.map((escalera) => {
            return new Escalera(ctx, escalera.x, escalera.y, escalera.large, escalera.level);
        });
        this.scoreBlock = new ScoreBlock(ctx, 100, 30, LEVELS[this.levelSelected].score);

        this.plantas = LEVELS[this.levelSelected].plantas.map((planta) => {
            return new Planta(ctx, planta.x, planta.y, planta.isTaken);
        });

        this.plataformas = LEVELS[this.levelSelected].plataformas.map((plataforma) => {
            return new Plataforma(ctx, plataforma.x, plataforma.y, plataforma.width)
        });

        this.takenPlants = [];

        this.intervalId = null;
        this.counter = 0;



    }
    start() {
        this.intervalId = setInterval(() => {
            this.clear();
            this.checkCollisions()
            this.move();
            this.draw();
            this.counter++;

            if (this.counter % 120 === 0) {
                this.addObstacle();
            }

        }, 1000 / 60);

    }


    draw() {
        this.ctx.imageSmoothingEnabled = false
        this.nubes.draw();
        this.background.draw();
        
        this.scoreBlock.draw();
        this.plataformas.forEach(obs => {
            obs.draw();
        });
        this.stairs.forEach(obs => {
            obs.draw();
        });
        this.plantas.forEach(obs => {
            obs.draw();
        });
        this.obstacles.forEach((obs) => {
            obs.draw();
        });
        this.player.draw();
    }


    move() {
        this.nubes.move();
        this.player.move();
        this.obstacles.forEach((obs) => {
            obs.move();
        });

    }

    clear() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    checkCollisions() {
        const stairColliding = this.stairs.find((obs) => obs.collidesWith(this.player));

        if (stairColliding) {
            const topY = this.floors[stairColliding.level].topPlatformY;
            const bottomY = this.floors[stairColliding.level].bottomPlatformY
            this.player.actions.canClimb = true;

            if (this.player.actions.canClimb) {
                this.player.actions.isClimbing = this.player.y < stairColliding.y + stairColliding.height - this.player.height - 10 && this.player.y + this.player.height > stairColliding.y + 30;

                if (topY >= this.player.y + this.player.height) {
                    this.player.y = topY - this.player.height;
                    //console.log('He llegado arriba')
                } else if (bottomY <= this.player.y + this.player.height) {
                    this.player.y = bottomY - this.player.height;
                    //console.log('He llegado abajo')

                }
                //  console.log('puedo subir')

            }

        } else {
            this.player.actions.canClimb = false;
            this.player.actions.isClimbing = false;
            //console.log('no puedo subir')
        }

        this.plantas.some((obs, index) => {
            const plantsCollision = obs.collidesWith(this.player);
            // console.log(plantsCollision)
            if (plantsCollision && !obs.isTaken && !this.player.isHoldingPlant) {
                this.plantas.splice(index, 1);
                this.player.isHoldingPlant = true;

            } else if (this.player.isHoldingPlant && this.player.movements.space) {
                this.addPlants();
                this.player.isHoldingPlant = false;
                this.scoreBlock.scored++
                //sumar en score y en scoreblock
            }
        });

        if (this.scoreBlock.scored === LEVELS[this.levelSelected].score) {
            this.nextLevel();
        }

        this.obstacles.forEach((obs) => {
            if (this.player.x + this.player.width >= obs.x &&
                this.player.x <= obs.x + obs.width &&
                this.player.y + this.player.height >= obs.y &&
                this.player.y <= obs.y + obs.height) {
                    console.log('colisiono')
                this.gameOver();
            }
        });

    }
    addPlants() {
        const newPlant = new Planta(this.ctx, this.player.x + this.player.width + 1, this.player.y, true);
        this.plantas.push(newPlant);

    }

    addObstacle() {
        if (this.levelSelected > 0){
        const randomX = Math.floor(Math.random() * (this.ctx.canvas.width - 30));
        const randomXFrame = Math.floor(Math.random() * 5);
        const newObstacle = new Obstaculo(this.ctx, randomX, randomXFrame);
        this.obstacles.push(newObstacle);
        }
    }

    nextLevel() {
        if (this.levelSelected < LEVELS.length - 1) {
            this.levelSelected++;
            this.reset();
            
        } else {
            this.gameOver();
        }
    }

    reset(){
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this.background = new Background(ctx, LEVELS[this.levelSelected].background);
            this.floors = LEVELS[this.levelSelected].floors;
            this.stairs = LEVELS[this.levelSelected].escaleras.map((escalera) => {
                return new Escalera(ctx, escalera.x, escalera.y, escalera.large, escalera.level);
            });
            this.scoreBlock = new ScoreBlock(ctx, 100, 30, LEVELS[this.levelSelected].score);

            this.plantas = LEVELS[this.levelSelected].plantas.map((planta) => {
                return new Planta(ctx, planta.x, planta.y, planta.isTaken);
            });

            this.plataformas = LEVELS[this.levelSelected].plataformas.map((plataforma) => {
                return new Plataforma(ctx, plataforma.x, plataforma.y, plataforma.width)
            });

            this.takenPlants = [];
            this.player.x = 550;
            this.player.y = 581;

    }

    gameOver() {
            clearInterval(this.intervalId);
            setTimeout(() => {
                this.ctx.font = '56px Arial';
                this.ctx.fillStyle = 'red';
                this.ctx.fillText(
                    'Has logrado salvar a tu comunidad',
                    this.ctx.canvas.width / 2 - 150,
                    this.ctx.canvas.height / 2,
                    300);
            }, 1000);
        }
    }
