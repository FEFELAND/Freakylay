class GameData {
    constructor(data) {
        data = JSON.parse(data);

        //Level
        this.InLevel = Helper.isset(data, 'InLevel', false);
        this.LevelPaused = Helper.isset(data, 'LevelPaused', false);
        this.LevelFinished = Helper.isset(data, 'LevelFinished', false);
        this.LevelFailed = Helper.isset(data, 'LevelFailed', false);
        this.LevelQuit = Helper.isset(data, 'LevelQuit', false);

        //Map
        this.SongName = Helper.isset(data, 'SongName', 'SongName');
        this.SongSubName = Helper.isset(data, 'SongSubName', 'SongSubName');
        this.SongAuthor = Helper.isset(data, 'SongAuthor', 'SongAuthor');
        this.Mapper = Helper.isset(data, 'Mapper', 'Mapper');
        this.BSRKey = Helper.isset(data, 'BSRKey', 'BSRKey');
        this.BPM = Helper.isset(data, 'BPM', 0);
        this.coverImage = Helper.isset(data, 'coverImage', 'tyGQRx5x_400x400.jpg');
        this.Length = Helper.isset(data, 'Length', 0);
        this.PreviousRecord = Helper.isset(data, 'PreviousRecord', 0);

        //Difficulty
        this.Difficulty = Helper.isset(data, 'Difficulty', 0);
        this.NJS = Helper.isset(data, 'NJS', 0.0);

        //Score
        this.FullCombo = Helper.isset(data, 'FullCombo', false);
        this.Score = Helper.isset(data, 'Score', 0);
        this.Combo = Helper.isset(data, 'Combo', 0);
        this.Misses = Helper.isset(data, 'Misses', 0);
        this.Accuracy = Helper.isset(data, 'Accuracy', 0.0);
        this.BlockHitScores = Helper.isset(data, 'BlockHitScores', []);
        this.PlayerHealth = Helper.isset(data, 'PlayerHealth', 0.0);

        //Modifiers
        let modifiers = Helper.isset(data, 'Modifiers', {});
        this.Modifiers = {
            instantFail: Helper.isset(modifiers, 'instaFail', false),
            batteryEnergy: Helper.isset(modifiers, 'batteryEnergy', false),
            disappearingArrows: Helper.isset(modifiers, 'disappearingArrows', false),
            ghostNotes: Helper.isset(modifiers, 'ghostNotes', false),
            fasterSong: Helper.isset(modifiers, 'fasterSong', false),
            noFail: Helper.isset(modifiers, 'noFail', false),
            noObstacles: Helper.isset(modifiers, 'noObstacles', false),
            noBombs: Helper.isset(modifiers, 'noBombs', false),
            slowerSong: Helper.isset(modifiers, 'slowerSong', false),
            noArrows: Helper.isset(modifiers, 'noArrows', false),
            practiceMode: Helper.isset(data, 'PraticeMode', false)
        };

        // Practice Mode
        let practiceModeModifiers = Helper.isset(data, 'PraticeModeModifiers', {});
        this.PracticeModeModifiers = {
            startSongTime: Helper.isset(practiceModeModifiers, 'startSongTime', 0.0),
            songSpeedMul: Helper.isset(practiceModeModifiers, 'songSpeedMul', 1.0),
        };

        // Misc
        this.Timer = Helper.isset(data, 'Timer', 0);
        this.PreviousBSR = Helper.isset(data, 'PreviousBSR', 0);
    }

    difficultyString() {
        switch (this.Difficulty) {
            case 1:
                return 'Easy';
            case 3:
                return 'Normal';
            case 5:
                return 'Hard';
            case 7:
                return 'Expert';
            case 9:
                return 'Expert+';
            default:
                return 'Difficulty: ' + this.Difficulty;
        }
    }
}

class Helper {
    static SvgNamespace = 'http://www.w3.org/2000/svg';

    static element(selector) {
        return document.querySelector('#' + selector);
    }

    static create(tag, namespace = '') {
        if (namespace === '') {
            return document.createElement(tag);
        }

        return document.createElementNS(namespace, tag);
    }

    static svg(tag) {
        return Helper.create(tag, this.SvgNamespace);
    }

    static addClass(element, className) {
        if (!element.classList.contains(className)) {
            element.classList.add(className);
        }
    }

