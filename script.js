const { jsPDF } = window.jspdf;

const APPS = [
    { id: 'schilder', name: 'Rohrleitungsschilder', img: 'IMG_4554.png', type: '12er', w: 99.1, h: 42.3 },
    { id: 'kanister', name: 'Kanister (4er)', img: 'IMG_4555.png', type: '4er', w: 148.5, h: 105 },
    { id: 'behaelter', name: 'Behälter', img: 'IMG_4553.png', type: 'a4l', w: 297, h: 210 },
    { id: 'probegross', name: 'Probe Groß', img: 'IMG_4552.png', type: '12er', w: 99.1, h: 42.3 },
    { id: 'probeklein', name: 'Probe Klein', img: 'IMG_4557.png', type: '80er', w: 35.6, h: 16.9 },
    { id: 'hobbock', name: 'Hobbock (4er)', img: 'IMG_4556.png', type: '4er', w: 148.5, h: 105 },
    { id: 'tankwagen', name: 'Tankwagen', img: 'bild1.png', type: 'a4l', w: 297, h: 210 },
    { id: 'lolc', name: 'LO / LC', img: 'bild2.png', type: '12er', w: 99.1, h: 42.3 }
];

let state = { app: 'hub', ghs: [], mode: 'single' };

function renderHub() {
    state.app = 'hub';
    document.getElementById('hubSection').classList.remove('hidden');
    document.getElementById('appSection').classList.add('hidden');
    document.getElementById('backToHub').classList.add('hidden');
    document.getElementById('appTitle').innerText = "AP PRINTER HUB";
    
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
    
    const appData = APPS.find(a => a.id === id);
    document.getElementById('appTitle').innerText = appData.name;
    document.getElementById('formatInfo').innerText = `Format: ${appData.name} (${appData.w} x ${appData.h} mm)`;
    
    setupForm(id);
    updatePreview();
}

