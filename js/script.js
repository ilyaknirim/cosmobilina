const startScreen = document.getElementById('startScreen');
const loreScreen = document.getElementById('loreScreen');
const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');
const gameUI = document.getElementById('gameUI');

const startGameBtn = document.getElementById('startGameBtn');
const backBtn = document.getElementById('backBtn');
const loreContent = document.getElementById('loreContent');
const pauseBtn = document.getElementById('pauseBtn');

let isPaused = false;
let gameLoopId;
let gameInitialized = false;
let character, molot;
let currentLevel;

function gameLoop() {
    update();
    draw();
    gameLoopId = requestAnimationFrame(gameLoop);
}

function update() {
    character.update();
    molot.update();
    currentLevel.update();
}

function draw() {
    currentLevel.draw(ctx);
}

const loreData = {
    logline: `
        <h2>Логлайн</h2>
        <p>Молодой витязь Мирон Светлояр, последний из рода Звёздных Волхвов, должен покинуть свою гибнущую родную планету-град Сварожий-Круг и отправиться в опасное путешествие через разорённую Чаромутой область космоса — Глубинную. Его цель — найти легендарный Ирий-Станцию, последний оплот человечества, и передать им древний артефакт, ключ к спасению мира. Но за ним по пятам идёт его же бывший наставник, соблазнённый тёмной силой Чаромуты.</p>
    `,
    characters: `
        <h2>Ключевые действующие лица (Персонажи)</h2>
        <h3>МИРОН СВЕТЛОЯР (главный герой)</h3>
        <p>Витязь-звездоплаватель. Не носит скафандр, вместо него — тело защищено силовым полем, проецируемым древними славянскими оберегами. Его основное оружие — «Плазмомолот», который можно переключать из режима ближнего боя в режим энергетического лука. Его кибернетический спутник — «ЩУКА-ГОВОРУКА» — хранит карты, даёт советы и иногда язвит.</p>
        
        <h3>ДОБРЫНЯ ЛЮТОСЛАВ (антагонист)</h3>
        <p>Бывший звездный воевода, наставник Мирона. После столкновения с Чаромутой его разум был искажён, а тело усилено тёмной кибернетикой. Он считает, что единственный способ выжить — слиться с Чаромутой, а не бороться с ней. Пилотирует огромный корабль-крепость «Чёрная Туча».</p>
        
        <h3>ВАСИЛИСА ПРЕМУДРАЯ (союзник/наставник)</h3>
        <p>Учёная-киберволхв, оставшаяся на Сварожьем-Круге, чтобы поддерживать его защитные купола. Общается с Мироном через голограммы, направляет его и раскрывает тайны древних технологий.</p>
        
        <h3>КОЩЕЙ БЕССМЕРТНЫЙ (босс/нейтральная сила)</h3>
        <p>Древний маг, который десятилетия назад полностью перенёс своё сознание в сеть заброшенной космической станции-саркофага «Игла Кощеева». Он торгует информацией и редкими артефактами, но каждая его услуга имеет ужасную цену.</p>
        
        <h3>ЛЕШИЙ (босс/хранитель)</h3>
        <p>Не человек, а мощный кибернетический эко-интеллект, защищающий остатки терраформированного леса на астероиде «Боров». Видит в любом пришельце угрозу своей экосистеме. Управляет роями дронов-«кикимор» и может искажать пространство вокруг себя.</p>
    `,
    locations: `
        <h2>Декорации (Локации)</h2>
        <h3>ПЛАНЕТА-ГРАД СВАРОЖИЙ-КРУГ</h3>
        <p>Гигантский город-крепость, построенный вокруг древнего звездолёта-монастыря. Золотые купола соборов соседствуют с неоновыми вывесками и дымящими трубами плавилен. Повсюду висят голограммы ликов древних богов. Начинает разрушаться под напором Чаромуты.</p>
        
        <h3>КОСМИЧЕСКИЙ ПОЯС «КАМЕНИЯ НАВЕЙ»</h3>
        <p>Обломки разрушенных кораблей и астероидов, где прячутся пираты-«навьи» и космические чудовища. Здесь царят невесомость и опасность.</p>
        
        <h3>АСТЕРОИД «БОРОВ»</h3>
        <p>Осколок планеты, терраформированный в гигантский лес-биом. Деревья с корой из углеродного волокна, светящиеся грибы-фонари, ручьи из жидкого азота. Локация Лешего.</p>
        
        <h3>СТАНЦИЯ-САРКОФАГ «ИГЛА КОЩЕЕВА»</h3>
        <p>Мрачная, безвоздушная станция, похожая на гигантский кристалл. Внутри — лабиринты серверных комнат, где обитает дух Кощея. Главная головоломка — найти и уничтожить его «смерть» — зашифрованное ядро в одной из серверных.</p>
        
        <h3>РУИНЫ «ТРИДЕВЯТОГО ЦАРСТВА»</h3>
        <p>Заброшенная колония на огромной, покрытой льдом планете. Когда-то цветущий мир, теперь — ледяная пустыня, где в ковчегах-криокапсулах заморожены последние представители исчезнувшей цивилизации.</p>
        
        <h3>ИРИЙ-СТАНЦИЯ (финальная локация)</h3>
        <p>Мифическая станция, последний оплот. Представляет собой гигантский витражный купол, внутри которого воссоздана идиллическая Земля — зелёные поля, чистые реки и белокаменные города. Это символ надежды и цели всего путешествия.</p>
    `,
    artifacts: `
        <h2>Объекты и Артефакты</h2>
        <h3>АЛАТЫРЬ-КАМЕНЬ</h3>
        <p>Главный макгаффин. Древний артефакт, источник чистой энергии, способный «утихомирить» Чаромуту. Выглядит как небольшой камень с сияющей рунической надписью.</p>
        
        <h3>ПЕЧЬ-ЗВЕЗДОЛЁТ «БОГАТЫРСКАЯ ПОТЬ»</h3>
        <p>Корабль Мирона. Массивный, угловатый, с керамической обшивкой, похожей на печные изразцы. Летает на реактивной тяге, оставляя за собой след из искр и тепла.</p>
        
        <h3>ШАПКА-НЕВИДИМКА</h3>
        <p>Технологичное устройство, создающее поле оптического искажения, делающее героя невидимым для врагов на короткое время.</p>
        
        <h3>СКАТЕРТЬ-САМОБРАНКА</h3>
        <p>Портативный репликатор материи. Позволяет создавать боеприпасы, взрывчатку или лечебные отвары из подручного энергетического сырья.</p>
        
        <h3>МЕЧ-КЛАДЕНЕЦ</h3>
        <p>Легендарное оружие, которое можно найти в качестве апгрейда. Прорезает любую броню и щиты.</p>
    `,
    monsters: `
        <h2>Монстры и Препятствия</h2>
        <h3>ЧАРОМУТНЫЕ ИСКАЖЕНИЯ (окружающая опасность)</h3>
        <p>Аномалии пространства-времени. Могут замедлить время, отбросить героя, поменять гравитацию или создать зеркальные копии локации.</p>
        
        <h3>НАВЬИ (обычные враги)</h3>
        <p>Космические пираты и мародёры, чьи тела и сознание изуродованы Чаромутой. Носят рваную одежду поверх ржавой кибернетики. Вооружены энергетическими топорами и самодельными бластерами.</p>
        
        <h3>ЗМЕЙ ГОРЫНЫЧ (босс)</h3>
        <p>Не дракон, а гигантский космический кербер, созданный Чаромутой из обломков кораблей. Три головы — три независимых боевых модуля (плазмомёт, рейловушка, ракетная установка). Обитает в поясе «Камения Навей».</p>
        
        <h3>ВИЙ (мини-босс/препятствие)</h3>
        <p>Не существо, а мобильная зона подавления. Гигантская платформа с множеством «глаз»-сенсоров. Если герой попадает в его поле зрения, на него обрушивается мощнейший психо-эмоциональный пресс, замедляющий движение и отключающий щиты. Нужно прятаться в укрытиях или уничтожать сенсоры.</p>
        
        <h3>КИКИМОРЫ БОЛОТНЫЕ (враги-рои)</h3>
        <p>На астероиде «Боров». Не насекомые, а мелкие дроны-сапёры, маскирующиеся под кору и листву. Взрываются при приближении героя.</p>
        
        <h3>ТЕНЕТНИКИ (ловушки)</h3>
        <p>Паутина из энергетических нитей, опутывающая коридоры станций и обломки. Замедляет движение и наносит урон. Можно сжечь плазмомолотом.</p>
    `
};