    static removeClass(element, className) {
        let classes = element.className.split(' ').filter(v => v !== className);
        element.className = classes.filter(((value, index, array) => array.indexOf(value) === index)).join(' ');
    }

    static isset(data, val, def) {
        return (typeof data[val] !== 'undefined' && data[val] !== null) ? data[val] : def;
    }

    static clamp(input, min, max) {
        return Math.min(max, Math.max(min, input));
    }

    static visibility(element, visible) {
        element.style.visibility = visible ? 'visible' : 'hidden';
    }

    static display(element, display) {
        element.style.display = display ? 'block' : 'none';
    }

    static fromUrlColor(input) {
        if (input.substring(0, 3) === 'rgb') {
            return input;
        }

        if (input.match(/[^0-9A-Fa-f]/g) === null) {
            return '#' + input;
        }

        return '#000000';
    }

    static toUrlColor(input) {
        if (input.substring(0, 1) === '#') {
            return input.substring(1);
        }
        if (input.substring(0, 3) === 'rgb') {
            return input;
        }

        return '000000';
    }
}

class Connection {
    constructor() {
        this.connect();
    }

    connect() {
        this.socket = new WebSocket('ws:127.0.0.1:2946/BSDataPuller');
        this.socket.onopen = this.onOpen;
        this.socket.onmessage = this.onMessage;
        this.socket.onclose = this.onClose;
    }

    onOpen(message) {
        // ???
    }

    onClose() {
        window.setTimeout(() => {
            connection.connect();
        }, 5000);
    }

    onMessage(message) {
        let gameData = new GameData(message.data);
        ui.update(gameData);
    }
}

class CircleBar {
    constructor(parentElement, textCallback, size = 90, padding = 10) {
        this.parent = parentElement;
        this.callback = textCallback;

        let half = size / 2;
        let radius = half - padding;

        this.circumference = radius * Math.PI * 2;
        this.text = Helper.create('div');
        this.bar = this.getCircle(half, radius);
        this.bar.style.strokeDasharray = this.circumference + 'px , ' + this.circumference + 'px';

        let svg = Helper.svg('svg');
        svg.style.width = size + 'px';
        svg.style.height = size + 'px';

        let remaining = this.getCircle(half, radius);

        Helper.addClass(remaining, 'remaining');
        Helper.addClass(this.bar, 'progress');
        Helper.addClass(svg, 'roundBar');
        Helper.addClass(this.text, 'progressInfo');

        svg.append(remaining, this.bar);

        this.parent.append(this.text, svg);
    }

    getCircle(size, radius) {
        let c = Helper.svg('circle');

        c.cx.baseVal.value = size;
        c.cy.baseVal.value = size;
        c.r.baseVal.value = radius;

        return c;
    }

    setProgress(current, total) {
        let progress = current / total;
        this.bar.style.strokeDashoffset = this.getCircumference(progress);

        if (typeof this.callback === 'function') {
            this.setText(this.callback((Math.round(progress * 10000) / 100).toFixed(2)));
        }
    }

    setText(text) {
        this.text.innerHTML = text;
    }

    getCircumference(input) {
        return Helper.clamp((1 - input) * this.circumference, 0, this.circumference) + 'px';
    }
}

class ColorInput {

    static Instance = 0;