function setupForm(id) {
    const fields = document.getElementById('dynamicFields');
    const ghsArea = document.getElementById('ghsArea');
    const batchArea = document.getElementById('batchArea');
    fields.innerHTML = ''; ghsArea.classList.add('hidden'); batchArea.classList.add('hidden');

    const addSelect = (label, id, opts) => {
        let html = `<div class="space-y-1"><label class="text-[10px] font-bold text-gray-400 uppercase">${label}</label><select id="${id}" class="w-full p-2 border-2 rounded font-bold outline-none focus:border-[#064e3b]">`;
        opts.forEach(o => html += `<option value="${o.v}">${o.t}</option>`);
        fields.innerHTML += html + `</select></div>`;
    };
    
    const addInput = (label, iId, val="") => {
        fields.innerHTML += `<div class="space-y-1"><label class="text-[10px] font-bold text-gray-400 uppercase">${label}</label><input type="text" id="${iId}" value="${val}" class="w-full p-2 border-2 rounded font-bold outline-none focus:border-[#064e3b]"></div>`;
    };

    const addTextarea = (label, iId, val="") => {
        fields.innerHTML += `<div class="space-y-1"><label class="text-[10px] font-bold text-gray-400 uppercase">${label}</label><textarea id="${iId}" rows="2" class="w-full p-2 border-2 rounded font-bold outline-none focus:border-[#064e3b] resize-none">${val}</textarea></div>`;
    };

    const addSlider = (label, iId, min, max, val) => {
        fields.innerHTML += `<div class="space-y-1"><div class="flex justify-between"><label class="text-[10px] font-bold text-gray-400 uppercase">${label}</label><span id="${iId}Val" class="text-[10px] font-bold">${val}</span></div><input type="range" id="${iId}" min="${min}" max="${max}" value="${val}" class="w-full accent-[#064e3b]"></div>`;
    };

    const colors = [{v:'white',t:'Weiß'},{v:'yellow',t:'Gelb'},{v:'red',t:'Rot'},{v:'green',t:'Grün'},{v:'blue',t:'Blau'},{v:'brown',t:'Braun'},{v:'violet',t:'Violett'}];
    const signals = [{v:'',t:'Kein Signalwort'},{v:'ACHTUNG',t:'ACHTUNG'},{v:'GEFAHR',t:'GEFAHR'}];

    if(id === 'lolc') {
        addSelect('Status Typ', 'statusType', [{v:'LO',t:'LO'},{v:'LC',t:'LC'},{v:'NO',t:'NO'},{v:'NC',t:'NC'},{v:'EA',t:'EA'}]);
        fields.innerHTML += `<div class="flex gap-2"><button onclick="setMode('single')" class="flex-1 p-1 bg-gray-200 rounded text-xs font-bold hover:bg-gray-300">Einzel</button><button onclick="setMode('list')" class="flex-1 p-1 bg-gray-200 rounded text-xs font-bold hover:bg-gray-300">Liste</button></div>`;
        addTextarea('Nummer(n)', 'mainText', '01-02'); // Exakt 8 Zeichen gesamt
        addSlider('Schriftgröße', 'fontSize', 10, 80, 40);
        batchArea.classList.remove('hidden');
    } 
    else if(id === 'behaelter') {
        addSelect('Hintergrundfarbe', 'color', colors);
        addInput('Anlagenteil', 'plantText', 'A-101');
        addSlider('Größe Anlage', 'plantSize', 20, 150, 60);
        addTextarea('Stoffname', 'mainText', 'STOFFNAME');
        addSlider('Größe Stoff', 'fontSize', 20, 150, 40);
        addSelect('Signalwort', 'signal', signals);
        ghsArea.classList.remove('hidden');
    }
    else if(id === 'tankwagen') {
        addTextarea('Stoffname', 'mainText', 'NATRONLAUGE\n50%');
        addSlider('Schriftgröße', 'fontSize', 40, 250, 120);
        addSelect('Signalwort', 'signal', signals);
        addInput('Firma', 'footer', 'Firma | Adresse');
        ghsArea.classList.remove('hidden');
    }
    else {
        // Schilder, Kanister, Hobbock, Probe
        addSelect('Hintergrundfarbe', 'color', colors);
        addInput('Stoffname', 'mainText', 'STOFFNAME');
        let defSize = (id==='probeklein') ? 15 : 30; // Reduzierte Standardgrößen
        addSlider('Schriftgröße', 'fontSize', 10, 100, defSize);
        addSelect('Signalwort', 'signal', signals);
        ghsArea.classList.remove('hidden');
        if(['schilder', 'probegross', 'probeklein', 'kanister', 'hobbock'].includes(id)) batchArea.classList.remove('hidden');
    }

    initGhsPicker();
    fields.querySelectorAll('input, select, textarea').forEach(el => el.oninput = updatePreview);
}

window.setMode = (m) => { state.mode = m; updatePreview(); };

function initGhsPicker() {
    const p = document.getElementById('ghsPicker'); p.innerHTML = '';
    for(let i=1; i<=9; i++) {
        const id = i.toString().padStart(3, '0');
        p.innerHTML += `<div onclick="toggleGhs('${id}', this)" class="p-1 border rounded cursor-pointer flex justify-center"><img src="ghs_${id}.png" class="h-6"></div>`;
    }
}

window.toggleGhs = (id, el) => {
    if(state.ghs.includes(id)) { state.ghs = state.ghs.filter(g => g!==id); el.classList.remove('bg-green-200'); }
    else if(state.ghs.length < 5) { state.ghs.push(id); el.classList.add('bg-green-200'); }
    updatePreview();
}

