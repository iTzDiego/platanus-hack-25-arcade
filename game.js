/*
 * =================================================================================
 * THE GRAND LOUVRE DROP
 * * Juego completo en un solo archivo para Platanus Hack 25.
 * Concepto por Diego Zegers.
 * Adaptado por Gemini.
 * =================================================================================
 */

// --- CONSTANTES GLOBALES -----------------------------------------------------

const GAME_WIDTH = 480;
const GAME_HEIGHT = 640;

// Paleta de colores (basada en el prompt)
const COLOR_BEIGE = 0xF5DEB3;
const COLOR_BLACK = 0x000000;
const COLOR_WHITE = 0xFFFFFF;
const COLOR_RED = 0xFF0000;
const COLOR_GREEN = 0x00AA00;
const COLOR_GREY = 0x808080;
const COLOR_DARK_GREY = 0x333333;
const COLOR_NEON_YELLOW = 0xDAFF00;
const COLOR_DIAMOND_BLUE_LIGHT = 0x4169E1;
const COLOR_DIAMOND_BLUE_DARK = 0x0000CD;
const COLOR_RUBY_RED_LIGHT = 0xFF0000;
const COLOR_RUBY_RED_DARK = 0x8B0000;
const COLOR_BRICK_LIGHT = 0x8B4513;
const COLOR_BRICK_DARK = 0x5C2E0A;

// Clave de LocalStorage
const STORAGE_KEY = 'TGLD_topScores';

// --- FUNCIONES DE DIBUJO PROCEDURAL (PIXEL ART) -----------------------------
// Estas funciones dibujan el "pixel art" usando rectángulos, cumpliendo la restricción.
// Toman `graphics` (el contexto de dibujo) y las coordenadas centrales (cx, cy).

/**
 * Dibuja el jugador (11x20)
 * Silueta negra con chaleco amarillo neón, cabeza, brazos y piernas más detallado.
 */
function drawPlayer(g, cx, cy) {
    const scale = 2; // Hacemos el pixel art 2x para que sea visible
    const w = 11 * scale;
    const h = 20 * scale;
    const x = cx - Math.floor(w / 2);
    const y = cy - h;

    // Cuerpo (Negro)
    g.fillStyle(COLOR_BLACK);
    // Cabeza
    g.fillRect(x + (4 * scale), y, 4 * scale, 4 * scale);
    // Cuello
    g.fillRect(x + (5 * scale), y + (4 * scale), 2 * scale, 1 * scale);
    // Torso
    g.fillRect(x + (3 * scale), y + (5 * scale), 6 * scale, 7 * scale);
    // Brazos
    g.fillRect(x, y + (6 * scale), 3 * scale, 5 * scale);
    g.fillRect(x + (9 * scale), y + (6 * scale), 3 * scale, 5 * scale);
    // Piernas
    g.fillRect(x + (3 * scale), y + (12 * scale), 3 * scale, 6 * scale);
    g.fillRect(x + (6 * scale), y + (12 * scale), 3 * scale, 6 * scale);

    // Chaleco (Amarillo Neón)
    g.fillStyle(COLOR_NEON_YELLOW);
    // Correas de hombros
    g.fillRect(x + (3 * scale), y + (5 * scale), 2 * scale, 2 * scale);
    g.fillRect(x + (7 * scale), y + (5 * scale), 2 * scale, 2 * scale);
    // Pecho
    g.fillRect(x + (3 * scale), y + (7 * scale), 6 * scale, 5 * scale);
    // Línea reflectante
    g.fillStyle(COLOR_WHITE);
    g.fillRect(x + (3 * scale), y + (9 * scale), 6 * scale, 1 * scale);
}

/**
 * Dibuja una Joya Diamante (aprox 6x6)
 */
function drawDiamond(g, cx, cy) {
    const scale = 2;
    const x = cx - (3 * scale);
    const y = cy - (3 * scale);

    g.fillStyle(COLOR_DIAMOND_BLUE_DARK);
    g.fillRect(x + (1 * scale), y, 4 * scale, 1 * scale);
    g.fillRect(x, y + (1 * scale), 6 * scale, 2 * scale);
    g.fillRect(x + (1 * scale), y + (3 * scale), 4 * scale, 2 * scale);

    g.fillStyle(COLOR_DIAMOND_BLUE_LIGHT);
    g.fillRect(x + (2 * scale), y + (1 * scale), 2 * scale, 1 * scale);
    g.fillRect(x + (1 * scale), y + (2 * scale), 4 * scale, 1 * scale);
}

