const { jsPDF } = window.jspdf;
const APPS = [
    { id: 'schilder', name: 'Rohrleitungsschilder', img: 'IMG_4554.png', type: '12er' },
    { id: 'kanister', name: 'Kanister', img: 'IMG_4555.png', type: '4er' },
    { id: 'behaelter', name: 'Behälter', img: 'IMG_4553.png', type: 'a4l' },
    { id: 'hobbock', name: 'Hobbock', img: 'IMG_4556.png', type: '4er' },
    { id: 'tankwagen', name: 'Tankwagen', img: 'bild1.png', type: 'a4l' },
    { id: 'lolc', name: 'LO / LC', img: 'bild2.png', type: '12er' }
];

let state = { app: 'hub', ghs: [], mode: 'single' };

function renderHub() {
    state.app = 'hub';
    document.getElementById('hubSection').classList.remove('hidden');
    document.getElementById('appSection').classList.add('hidden');
    document.getElementById('backToHub').classList.add('hidden');
    const hub = document.getElementById('hubSection');
    hub.innerHTML = '';
    APPS.forEach(a => {
        hub.innerHTML += `<div class="app-card" onclick="openApp('${a.id}')"><img src="${a.img}"><span>${a.name}</span></div>`;
    });
}

function openApp(id) {
    state.app = id; state.ghs = []; state.mode = 'single';
    document.getElementById('hubSection').classList.add('hidden');
    document.getElementById('appSection').classList.remove('hidden');
    document.getElementById('backToHub').classList.remove('hidden');
    setupForm(id);
    updatePreview();
}

function setupForm(id) {
    const fields = document.getElementById('dynamicFields');
    const ghsArea = document.getElementById('ghsArea');
    const batchArea = document.getElementById('batchArea');
    fields.innerHTML = ''; ghsArea.classList.add('hidden'); batchArea.classList.add('hidden');

    if(id === 'lolc') {
        fields.innerHTML += `<select id="statusType" class="w-full p-2 border-2 rounded font-bold"><option value="LO">LO</option><option value="LC">LC</option><option value="NO">NO</option><option value="NC">NC</option><option value="EA">EA</option></select>`;
        fields.innerHTML += `<div class="flex gap-2"><button onclick="setMode('single')" class="flex-1 p-1 bg-gray-200 rounded text-xs font-bold">Einzel</button><button onclick="setMode('list')" class="flex-1 p-1 bg-gray-200 rounded text-xs font-bold">Liste</button></div>`;
        fields.innerHTML += `<textarea id="mainText" placeholder="Nummer eingeben" class="w-full p-2 border-2 rounded font-bold resize-none"></textarea>`;
        fields.innerHTML += `<input type="range" id="fontSize" min="10" max="100" value="40" class="w-full accent-[#064e3b]">`;
        batchArea.classList.remove('hidden');
    } else {
        fields.innerHTML += `<select id="color" class="w-full p-2 border-2 rounded font-bold"><option value="white">Weiß</option><option value="yellow">Gelb</option><option value="red">Rot</option><option value="green">Grün</option><option value="blue">Blau</option></select>`;
        fields.innerHTML += `<input type="text" id="mainText" placeholder="Text" class="w-full p-2 border-2 rounded font-bold">`;
        fields.innerHTML += `<input type="text" id="signal" placeholder="Signalwort" class="w-full p-2 border-2 rounded font-bold">`;
        fields.innerHTML += `<input type="range" id="fontSize" min="10" max="150" value="35" class="w-full accent-[#064e3b]">`;
        ghsArea.classList.remove('hidden');
        if(id === 'schilder') batchArea.classList.remove('hidden');
        initGhsPicker();
    }
    fields.querySelectorAll('input, select, textarea').forEach(el => el.oninput = updatePreview);
}

window.setMode = (m) => { state.mode = m; updatePreview(); };

function initGhsPicker() {
    const p = document.getElementById('ghsPicker'); p.innerHTML = '';
    for(let i=1; i<=9; i++) {
        const id = i.toString().padStart(3, '0');
        p.innerHTML += `<div onclick="toggleGhs('${id}', this)" class="p-1 border rounded cursor-pointer"><img src="ghs_${id}.png" class="h-6 mx-auto"></div>`;
    }
}

window.toggleGhs = (id, el) => {
    if(state.ghs.includes(id)) { state.ghs = state.ghs.filter(g => g!==id); el.classList.remove('bg-green-200'); }
    else if(state.ghs.length < 5) { state.ghs.push(id); el.classList.add('bg-green-200'); }
    updatePreview();
}