startGameBtn.addEventListener('click', () => {
    initAudio(); // Initialize audio on user interaction
    playSquareWave(440, 0.1, 0.05); // Play a short beep when starting
    startScreen.style.display = 'none';
    loreScreen.style.display = 'none';
    gameCanvas.style.display = 'block';
    gameUI.style.display = 'block';
    startGameBtn.textContent = 'Продолжить игру';
    if (!gameInitialized) {
        initGame();
        gameInitialized = true;
    } else {
        gameLoop();
    }
});

document.querySelectorAll('.menuBtn').forEach(btn => {
    btn.addEventListener('click', () => {
        const section = btn.dataset.section;
        loreContent.innerHTML = loreData[section];
        startScreen.style.display = 'none';
        loreScreen.style.display = 'block';
    });
});

backBtn.addEventListener('click', () => {
    loreScreen.style.display = 'none';
    startScreen.style.display = 'flex';
});

pauseBtn.addEventListener('click', () => {
    isPaused = true;
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
    }
    gameCanvas.style.display = 'none';
    gameUI.style.display = 'none';
    startScreen.style.display = 'flex';
});

function initGame() {
    // Set canvas size to full window
    gameCanvas.width = window.innerWidth;
    gameCanvas.height = window.innerHeight;
    currentLevel = new Level1();
    currentLevel.init();
    gameLoop();

    // Add mouse and touch event listeners for character control
    gameCanvas.addEventListener('mousedown', (event) => {
        const rect = gameCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (event.button === 0) { // Left click for character movement/jump
            character.handleMouseDown(event);
        } else if (event.button === 2) { // Right click for molot throw
            event.preventDefault(); // Prevent context menu
            molot.throw(x, y);
        }
    });

    // Touch events for mobile
    gameCanvas.addEventListener('touchstart', (event) => {
        event.preventDefault();
        const rect = gameCanvas.getBoundingClientRect();
        const touch = event.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        // For mobile, use single touch for both movement and throw
        // First touch: move/jump, second touch: throw
        if (event.touches.length === 1) {
            character.handleTouchStart(touch);
        } else if (event.touches.length === 2) {
            molot.throw(x, y);
        }
    });

    gameCanvas.addEventListener('touchmove', (event) => {
        event.preventDefault();
        const touch = event.touches[0];
        character.handleTouchMove(touch);
    });

    gameCanvas.addEventListener('touchend', (event) => {
        event.preventDefault();
        character.handleTouchEnd();
    });
    gameCanvas.addEventListener('mousemove', (event) => {
        character.handleMouseMove(event);
    });
    gameCanvas.addEventListener('mouseup', () => {
        character.handleMouseUp();
    });

    // Prevent context menu on right click
    gameCanvas.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });
}