/**
 * Dibuja una Joya Rubí (aprox 6x6)
 */
function drawRuby(g, cx, cy) {
    const scale = 2;
    const x = cx - (3 * scale);
    const y = cy - (3 * scale);

    g.fillStyle(COLOR_RUBY_RED_DARK);
    g.fillRect(x + (1 * scale), y, 4 * scale, 1 * scale);
    g.fillRect(x, y + (1 * scale), 6 * scale, 2 * scale);
    g.fillRect(x + (1 * scale), y + (3 * scale), 4 * scale, 2 * scale);

    g.fillStyle(COLOR_RUBY_RED_LIGHT);
    g.fillRect(x + (2 * scale), y + (1 * scale), 2 * scale, 1 * scale);
    g.fillRect(x + (1 * scale), y + (2 * scale), 4 * scale, 1 * scale);
}

/**
 * Dibuja un Escombro (Ladrillo) (aprox 8x5)
 */
function drawBrick(g, cx, cy) {
    const scale = 2;
    const w = 8 * scale;
    const h = 5 * scale;
    const x = cx - Math.floor(w / 2);
    const y = cy - Math.floor(h / 2);

    g.fillStyle(COLOR_BRICK_DARK);
    g.fillRect(x, y, w, h);
    g.fillStyle(COLOR_BRICK_LIGHT);
    g.fillRect(x + scale, y + scale, w - (2 * scale), h - (2 * scale));
}


// --- ESCENA DE MENÚ ---------------------------------------------------------

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    init() {
        this.backgroundJewels = [];
        for (let i = 0; i < 20; i++) {
            this.backgroundJewels.push({
                type: Math.random() > 0.5 ? 'diamond' : 'ruby',
                x: Math.random() * GAME_WIDTH,
                y: Math.random() * GAME_HEIGHT,
                speed: 10 + Math.random() * 20
            });
        }
    }

    create() {
        this.cameras.main.setBackgroundColor(COLOR_BEIGE);

        this.bgGraphics = this.add.graphics();

        const centerX = GAME_WIDTH / 2;
        const textStyle = { fontFamily: 'Impact, sans-serif', fontSize: '28px', fill: '#000', align: 'center' };

        // 1. Título
        const titleY = GAME_HEIGHT * 0.15;
        // Título principal
        this.add.text(centerX, titleY, 'THE GRAND LOUVRE DROP', {
            ...textStyle,
            fontSize: '48px',
        }).setOrigin(0.5);


        // 2. Narrativa
        this.add.text(centerX, GAME_HEIGHT * 0.3, 'Eres el ladrón del Louvre.\nEs el 19 de octubre de 2025.\nEl plan está en marcha.', { fontFamily: 'Arial, sans-serif', fontSize: '20px', fill: '#000', align: 'center', fontStyle: 'italic' }).setOrigin(0.5);

        // 3. Instrucciones
        this.add.text(centerX, GAME_HEIGHT * 0.42, 'Esquiva los escombros (rectángulos marrones)\ny recoge el botín (las joyas de color).', { fontFamily: 'Arial, sans-serif', fontSize: '20px', fill: '#000', align: 'center' }).setOrigin(0.5);

        // 4. Scoreboard
        this.add.text(centerX, GAME_HEIGHT * 0.55, '--- MEJORES BOTINES ---', {
            ...textStyle,
            fontFamily: 'Impact, sans-serif', // Keep this one bold
            fontSize: '24px'
        }).setOrigin(0.5);

        try {
            const scores = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
            if (scores.length === 0) {
                this.add.text(centerX, GAME_HEIGHT * 0.63, 'Aún no hay puntuaciones.', { ...textStyle, fontFamily: 'Arial, sans-serif', fontSize: '18px' }).setOrigin(0.5);
            } else {
                let scoreText = '';
                for (let i = 0; i < scores.length; i++) {
                    scoreText += `${i + 1}. ${scores[i]}\n`;
                }
                this.add.text(centerX, GAME_HEIGHT * 0.7, scoreText, { ...textStyle, fontFamily: 'Arial, sans-serif', fontSize: '20px' }).setOrigin(0.5);
            }
        } catch (e) {
            console.error('Error al leer localStorage:', e);
            localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        }


        // 5. Inicio
        this.add.text(centerX, GAME_HEIGHT * 0.85, 'PC: Usa [A] y [D] para moverte. [ESPACIO] para iniciar.', {
            ...textStyle,
            fontFamily: 'Impact, sans-serif',
            fontSize: '18px'
        }).setOrigin(0.5);
        this.add.text(centerX, GAME_HEIGHT * 0.9, 'Arcade: Usa Joystick para moverte. [START] para iniciar.', {
            ...textStyle,
            fontFamily: 'Impact, sans-serif',
            fontSize: '18px'
        }).setOrigin(0.5);

        // 6. Créditos
        this.add.text(10, GAME_HEIGHT - 20, 'Creado por Diego Zegers', { ...textStyle, fontFamily: 'Arial, sans-serif', fontSize: '14px' }).setOrigin(0, 1);

        // Input
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('MainScene');
        });
    }

    update(time, delta) {
        this.bgGraphics.clear();

        for (const jewel of this.backgroundJewels) {
            jewel.y += jewel.speed * (delta / 1000);
            if (jewel.y > GAME_HEIGHT + 20) {
                jewel.y = -20;
                jewel.x = Math.random() * GAME_WIDTH;
            }

            if (jewel.type === 'diamond') {
                drawDiamond(this.bgGraphics, jewel.x, jewel.y);
            } else {
                drawRuby(this.bgGraphics, jewel.x, jewel.y);
            }
        }
    }
}