function updatePreview() {
    const id = state.app; const container = document.getElementById('previewContainer');
    const text = document.getElementById('mainText')?.value || '';
    const size = document.getElementById('fontSize')?.value || 30;
    const color = document.getElementById('color')?.value || 'white';
    const sig = document.getElementById('signal')?.value || '';

    let bgColorClass = `c-${color}`;
    if(id === 'lolc') {
        const st = document.getElementById('statusType').value;
        bgColorClass = (st==='LC' || st==='NC') ? 'c-red' : (st==='EA' ? 'c-white' : 'c-green');
    }

    if(id === 'tankwagen' || id === 'behaelter') { container.style.width="500px"; container.style.aspectRatio="297/210"; }
    else { container.style.width="400px"; container.style.aspectRatio="991/423"; }

    let html = `<div class="label-canvas ${bgColorClass}">`;
    if(id === 'lolc') {
        const st = document.getElementById('statusType').value;
        html += `<div class="z-top" style="height:100%; font-size:${size/4}px">${st}-${text.split('\n')[0]}</div>`;
    } else {
        html += `<div class="z-top" style="font-size:${size/4}px">${text.toUpperCase()}</div>`;
        html += `<div class="z-mid">${state.ghs.map(g => `<img src="ghs_${g}.png">`).join('')}</div>`;
        html += `<div class="z-bot">${sig}</div>`;
    }
    container.innerHTML = html + `</div>`;
}

function generatePDF() {
    const id = state.app; const appData = APPS.find(a => a.id === id);
    const doc = new jsPDF({ orientation: (appData.type==='a4l' || appData.type==='4er' ? 'l' : 'p'), unit: 'mm', format: 'a4' });
    const text = document.getElementById('mainText')?.value || '';
    const size = parseInt(document.getElementById('fontSize')?.value);
    const sig = document.getElementById('signal')?.value || '';
    const colorKey = document.getElementById('color')?.value || 'white';
    const colors = { white:[255,255,255], yellow:[255,255,0], red:[255,0,0], green:[34,197,94], blue:[59,130,246] };

    if(appData.type === '4er') {
        const cols = { white:[255,255,255], yellow:[255,255,0], red:[255,0,0], green:[34,197,94], blue:[59,130,246] };
        for(let i=0; i<4; i++) {
            const x = (i%2)*148.5, y = Math.floor(i/2)*105;
            doc.setFillColor(...cols[colorKey]); doc.rect(x,y,148.5,105,'F');
            doc.setTextColor((colorKey==='red'||colorKey==='blue')?255:0);
            doc.setFontSize(size); doc.text(text.toUpperCase(), x+74, y+35, {align:'center', maxWidth:130});
            state.ghs.forEach((g,idx) => doc.addImage(`ghs_${g}.png`,'PNG', x+30+(idx*20), y+55, 18, 18));
            doc.setFontSize(20); doc.text(sig, x+74, y+95, {align:'center'});
        }
    } else if(appData.type === '12er') {
        const start = parseInt(document.getElementById('startPos').value)-1;
        const count = parseInt(document.getElementById('printCount').value);
        const list = text.split('\n');
        for(let i=start; i<Math.min(start+count, 12); i++) {
            const x = 6.4+(i%2*99.1), y = 21.6+(Math.floor(i/2)*42.3);
            let bg = colors[colorKey], tc = (colorKey==='red'||colorKey==='blue')?255:0, val = text;
            if(id === 'lolc') {
                const st = document.getElementById('statusType').value;
                bg = (st==='LC'||st==='NC') ? [255,0,0] : (st==='EA'?[255,255,255]:[34,197,148]);
                tc = (st==='LC'||st==='NC')?255:0; val = `${st}-${state.mode==='list'?list[i-start]||'':text}`;
            }
            doc.setFillColor(...bg); doc.rect(x,y,99.1,42.3,'F'); doc.setTextColor(tc);
            doc.setFontSize(size); doc.text(val.toUpperCase(), x+49, y+21, {align:'center', baseline:'middle'});
        }
    } else if(appData.type === 'a4l') {
        doc.setFillColor(255,255,255); doc.rect(0,0,297,210,'F'); doc.setTextColor(0);
        doc.setFontSize(size); doc.text(text.toUpperCase(), 148, 80, {align:'center', maxWidth:260});
    }
    doc.save(`AP_${id}.pdf`);
}

document.getElementById('backToHub').onclick = renderHub;
renderHub();