    constructor(color, changeevent) {

        this.instance = ColorInput.Instance;
        ColorInput.Instance++;

        this.changeEvent = changeevent;

        let r, g, b, a, prefix;
        if (color.substring(0, 1) === '#') {
            color = color.length === 7 ? color + 'FF' : color;
            r = parseInt(color.substring(1, 3), 16);
            g = parseInt(color.substring(3, 5), 16);
            b = parseInt(color.substring(5, 7), 16);
            a = parseInt(color.substring(7, 9), 16);
        } else {
            color = color.replace(/ /g, '').split(',');
            color[color.length - 1] = color[color.length - 1].substring(0, color[color.length - 1].length - 1);

            prefix = color[0].substring(0, 4).toLowerCase();

            color[0] = color[0].substring(3);

            if (prefix === 'rgb') {
                color[0] = color[0].substring(1);
                a = 100;
            } else {
                color[0] = color[0].substring(2);
                a = parseFloat(color[3]) * 255;
            }

            r = parseInt(color[0]);
            g = parseInt(color[1]);
            b = parseInt(color[2]);
        }

        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    createInputMenu(element) {
        this.rElement = this.input(this.r, 'r');
        this.gElement = this.input(this.g, 'g');
        this.bElement = this.input(this.b, 'b');
        this.aElement = this.input(this.a, 'a');

        this.rElement.onchange = () => {
            this.internalChange();
        };
        this.gElement.onchange = () => {
            this.internalChange();
        };
        this.bElement.onchange = () => {
            this.internalChange();
        };
        this.aElement.onchange = () => {
            this.internalChange();
        };

        this.rElement.onkeyup = this.rElement.onchange;
        this.gElement.onkeyup = this.gElement.onchange;
        this.bElement.onkeyup = this.bElement.onchange;
        this.aElement.onkeyup = this.aElement.onchange;

        element.append(
            this.label('R:', this.rElement.id),
            this.rElement,
            this.label('G:', this.gElement.id),
            this.gElement,
            this.label('B:', this.bElement.id),
            this.bElement,
            this.label('A:', this.aElement.id),
            this.aElement,
        );
    }

    internalChange() {
        this.changeEvent(this.getColor());
    }

    getColor() {
        let r = parseInt(this.rElement.value);
        let g = parseInt(this.gElement.value);
        let b = parseInt(this.bElement.value);
        let a = parseInt(this.aElement.value);

        if (a === 255) {
            return '#' + this.to2digitHex(r) + this.to2digitHex(g) + this.to2digitHex(b);
        }

        return 'rgba(' + [r, g, b, a / 255].join(', ') + ')';
    }

    to2digitHex(input) {
        input = input.toString(16);
        return input.length === 1 ? '0' + input : input;
    }

    input(value, id, isAlpha = false) {
        let i = Helper.create('input');
        i.type = 'number';
        i.min = 0;
        i.max = isAlpha ? 100 : 255;
        i.value = value;
        i.id = this.instance + id;
        i.style.width = '40px';

        return i;
    }

    label(text, id) {
        let l = Helper.create('label');
        l.for = id;
        l.innerHTML = text;

        return l;
    }
}

class UI {
    constructor() {
        this.urlParamStrings = {
            backgroundColor: 'bgcolor',
            textColor: 'color',
            shortModifierNames: 'shortModifierNames',
            showPrevBsr: 'showPrevBsr',
        }

        this.urlParams = new URLSearchParams(location.search);

        this.options = {
            backgroundColor: Helper.fromUrlColor(this.getUrlParam(this.urlParamStrings.backgroundColor, 'rgba(255, 133, 255, 0.7)')),
            textColor: Helper.fromUrlColor(this.getUrlParam(this.urlParamStrings.textColor, 'ffffff')),
            shortModifierNames: this.urlParams.has(this.urlParamStrings.shortModifierNames),
            showPrevBsr: this.urlParams.has(this.urlParamStrings.showPrevBsr),
            previewMode: this.urlParams.has('options')
        };

        document.body.ondblclick = () => {
            this.options.previewMode = true;
            this.appendNewStyles();
        };

        let oBGC = new ColorInput(this.options.backgroundColor, c => {
            this.options.backgroundColor = c;
            this.appendNewStyles();
        });

        let oTC = new ColorInput(this.options.textColor, c => {
            this.options.textColor = c;
            this.appendNewStyles();
        });

        let oSMN = Helper.element(this.urlParamStrings.shortModifierNames);
        oSMN.checked = this.options.shortModifierNames;
        oSMN.onclick = (e) => {
            this.options.shortModifierNames = e.target.checked;
            this.appendNewStyles();
        };

        let oPB = Helper.element(this.urlParamStrings.showPrevBsr);
        oPB.checked = this.options.showPrevBsr;
        oPB.onclick = (e) => {
            this.options.showPrevBsr = e.target.checked;
            this.appendNewStyles();
        };

        oBGC.createInputMenu(Helper.element(this.urlParamStrings.backgroundColor));
        oTC.createInputMenu(Helper.element(this.urlParamStrings.textColor));

        Helper.element('testBg').onclick = (e) => {
            document.body.style.backgroundImage = e.target.checked ? 'url(beat-saber-5.jpg)' : 'none';
        };

        this.getUiElements();

        this.health.setProgress(0, 1);
        this.accuracy.setProgress(0, 100);
        this.setTime(0, 60)

        this.uiShown = true;
        this.internalTimer = -1;
        this.internalInterval = 0;

        this.appendNewStyles();
    }