// --- ESCENA PRINCIPAL (JUEGO) -----------------------------------------------

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    init() {
        // Estado del juego
        this.score = 0;
        this.combo = 1;
        this.vidas = 3;
        this.gameSpeed = 300; // Píxeles por segundo
        this.spawnTicker = 0;

        // Estado del jugador
        this.player = {
            lane: 1, // Carril 0, 1, 2, 3
            y: GAME_HEIGHT * 0.85,
            invincibleTimer: 0 // Tiempo de invencibilidad en ms
        };

        // Posiciones de los carriles
        this.lanePositions = [
            GAME_WIDTH * 0.2, // Carril 0
            GAME_WIDTH * 0.4, // Carril 1
            GAME_WIDTH * 0.6, // Carril 2
            GAME_WIDTH * 0.8  // Carril 3
        ];

        // Arrays de entidades (solo datos, no objetos de Phaser)
        this.items = []; // { type: 'diamond' | 'ruby' | 'brick', lane: number, y: number }
        this.windows = []; // { openLane: number, y: number }

        // Líneas de fondo para el scroll
        this.bgLines = [];
        for (let i = 0; i < 10; i++) {
            this.bgLines.push(Math.random() * GAME_HEIGHT);
        }

        this.bubbleText = null;
        this.bubbleTimer = 0;
    }

    create() {
        // Un solo objeto de gráficos para todo el renderizado de la escena
        this.graphics = this.add.graphics();

        // --- UI (HUD) ---
        const textStyle = { fontFamily: 'Arial, sans-serif', fontSize: '24px', fill: '#000', align: 'left' };
        this.scoreText = this.add.text(20, 20, `BOTÍN: 0`, textStyle);
        this.comboText = this.add.text(20, 50, `COMBO: x1`, { ...textStyle, fill: '#0000CD' });
        this.vidasText = this.add.text(GAME_WIDTH - 20, 20, `VIDAS: ❤️❤️❤️`, { ...textStyle, fontSize: '20px', fill: '#FF0000' }).setOrigin(1, 0);

        this.bubbleText = this.add.text(0, 0, '', { fontFamily: 'Arial', fontSize: '16px', fill: '#000000', backgroundColor: '#ffffff', padding: { x: 5, y: 2 } }).setOrigin(0.5).setAlpha(0);

        // --- Controles ---
        this.keyA = this.input.keyboard.addKey('A'); // Izquierda
        this.keyD = this.input.keyboard.addKey('D'); // Derecha

        // --- Controlador de Spawning ---
        // Se ejecuta 3 veces por segundo (aprox cada 333ms)
        this.spawnTimer = this.time.addEvent({
            delay: 333,
            callback: this.spawnController,
            callbackScope: this,
            loop: true
        });
    }

    /**
     * Controlador maestro de spawning, llamado por el TimerEvent.
     */
    spawnController() {
        this.spawnTicker++;
        const tickInCycle = this.spawnTicker % 12;

        // --- Ventana ---
        // Spawnear Ventana: En el tick 0 del ciclo
        if (tickInCycle === 0) {
            this.windows.push({
                openLane: Phaser.Math.Between(0, 3),
                y: -50
            });
            return; // No hacer nada más en este tick
        }

        // --- Zona sin Items alrededor de la ventana ---
        // No spawnear items en los ticks 9, 10, 11 (antes) ni 1, 2, 3 (después)
        if (tickInCycle >= 9 || tickInCycle <= 3) {
            return;
        }

        // --- Items ---
        // Spawnear Items: En los ticks pares restantes (4, 6, 8)
        if (this.spawnTicker % 2 === 0) {
            const lane = Phaser.Math.Between(0, 3);
            const typeRoll = Math.random();
            let type = 'diamond';
            if (typeRoll < 0.3) {
                type = 'brick';
            } else if (typeRoll < 0.65) {
                type = 'ruby';
            }
            this.items.push({ type, lane, y: 0 });
        }
    }

    /**
     * Actualiza el HUD con los valores actuales.
     */
    updateHUD() {
        this.scoreText.setText(`BOTÍN: ${this.score}`);
        this.comboText.setText(`COMBO: x${this.combo}`);
        
        // Actualiza las vidas con emojis
        let hearts = '';
        for (let i = 0; i < this.vidas; i++) hearts += '❤️';
        this.vidasText.setText(`VIDAS: ${hearts}`);
    }

    /**
     * Maneja el "juice" (efectos visuales)
     */
    triggerJuice(effect) {
        switch (effect) {
            case 'hit':
                this.cameras.main.shake(100, 0.01);
                this.cameras.main.flash(200, 255, 0, 0); // Flash rojo
                this.player.invincibleTimer = 500; // 500ms de invencibilidad
                break;
            case 'catch':
                // Pop de score
                this.tweens.add({
                    targets: this.scoreText,
                    scale: 1.5,
                    duration: 100,
                    yoyo: true
                });

                if (Phaser.Math.Between(1, 5) === 1) {
                    this.showTextBubble();
                }
                break;
            case 'miss':
                // Pop de combo en rojo
                this.comboText.setFill(COLOR_RED);
                this.tweens.add({
                    targets: this.comboText,
                    scale: 1.1,
                    duration: 100,
                    yoyo: true,
                    onComplete: () => {
                        this.comboText.setFill('#0000CD'); // Volver a azul
                    }
                });
                break;
        }
    }

    /**
     * Muestra una burbuja de texto sobre el jugador.
     */
    showTextBubble() {
        const phrases = ['Ooh la la!', 'Ça alors !', 'Oui oui!', 'La vache!'];
        const phrase = Phaser.Math.RND.pick(phrases);
        this.bubbleText.setText(phrase);
        this.bubbleText.setAlpha(1);
        this.bubbleTimer = 1500; // Muestra por 1.5 segundos
    }

    // --- BUCLE PRINCIPAL DEL JUEGO ---
    update(time, delta) {
        const dt = delta / 1000; // Delta time en segundos
        const fallDist = this.gameSpeed * dt;

        // 1. Limpiar gráficos
        this.graphics.clear();

        // 2. Dibujar Fondo (Beige + Líneas)
        this.graphics.fillStyle(COLOR_BEIGE);
        this.graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        this.graphics.fillStyle(COLOR_DARK_GREY);
        for (let i = 0; i < this.bgLines.length; i++) {
            this.bgLines[i] = (this.bgLines[i] + fallDist * 0.5) % GAME_HEIGHT;
            this.graphics.fillRect(0, this.bgLines[i], GAME_WIDTH, 2);
        }

        // 3. Incrementar Velocidad y Manejar Invencibilidad
        // this.gameSpeed += 0.1; // Aumenta 0.1 por *frame* (¡muy rápido!)
        // -> Corrección: 0.1 por frame es injugable. Usaré 0.1 por segundo.
        this.gameSpeed += 0.45 * dt;

        // Dynamically adjust spawn rate
        if (this.spawnTimer.delay > 100) { // Don't go below 100ms delay
            this.spawnTimer.delay -= 1 * dt; // Decrease delay by 1ms per second
            if (this.spawnTimer.delay < 100) {
                this.spawnTimer.delay = 100;
            }
        }

        if (this.player.invincibleTimer > 0) {
            this.player.invincibleTimer -= delta;
        }

        // 4. Input del Jugador
        if (Phaser.Input.Keyboard.JustDown(this.keyA)) {
            this.player.lane = Math.max(0, this.player.lane - 1);
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyD)) {
            this.player.lane = Math.min(this.lanePositions.length - 1, this.player.lane + 1);
        }

        const playerX = this.lanePositions[this.player.lane];
        const playerHitboxY = this.player.y - 20; // Mitad del jugador

        // 5. Actualizar y Dibujar Ventanas + Colisión
        for (let i = this.windows.length - 1; i >= 0; i--) {
            const window = this.windows[i];
            window.y += fallDist;

            // Dibujar
            this.graphics.fillStyle(COLOR_GREY);
            const windowHeight = 50;
            for (let lane = 0; lane < 4; lane++) {
                if (lane !== window.openLane) {
                    this.graphics.fillRect(this.lanePositions[lane] - (GAME_WIDTH / 8), window.y - windowHeight, GAME_WIDTH / 4, windowHeight);
                }
            }

            // Colisión
            if (this.player.invincibleTimer <= 0 && window.y > playerHitboxY && window.y - windowHeight < playerHitboxY) {
                if (this.player.lane !== window.openLane) {
                    this.vidas--;
                    this.combo = 1;
                    this.triggerJuice('hit');
                }
            }

            // Limpiar (Destruir)
            if (window.y > GAME_HEIGHT + windowHeight) {
                this.windows.splice(i, 1);
            }
        }

        // 6. Actualizar y Dibujar Items (Joyas/Escombros) + Colisión
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            item.y += fallDist;

            const itemX = this.lanePositions[item.lane];
            const itemSize = 12; // Tamaño de hitbox

            // Dibujar
            switch (item.type) {
                case 'diamond': drawDiamond(this.graphics, itemX, item.y); break;
                case 'ruby': drawRuby(this.graphics, itemX, item.y); break;
                case 'brick': drawBrick(this.graphics, itemX, item.y); break;
            }

            // Colisión (Lógica)
            if (item.lane === this.player.lane && Math.abs(item.y - playerHitboxY) < itemSize) {
                switch (item.type) {
                    case 'diamond':
                    case 'ruby':
                        // 6a. Atrapar Joya
                        this.score += 100 * this.combo;
                        this.combo++;
                        this.triggerJuice('catch');
                        break;
                    case 'brick':
                        // 6b. Golpear Escombro
                        if (this.player.invincibleTimer <= 0) {
                            this.vidas--;
                            this.combo = 1;
                            this.triggerJuice('hit');
                        }
                        break;
                }
                this.items.splice(i, 1); // Destruir item
                continue; // Ir al siguiente item
            }

            // 6c. Fallar Joya
            if (item.y > GAME_HEIGHT - 50) {
                if (item.type === 'diamond' || item.type === 'ruby') {
                    if (this.combo > 1) { // Solo resetea si tenía combo
                        this.combo = 1;
                        this.triggerJuice('miss');
                    }
                }
                this.items.splice(i, 1); // Destruir item
            }
        }

        // 7. Dibujar Jugador
        // Parpadea si es invencible
        if (this.bubbleTimer > 0) {
            this.bubbleTimer -= delta;
            this.bubbleText.x = playerX;
            this.bubbleText.y = this.player.y - 50; // Posición sobre el jugador
            if (this.bubbleTimer <= 0) {
                this.bubbleText.setAlpha(0);
            }
        }

        if (this.player.invincibleTimer <= 0 || (this.player.invincibleTimer % 150 < 75)) {
            drawPlayer(this.graphics, playerX, this.player.y);
        }

        // 8. Actualizar UI
        this.updateHUD();

        // 9. Chequear Game Over
        if (this.vidas <= 0) {
            this.scene.start('GameOverScene', { score: this.score });
        }
    }
}


