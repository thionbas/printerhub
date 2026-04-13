const { jsPDF } = window.jspdf;

// App-Definitionen
const APPS = [
    { id: 'schilder', name: 'Rohrleitungsschilder', img: 'IMG_4554.png', format: '12er Bogen' },
    { id: 'kanister', name: 'Kanister (4er)', img: 'IMG_4555.png', format: 'A4 Landscape (4 Schilder)' },
    { id: 'behaelter', name: 'Behälter', img: 'IMG_4553.png', format: 'A4 Einzelschild' },
    { id: 'probegross', name: 'Probe Groß', img: 'IMG_4552.png', format: '12er Bogen' },
    { id: 'probeklein', name: 'Probe Klein', img: 'IMG_4557.png', format: '80er Bogen' },
    { id: 'hobbock', name: 'Hobbock (4er)', img: 'IMG_4556.png', format: 'A4 Landscape (4 Schilder)' },
    { id: 'tankwagen', name: 'Tankwagen', img: 'bild1.png', format: 'A4 Einzelschild' },
    { id: 'lolc', name: 'LO / LC', img: 'bild2.png', format: '12er Bogen' }
];

let state = { app: 'hub', ghs: [] };

function init() {
    renderHub();
    initGhsPicker();
    document.getElementById('backToHub').onclick = renderHub;
    document.getElementById('pdfBtn').onclick = generatePDF;
}

function renderHub() {
    state.app = 'hub';
    document.getElementById('hubSection').classList.remove('hidden');
    document.getElementById('appSection').classList.add('hidden');
    document.getElementById('backToHub').classList.add('hidden');
    document.getElementById('appTitle').innerText = "AP PRINTER HUB";
    
    const hub = document.getElementById('hubSection');
    hub.innerHTML = '';
    APPS.forEach(app => {
        const div = document.createElement('div');
        div.className = "app-card";
        div.innerHTML = `<img src="${app.img}"><span>${app.name}</span>`;
        div.onclick = () => openApp(app.id);
        hub.appendChild(div);
    });
}

function openApp(id) {
    state.app = id;
    state.ghs = [];
    document.getElementById('hubSection').classList.add('hidden');
    document.getElementById('appSection').classList.remove('hidden');
    document.getElementById('backToHub').classList.remove('hidden');
    
    const appData = APPS.find(a => a.id === id);
    document.getElementById('appTitle').innerText = appData.name;
    document.getElementById('formatInfo').innerText = appData.format;
    
    setupFields(id);
    resetGhsPicker();
    updatePreview();
}