// ---------------------------------------------------------
// DIE MAGIE: Exakte mm zu px Umrechnung für die Vorschau
// ---------------------------------------------------------
function updatePreview() {
    const id = state.app; const appData = APPS.find(a => a.id === id);
    const container = document.getElementById('previewContainer');
    
    // UI Werte sicher lesen
    const text = document.getElementById('mainText')?.value || '';
    const size = parseInt(document.getElementById('fontSize')?.value) || 30;
    const color = document.getElementById('color')?.value || 'white';
    const sig = document.getElementById('signal')?.value || '';

    if(document.getElementById('fontSizeVal')) document.getElementById('fontSizeVal').innerText = size;
    if(document.getElementById('plantSizeVal')) document.getElementById('plantSizeVal').innerText = document.getElementById('plantSize').value;

    // Vorschau Container skalieren
    container.style.aspectRatio = `${appData.w}/${appData.h}`;
    container.style.width = appData.w > 150 ? "500px" : "400px";
    
    // Berechne Skalierungsfaktor: 1 pt = 0.3527 mm
    const scale = container.offsetWidth / appData.w; 
    const ptToPx = (pt) => (pt * 0.3527 * scale) + "px";

    let bgClass = `c-${color}`;
    if(id === 'lolc') {
        const st = document.getElementById('statusType').value;
        bgClass = (st==='LC'||st==='NC') ? 'c-red' : (st==='EA' ? 'c-white' : 'c-green');
    }

    let html = `<div class="label-canvas ${bgClass}">`;
    
    if(id === 'lolc') {
        const st = document.getElementById('statusType').value;
        const line = text.split('\n')[0]; // Nur erste Zeile zeigen
        html += `<div style="height:100%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:${ptToPx(size)}">${st}-${line}</div>`;
    } 
    else if(id === 'behaelter') {
        const pSize = parseInt(document.getElementById('plantSize').value) || 60;
        const pText = document.getElementById('plantText').value || '';
        html += `<div class="z-third" style="font-size:${ptToPx(pSize)}">${pText.toUpperCase()}</div>`;
        html += `<div class="z-third" style="font-size:${ptToPx(size)}">${text.toUpperCase()}</div>`;
        html += `<div class="z-third"><div class="z-mid w-full">${state.ghs.map(g => `<img src="ghs_${g}.png">`).join('')}</div><div class="z-bot">${sig}</div></div>`;
    }
    else if(id === 'tankwagen') {
        html += `<div class="z-third" style="height:66%; font-size:${ptToPx(size)}; border-bottom:1px solid #ccc;">${text.toUpperCase()}</div>`;
        html += `<div style="height:20%; display:flex; align-items:center; justify-content:center; gap:20px; border-bottom:1px solid #eee;"><div class="z-mid w-1/2">${state.ghs.map(g => `<img src="ghs_${g}.png">`).join('')}</div><div class="z-bot w-1/2" style="font-size:${ptToPx(30)}">${sig}</div></div>`;
        html += `<div style="height:14%; display:flex; align-items:center; justify-content:flex-end; padding-right:20px; font-weight:bold; font-size:${ptToPx(12)}">${document.getElementById('footer')?.value || ''}</div>`;
    }
    else {
        // Schilder, Kanister, Hobbock, Probe
        html += `<div class="z-top" style="font-size:${ptToPx(size)}">${text.toUpperCase()}</div>`;
        html += `<div class="z-mid">${state.ghs.map(g => `<img src="ghs_${g}.png">`).join('')}</div>`;
        html += `<div class="z-bot">${sig}</div>`;
    }
    
    container.innerHTML = html + `</div>`;
}