    previewGameData() {
        let g = new GameData('{}');
        g.PlayerHealth = .5;
        g.Length = 120;
        g.Timer = 10;
        g.Accuracy = 50;
        g.Score = 1234567;
        g.NJS = 20;
        g.BPM = 180;
        g.PreviousBSR = 'affa';
        g.BSRKey = '1234';
        g.Difficulty = 9;
        g.Modifiers.batteryEnergy = true;
        g.Modifiers.disappearingArrows = true;
        g.Modifiers.fasterSong = true;
        g.Modifiers.ghostNotes = true;
        g.Modifiers.instantFail = true;
        g.Modifiers.noArrows = true;
        g.Modifiers.noBombs = true;
        g.Modifiers.noFail = true;
        g.Modifiers.noObstacles = true;
        g.Modifiers.practiceMode = true;
        g.Modifiers.slowerSong = true;
        g.PracticeModeModifiers.songSpeedMul = 1.2;
        g.PracticeModeModifiers.startSongTime = 10;
        this.update(g);
    }

    getUiElements() {
        this.modifiersHolder = Helper.element('modifiers');
        this.modifiers = {
            instantFail: Helper.element('IF'),
            batteryEnergy: Helper.element('BE'),
            disappearingArrows: Helper.element('DA'),
            ghostNotes: Helper.element('GN'),
            fasterSong: Helper.element('FS'),
            noFail: Helper.element('NF'),
            noObstacles: Helper.element('NO'),
            noBombs: Helper.element('NB'),
            slowerSong: Helper.element('SS'),
            noArrows: Helper.element('NA'),
            practiceMode: Helper.element('PM'),
            songSpeed: Helper.element('songSpeed')
        };

        this.timer = new CircleBar(Helper.element('timerHolder'));

        this.health = new CircleBar(Helper.element('healthHolder'), percent => {
            return '<small>Health</small>' + parseFloat(percent).toFixed(0) + '%';
        });

        this.accuracy = new CircleBar(Helper.element('accuracyHolder'), percent => {
            return '<small>Accuracy</small>' + percent + '%';
        });

        this.songInfoHolder = Helper.element('songInfo');
        this.beatMapCover = Helper.element('beatMapCover');
        this.songInfo = {
            bsr: Helper.element('bsr'),
            mapper: Helper.element('mapper'),
            difficulty: Helper.element('difficulty'),
            artist: Helper.element('artist'),
            songName: Helper.element('mapName'),
            cover: Helper.element('cover')
        };

        this.dataHolder = Helper.element('downSection');
        this.data = {
            score: Helper.element('score'),
            combo: Helper.element('combo'),
            previousBSR: Helper.element('previousBSR'),
            njs: Helper.element('njs'),
            bpm: Helper.element('bpm'),
        };

        this.optionsElement = Helper.element('options');
        this.urlText = Helper.element('urlText');
    }