// --- ESCENA DE GAME OVER ----------------------------------------------------

class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.lightTimer = 0;
        this.isRedLightOn = true;
    }

    create() {
        this.cameras.main.setBackgroundColor(COLOR_BEIGE);
        const centerX = GAME_WIDTH / 2;
        const textStyle = { fontFamily: 'Impact, sans-serif', fontSize: '32px', fill: '#000', align: 'center' };

        this.policeLightsGraphics = this.add.graphics(); // Add graphics object

        // 1. Título
        this.add.text(centerX, GAME_HEIGHT * 0.2, '¡CAPTURADO!', { ...textStyle, fontSize: '52px', fill: COLOR_RED }).setOrigin(0.5);

        // 2. Score Final
        this.add.text(centerX, GAME_HEIGHT * 0.35, `BOTÍN FINAL: ${this.finalScore}`, textStyle).setOrigin(0.5);

        // 3. Lógica de Scoreboard
        let scores = [];
        try {
            scores = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (e) {
            console.error('Error al leer localStorage:', e);
            scores = [];
        }

        let isNewRecord = false;
        if (scores.length < 5 || this.finalScore > scores[scores.length - 1]) {
            scores.push(this.finalScore);
            scores.sort((a, b) => b - a); // Ordenar de mayor a menor
            scores.length = Math.min(scores.length, 5); // Recortar a 5
            
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
                isNewRecord = true;
            } catch (e) {
                console.error('Error al guardar en localStorage:', e);
            }
        }

        if (isNewRecord) {
            this.add.text(centerX, GAME_HEIGHT * 0.5, '¡NUEVO RÉCORD DE BOTÍN!', { ...textStyle, fontSize: '28px', fill: COLOR_GREEN }).setOrigin(0.5);
        }

        // 4. Reinicio
        this.add.text(centerX, GAME_HEIGHT * 0.75, 'PC: Presiona [ESPACIO] para reiniciar.', { ...textStyle, fontSize: '22px' }).setOrigin(0.5);
        this.add.text(centerX, GAME_HEIGHT * 0.8, 'Arcade: Presiona [START] para reiniciar.', { ...textStyle, fontSize: '22px' }).setOrigin(0.5);

                this.input.keyboard.on('keydown-SPACE', () => {

                    this.scene.start('MenuScene');

                });

            }

        

            update(time, delta) {

                this.policeLightsGraphics.clear();

                this.lightTimer += delta;

        

                const lightWidth = 50;

                const lightHeight = 20;

                const lightY = 50; // Position at the top

        

                if (this.lightTimer >= 250) { // Flash every 250ms

                    this.isRedLightOn = !this.isRedLightOn;

                    this.lightTimer = 0;

                }

        

                if (this.isRedLightOn) {

                    this.policeLightsGraphics.fillStyle(COLOR_RED, 1);

                    this.policeLightsGraphics.fillRect(GAME_WIDTH / 2 - lightWidth - 10, lightY, lightWidth, lightHeight);

                    this.policeLightsGraphics.fillStyle(COLOR_DIAMOND_BLUE_LIGHT, 1); // Use a blue color

                    this.policeLightsGraphics.fillRect(GAME_WIDTH / 2 + 10, lightY, lightWidth, lightHeight);

                } else {

                    this.policeLightsGraphics.fillStyle(COLOR_DIAMOND_BLUE_LIGHT, 1); // Use a blue color

                    this.policeLightsGraphics.fillRect(GAME_WIDTH / 2 - lightWidth - 10, lightY, lightWidth, lightHeight);

                    this.policeLightsGraphics.fillStyle(COLOR_RED, 1);

                    this.policeLightsGraphics.fillRect(GAME_WIDTH / 2 + 10, lightY, lightWidth, lightHeight);

                }

            }

        }


// --- CONFIGURACIÓN DE PHASER ------------------------------------------------

const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: COLOR_BEIGE, // Color de fondo por defecto
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    // No usamos física de Phaser para ahorrar KBs
    physics: undefined,
    scene: [
        MenuScene,
        MainScene,
        GameOverScene
    ]
};

// ¡Inicia el juego!
// Esta variable `game` es la que el template oficial de Platanus busca.
const game = new Phaser.Game(config);