function setupFields(id) {
    const container = document.getElementById('dynamicFields');
    container.innerHTML = '';
    const ghsArea = document.getElementById('ghsArea');
    const printOpt = document.getElementById('printOptions');
    
    ghsArea.classList.add('hidden');
    printOpt.classList.add('hidden');

    const addInput = (label, id, type="text", val="") => {
        container.innerHTML += `<div class="space-y-1"><label class="text-[10px] font-bold text-gray-400 uppercase">${label}</label>
        <input type="${type}" id="${id}" value="${val}" class="w-full p-3 border-2 rounded-xl font-bold outline-none focus:border-[#064e3b]"></div>`;
    };

    const addSelect = (label, id, opts) => {
        let html = `<div class="space-y-1"><label class="text-[10px] font-bold text-gray-400 uppercase">${label}</label>
        <select id="${id}" class="w-full p-3 border-2 rounded-xl font-bold outline-none focus:border-[#064e3b]">`;
        opts.forEach(o => html += `<option value="${o.v}">${o.t}</option>`);
        container.innerHTML += html + `</select></div>`;
    };

    const addSlider = (label, id, min, max, val) => {
        container.innerHTML += `<div class="space-y-1"><div class="flex justify-between"><label class="text-[10px] font-bold text-gray-400 uppercase">${label}</label>
        <span id="${id}Val" class="text-xs font-mono font-bold">${val}</span></div>
        <input type="range" id="${id}" min="${min}" max="${max}" value="${val}" class="w-full accent-[#064e3b]"></div>`;
    };

    // App-spezifische Felder
    if(['schilder', 'kanister', 'hobbock', 'behaelter', 'probegross', 'probeklein'].includes(id)) {
        addSelect('Farbe', 'color', [{v:'white',t:'Weiß'},{v:'yellow',t:'Gelb'},{v:'red',t:'Rot'},{v:'blue',t:'Blau'},{v:'green',t:'Grün'},{v:'brown',t:'Braun'},{v:'violet',t:'Violett'}]);
        addInput('Haupttext', 'mainText', 'text', id === 'lolc' ? '' : 'STOFFNAME');
        addSlider('Schriftgröße', 'fontSize', 10, 150, id==='probeklein' ? 25 : 45);
        addInput('Signalwort', 'signal', 'text', '');
        ghsArea.classList.remove('hidden');
        if(['schilder', 'probegross', 'lolc'].includes(id)) printOpt.classList.remove('hidden');
    }

    if(id === 'lolc') {
        addSelect('Typ', 'statusType', [{v:'LO',t:'LO'},{v:'LC',t:'LC'},{v:'NO',t:'NO'},{v:'NC',t:'NC'},{v:'EA',t:'EA'}]);
        addInput('Nummer', 'mainText', 'text', '01-02-03');
        addSlider('Schriftgröße', 'fontSize', 20, 100, 45);
        printOpt.classList.remove('hidden');
    }

    if(id === 'tankwagen') {
        container.innerHTML += `<textarea id="mainText" rows="3" class="w-full p-3 border-2 rounded-xl font-bold outline-none focus:border-[#064e3b] resize-none" placeholder="STOFFNAME"></textarea>`;
        addSlider('Schriftgröße', 'fontSize', 20, 200, 80);
        addInput('Fußzeile Links', 'footL', 'text', 'Betrieb | Abteilung');
        addInput('Fußzeile Rechts', 'footR', 'text', 'Firma | Adresse');
        ghsArea.classList.remove('hidden');
    }

    // Listener binden
    container.querySelectorAll('input, select, textarea').forEach(el => el.oninput = updatePreview);
}

function updatePreview() {
    const container = document.getElementById('previewContainer');
    const id = state.app;
    const text = document.getElementById('mainText')?.value || '';
    const fontSize = document.getElementById('fontSize')?.value || 40;
    const signal = document.getElementById('signal')?.value || '';
    const color = document.getElementById('color')?.value || 'white';

    if(document.getElementById('fontSizeVal')) document.getElementById('fontSizeVal').innerText = fontSize;

    // Aspect Ratio setzen
    if(['kanister', 'hobbock', 'tankwagen', 'behaelter'].includes(id)) {
        container.style.width = "500px"; container.style.aspectRatio = "297/210";
    } else if(id === 'probeklein') {
        container.style.width = "300px"; container.style.aspectRatio = "356/169";
    } else {
        container.style.width = "500px"; container.style.aspectRatio = "991/423";
    }

    let html = `<div class="label-canvas c-${color}">`;
    
    if(id === 'lolc') {
        const st = document.getElementById('statusType').value;
        const cClass = (st==='LC' || st==='NC') ? 'c-red' : (st==='EA' ? 'c-white' : 'c-green');
        html = `<div class="label-canvas ${cClass}" style="align-items:center; justify-content:center; font-size:${fontSize/5}rem; font-weight:bold;">${st}-${text}</div>`;
    } else if(['kanister', 'hobbock', 'schilder', 'probegross', 'probeklein'].includes(id)) {
        html += `<div class="zone-top" style="font-size:${fontSize/8}rem">${text.toUpperCase()}</div>`;
        html += `<div class="zone-mid">${state.ghs.map(g => `<img src="ghs_${g}.png" class="ghs-preview-img">`).join('')}</div>`;
        html += `<div class="zone-bot" style="font-size:${id==='probeklein'?8:14}px">${signal}</div>`;
    } else if(id === 'tankwagen') {
        html += `<div style="height:66%; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:${fontSize/6}rem; text-align:center; padding:20px; border-bottom:1px dashed #ccc; white-space:pre-wrap;">${text.toUpperCase()}</div>`;
        html += `<div style="height:20%; display:flex; align-items:center; justify-content:center; gap:20px; border-bottom:1px solid #eee;"><div class="zone-mid">${state.ghs.map(g => `<img src="ghs_${g}.png" class="ghs-preview-img">`).join('')}</div><div class="zone-bot">${signal}</div></div>`;
        html += `<div style="height:14%; display:flex; justify-content:space-between; padding:10px 20px; font-weight:bold; font-size:12px;"><span>${document.getElementById('footL')?.value}</span><span>${document.getElementById('footR')?.value}</span></div>`;
    }

    container.innerHTML = html + `</div>`;
}