    appendNewStyles() {
        document.body.style.color = this.options.textColor;
        document.querySelectorAll('.roundBar circle').forEach(element => {
            element.style.stroke = this.options.textColor;
        }, this);
        document.querySelectorAll('.backGroundColor').forEach(element => {
            element.style.backgroundColor = this.options.backgroundColor;
        }, this);

        if (this.options.shortModifierNames) {
            this.modifiers.instantFail.innerHTML = 'IF';
            this.modifiers.batteryEnergy.innerHTML = 'BE';
            this.modifiers.disappearingArrows.innerHTML = 'DA';
            this.modifiers.ghostNotes.innerHTML = 'GN';
            this.modifiers.fasterSong.innerHTML = 'FS';
            this.modifiers.noFail.innerHTML = 'NF';
            this.modifiers.noObstacles.innerHTML = 'NO';
            this.modifiers.noBombs.innerHTML = 'NB';
            this.modifiers.slowerSong.innerHTML = 'SS';
            this.modifiers.noArrows.innerHTML = 'NA';
            this.modifiers.practiceMode.innerHTML = 'PM';
        } else {
            this.modifiers.instantFail.innerHTML = 'Insta Fail';
            this.modifiers.batteryEnergy.innerHTML = 'Battery Energy';
            this.modifiers.disappearingArrows.innerHTML = 'Disappearing Arrows';
            this.modifiers.ghostNotes.innerHTML = 'Ghost Notes';
            this.modifiers.fasterSong.innerHTML = 'Faster Song';
            this.modifiers.noFail.innerHTML = 'No Fail';
            this.modifiers.noObstacles.innerHTML = 'No Obstacles';
            this.modifiers.noBombs.innerHTML = 'No Bombs';
            this.modifiers.slowerSong.innerHTML = 'Slower Song';
            this.modifiers.noArrows.innerHTML = 'No Arrows';
            this.modifiers.practiceMode.innerHTML = 'Practice Mode';
        }

        Helper.visibility(this.data.previousBSR, this.options.showPrevBsr);
        Helper.display(this.optionsElement, this.options.previewMode);

        let options = [
            this.urlParamStrings.backgroundColor + '=' + Helper.toUrlColor(this.options.backgroundColor),
            this.urlParamStrings.color + '=' + Helper.toUrlColor(this.options.textColor)
        ];

        if (this.options.showPrevBsr) {
            Helper.removeClass(this.beatMapCover, "borderRadiusTopRight");
            options.push(this.urlParamStrings.showPrevBsr);
        } else {
            Helper.addClass(this.beatMapCover, "borderRadiusTopRight");
        }

        if (this.options.shortModifierNames) {
            options.push(this.urlParamStrings.shortModifierNames);
        }

        let optionsString = options.length > 0 ? '?' + options.join('&') : '';

        this.urlText.innerHTML = window.location.protocol + '//' + window.location.host + window.location.pathname + optionsString;
        this.previewGameData();
    }

    getUrlParam(key, def) {
        if (!this.urlParams.has(key)) {
            return def;
        }
        let x = this.urlParams.get(key);
        return x === null ? def : x;
    }

    setTime(current, total) {
        if (current > total) {
            // uhm?
            current = total;
        }

        //this.timer.setText('<small>Time</small>' + this.getDate(current) + '<br>' + this.getDate(total));
        this.timer.setText(this.getDate(current) + '<br>' + this.getDate(total));
        this.timer.setProgress(current, total);
    }

    getDate(input) {
        let seconds = input % 60;
        let minutes = Math.floor(input / 60);

        seconds = seconds < 10 ? '0' + seconds : seconds;

        return minutes < 0 ? seconds : minutes + ':' + seconds;
    }