// ---------------------------------------------------------
// PDF GENERIERUNG: Stabil und Fehlerresistent
// ---------------------------------------------------------
function generatePDF() {
    try {
        const id = state.app; const appData = APPS.find(a => a.id === id);
        const doc = new jsPDF({ orientation: (appData.type==='a4l'||appData.type==='4er' ? 'l' : 'p'), unit: 'mm', format: 'a4' });
        
        const text = document.getElementById('mainText')?.value || '';
        const size = parseInt(document.getElementById('fontSize')?.value) || 30;
        const sig = document.getElementById('signal')?.value || '';
        const colorKey = document.getElementById('color')?.value || 'white';
        
        const rgb = { white:[255,255,255], yellow:[253,224,71], red:[239,68,68], green:[34,197,94], blue:[59,130,246], brown:[120,53,15], violet:[168,85,247] };

        const drawGhs = (x, y, sz) => {
            state.ghs.forEach((g, i) => {
                try { doc.addImage(`ghs_${g}.png`, 'PNG', x + (i * (sz + 2)), y, sz, sz); } catch(e) { console.warn("Bild fehlt", g); }
            });
        };

        if(appData.type === 'a4l') {
            doc.setFillColor(...rgb[colorKey] || [255,255,255]); doc.rect(0,0,297,210,'F');
            const tc = (colorKey==='red'||colorKey==='blue'||colorKey==='brown'||colorKey==='violet')?255:0;
            doc.setTextColor(tc); doc.setFont("helvetica", "bold");

            if(id === 'behaelter') {
                const pSize = parseInt(document.getElementById('plantSize').value) || 60;
                doc.setFontSize(pSize); doc.text((document.getElementById('plantText').value||'').toUpperCase(), 148.5, 45, {align:'center'});
                doc.setFontSize(size); doc.text(text.toUpperCase(), 148.5, 105, {align:'center'});
                drawGhs(148.5 - ((state.ghs.length*22)/2), 145, 20);
                doc.setFontSize(25); doc.text(sig, 148.5, 185, {align:'center'});
            } else {
                // Tankwagen
                doc.setFontSize(size); doc.text(text.toUpperCase(), 148.5, 70, {align:'center', baseline:'middle'});
                drawGhs(80, 145, 25);
                doc.setFontSize(35); doc.text(sig, 220, 160, {align:'center'});
                doc.setFontSize(12); doc.text(document.getElementById('footer').value||'', 280, 200, {align:'right'});
            }
        } 
        else if(appData.type === '4er') {
            // Kanister & Hobbock (A4 Landscape, 2x2 Grid)
            for(let i=0; i<4; i++) {
                const x = (i%2)*148.5, y = Math.floor(i/2)*105;
                doc.setFillColor(...rgb[colorKey]); doc.rect(x,y,148.5,105,'F');
                doc.setTextColor((colorKey==='red'||colorKey==='blue'||colorKey==='brown'||colorKey==='violet')?255:0);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(size); doc.text(text.toUpperCase(), x+74, y+35, {align:'center', maxWidth: 130});
                drawGhs(x + 74 - ((state.ghs.length*17)/2), y+50, 15);
                doc.setFontSize(20); doc.text(sig, x+74, y+90, {align:'center'});
            }
        } 
        else {
            // Etiketten (12er, 80er)
            const start = parseInt(document.getElementById('startPos')?.value || 1) - 1;
            const count = parseInt(document.getElementById('printCount')?.value || 12);
            const cols = id==='probeklein' ? 5 : 2;
            const rows = id==='probeklein' ? 16 : 6;
            
            for(let i=start; i<Math.min(start+count, cols*rows); i++) {
                const x = (id==='probeklein'?13:6.4) + (i%cols * (appData.w + (id==='probeklein'?2.5:0)));
                const y = (id==='probeklein'?13:21.6) + (Math.floor(i/cols) * appData.h);
                
                let bg = rgb[colorKey], tc = (colorKey==='red'||colorKey==='blue'||colorKey==='brown'||colorKey==='violet')?255:0;
                let printText = text.toUpperCase();

                if(id === 'lolc') {
                    const st = document.getElementById('statusType').value;
                    bg = (st==='LC'||st==='NC')?[239,68,68]:(st==='EA'?[255,255,255]:[34,197,94]);
                    tc = (st==='LC'||st==='NC')?255:0;
                    const lines = text.split('\n');
                    printText = `${st}-${state.mode==='list' ? (lines[i-start]||'') : text}`;
                }

                doc.setFillColor(...bg); doc.rect(x, y, appData.w, appData.h, 'F');
                doc.setTextColor(tc); doc.setFont("helvetica", "bold");
                doc.setFontSize(size); 
                
                if(id === 'lolc') {
                    doc.text(printText, x+(appData.w/2), y+(appData.h/2), {align:'center', baseline:'middle'});
                } else {
                    doc.text(printText, x+(appData.w/2), y+(appData.h/3), {align:'center', baseline:'middle', maxWidth: appData.w-4});
                    drawGhs(x+(appData.w/2) - ((state.ghs.length*10)/2), y+(appData.h/2), 8);
                    doc.setFontSize(10); doc.text(sig, x+(appData.w/2), y+appData.h-4, {align:'center'});
                }
            }
        }
        doc.save(`AP_${id}.pdf`);
    } catch (error) {
        alert("Es gab einen Fehler beim Erstellen des PDFs. Details in der Konsole.");
        console.error("PDF Error:", error);
    }
}

document.getElementById('backToHub').onclick = renderHub;
document.getElementById('pdfBtn').onclick = generatePDF;
renderHub();