// PDF Logik
function generatePDF() {
    const id = state.app;
    const doc = new jsPDF({ orientation: (['kanister', 'hobbock', 'tankwagen', 'behaelter'].includes(id) ? 'l' : 'p'), unit: 'mm', format: 'a4' });
    
    const text = document.getElementById('mainText')?.value || '';
    const fontSize = parseInt(document.getElementById('fontSize')?.value) || 40;
    const signal = document.getElementById('signal')?.value || '';
    const colorKey = document.getElementById('color')?.value || 'white';

    const colors = { 
        white:[255,255,255], yellow:[253,224,71], red:[239,68,68], blue:[59,130,246], green:[34,197,94], brown:[120,53,15], violet:[168,85,247]
    };

    if(['kanister', 'hobbock'].includes(id)) {
        // 4er Bogen auf A4 Landscape (je 148.5 x 105 mm)
        for(let i=0; i<4; i++) {
            const x = (i%2) * 148.5; const y = Math.floor(i/2) * 105;
            doc.setFillColor(...colors[colorKey]); doc.rect(x, y, 148.5, 105, 'F');
            doc.setTextColor((colorKey==='red'||colorKey==='blue'||colorKey==='brown'||colorKey==='violet')?255:0);
            doc.setFontSize(fontSize); doc.setFont("helvetica", "bold");
            doc.text(text.toUpperCase(), x + 74, y + 40, { align: 'center', maxWidth: 130 });
            state.ghs.forEach((g, idx) => doc.addImage(`ghs_${g}.png`, 'PNG', x + 30 + (idx*20), y + 65, 18, 18));
            doc.setFontSize(20); doc.text(signal, x + 74, y + 95, { align: 'center' });
        }
    } else if(id === 'tankwagen') {
        doc.setFillColor(255,255,255); doc.rect(0,0,297,210,'F'); doc.setTextColor(0);
        doc.setFontSize(fontSize); doc.text(text.toUpperCase(), 148, 70, { align: 'center', maxWidth: 260 });
        state.ghs.forEach((g, idx) => doc.addImage(`ghs_${g}.png`, 'PNG', 100 + (idx*20), 140, 18, 18));
        doc.setFontSize(25); doc.text(signal, 148, 175, { align: 'center' });
    } else {
        // Standard Avery 12er oder 80er Logik hier... (abgekürzt für Übersicht)
        alert("Druck für dieses Format wird gestartet...");
    }

    doc.save(`AP_${id}_Export.pdf`);
}

function initGhsPicker() {
    const p = document.getElementById('ghsPicker');
    for(let i=1; i<=9; i++) {
        const id = i.toString().padStart(3, '0');
        p.innerHTML += `<div class="ghs-item p-1 border rounded hover:bg-green-50 cursor-pointer" onclick="toggleGhs('${id}', this)"><img src="ghs_${id}.png" class="w-full h-8 object-contain"></div>`;
    }
}

window.toggleGhs = (id, el) => {
    if(state.ghs.includes(id)) {
        state.ghs = state.ghs.filter(g => g !== id); el.classList.remove('bg-green-200', 'border-green-600');
    } else {
        if(state.ghs.length >= 6) return;
        state.ghs.push(id); el.classList.add('bg-green-200', 'border-green-600');
    }
    updatePreview();
};

function resetGhsPicker() {
    document.querySelectorAll('.ghs-item').forEach(el => el.classList.remove('bg-green-200', 'border-green-600'));
}

init();