    update(gameData) {
        this.gameData = gameData;
        const inactiveClass = 'inactive';

        // calculate map length
        let mapLength = this.gameData.Length;
        if (this.gameData.Modifiers.practiceMode) {
            mapLength = Math.trunc(this.gameData.Length / this.gameData.PracticeModeModifiers.songSpeedMul);
        } else if (this.gameData.Modifiers.fasterSong || this.gameData.Modifiers.slowerSong) {
            mapLength = Math.trunc(this.gameData.Length * (this.gameData.Modifiers.fasterSong ? .8 : 1.15));
        }

        // toggle ui
        if (this.options.previewMode || this.gameData.InLevel && !this.uiShown) {

            Helper.removeClass(this.songInfoHolder, inactiveClass);
            Helper.removeClass(this.dataHolder, inactiveClass);
            Helper.removeClass(this.modifiersHolder, inactiveClass);

            this.uiShown = true;
            this.internalTimer = this.gameData.Timer - 1;

            if (this.options.previewMode) {
                this.setTime(mapLength / 2, mapLength)
            } else {
                this.internalInterval = window.setInterval(() => {
                    if (this.uiShown && !this.gameData.LevelPaused && !this.gameData.LevelFailed && !this.gameData.LevelFailed && !this.gameData.LevelQuit) {
                        this.internalTimer++;
                    } else if (this.gameData.Timer > this.internalTimer) {
                        this.internalTimer = this.gameData.Timer - 1;
                    }
                    this.setTime(this.internalTimer, mapLength);
                }, 1000);
            }
        } else if (!this.gameData.InLevel && this.uiShown) {
            Helper.addClass(this.songInfoHolder, inactiveClass);
            Helper.addClass(this.dataHolder, inactiveClass);
            Helper.addClass(this.modifiersHolder, inactiveClass);
            this.uiShown = false;

            window.clearInterval(this.internalInterval);
        }

        // modifiers panel
        let allModifiersOff = true;
        for (let modifier in this.gameData.Modifiers) {

            // noinspection JSUnfilteredForInLoop
            if (this.gameData.Modifiers[modifier]) {
                allModifiersOff = false;
            }

            // noinspection JSUnfilteredForInLoop
            Helper.display(this.modifiers[modifier], this.gameData.Modifiers[modifier]);
        }

        Helper.display(this.modifiers.practiceMode, this.gameData.Modifiers.practiceMode);

        // practice
        if (this.gameData.Modifiers.practiceMode) {
            allModifiersOff = false;

            Helper.display(this.modifiers.fasterSong, this.gameData.PracticeModeModifiers.songSpeedMul > 1);
            Helper.display(this.modifiers.slowerSong, this.gameData.PracticeModeModifiers.songSpeedMul < 1);

            let readableSpeed = this.gameData.PracticeModeModifiers.songSpeedMul * 100 - 100;
            let identifier = readableSpeed > 0 ? '+' : '';

            if (readableSpeed === 100) {
                Helper.display(this.modifiers.songSpeed, false);
            } else {
                Helper.display(this.modifiers.songSpeed, true);
                this.modifiers.songSpeed.innerHTML = (this.options.shortModifierNames ? '' : 'Speed: ') + identifier + readableSpeed + '%';
            }
            Helper.display(this.modifiers.songSpeed, this.gameData.Modifiers.songSpeedMul !== 1);
        } else {
            Helper.display(this.modifiers.songSpeed, false);
        }

        Helper.visibility(this.modifiersHolder, !allModifiersOff);

        // generic song info
        this.hideSetting(this.songInfo.bsr, this.gameData.BSRKey, 'BSR: ');
        this.hideSetting(this.songInfo.mapper, this.gameData.Mapper);
        this.hideSetting(this.songInfo.artist, this.gameData.SongAuthor);
        this.hideSetting(this.songInfo.songName, this.gameData.SongName);

        if (this.gameData.SongName.length > 35) {
            Helper.addClass(this.songInfo.songName, 'small');
        } else {
            Helper.removeClass(this.songInfo.songName, 'small');
        }

        this.songInfo.difficulty.innerHTML = this.gameData.difficultyString();

        if (this.gameData.SongSubName.length > 0) {
            let sub = '<small>' + this.gameData.SongSubName + '</small>';
            if (this.gameData.SongAuthor.length === 0) {
                this.songInfo.artist.innerHTML = sub;
            } else {
                this.songInfo.artist.innerHTML += ' ' + sub;
            }
        }

        this.songInfo.cover.style.backgroundImage = 'url("' + this.gameData.coverImage + '")';

        // down section
        this.accuracy.setProgress(this.gameData.Accuracy.toFixed(2), 100)

        this.data.bpm.innerHTML = '<span>BPM</span>' + this.gameData.BPM;
        this.data.combo.innerHTML = '<span>Combo</span>' + this.gameData.Combo;
        this.data.njs.innerHTML = '<span>NJS</span>' + this.gameData.NJS;
        this.data.previousBSR.innerHTML = this.gameData.PreviousBSR.length > 0 ? 'Prev-BSR: ' + this.gameData.PreviousBSR : '';
        this.data.score.innerHTML = new Intl.NumberFormat('en-US').format(this.gameData.Score).replace(/,/g, ' ');

        if (this.gameData.BSRKey.length === 0) {
            Helper.addClass(this.beatMapCover, 'borderRadiusTopLeft');
        } else {
            Helper.removeClass(this.beatMapCover, 'borderRadiusTopLeft');
        }

        this.health.setProgress(this.gameData.Modifiers.practiceMode ? 1 : this.gameData.PlayerHealth, 1);

        // block hit scores?
        // full combo?
        // misses?
        // previous record?
    }

    hideSetting(element, value, prefix = '') {
        if (value.length > 0) {
            Helper.visibility(element, true);
            element.innerHTML = prefix + value;
            return
        }

        Helper.visibility(element, false);
    }

    init() {
        if (this.options.previewMode) {
            this.previewGameData();
        } else {
            let g = new GameData('{}');
            g.InLevel = false;
            this.update(g);
        }
        connection = new Connection();
    }
}

let connection;
let ui;

window.onload = function () {
    ui = new UI();
    ui.init();
}