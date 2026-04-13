const { jsPDF } = window.jspdf;

const APPS = [
    { id: 'schilder', name: 'Rohrleitungsschilder', img: 'IMG_4554.png', type: 'avery' },
    { id: 'kanister', name: 'Kanister', img: 'IMG_4555.png', type: 'avery' },
    { id: 'behaelter', name: 'Behälter', img: 'IMG_4553.png', type: 'a4l' },
    { id: 'probegross', name: 'Probe Groß', img: 'IMG_4552.png', type: 'avery' },
    { id: 'probeklein', name: 'Probe Klein', img: 'IMG_4557.png', type: 'small80' },
    { id: 'hobbock', name: 'Hobbock', img: 'IMG_4556.png', type: 'avery' },
    { id: 'tankwagen', name: 'Tankwagen', img: 'bild1.png', type: 'a4l' },
    { id: 'lolc', name: 'LO / LC', img: 'bild2.png', type: 'avery' }
];

let state = { currentApp: 'hub', selectedGhs: [] };

// Initialisierung GHS Picker
function initGhs() {
    const picker = document.getElementById('ghsPicker');
    picker.innerHTML = '';
    for (let i = 1; i <= 9; i++) {
        const id = i.toString().padStart(3, '0');
        const div = document.createElement('div');
        div.className = "flex justify-center p-1 border rounded cursor-pointer bg-white hover:border-[#064e3b]";
        div.innerHTML = `<img src="ghs_${id}.png" class="w-8 h-8 object-contain pointer-events-none"><input type="checkbox" value="${id}" class="ghs-check hidden">`;
        div.onclick = () => {
            const cb = div.querySelector('input');
            const limit = (state.currentApp === 'probeklein') ? 3 : 6;
            if (!cb.checked && state.selectedGhs.length >= limit) return alert(`Max. ${limit} Symbole`);
            cb.checked = !cb.checked;
            div.classList.toggle('border-[#064e3b]', cb.checked);
            div.classList.toggle('bg-green-50', cb.checked);
            state.selectedGhs = Array.from(document.querySelectorAll('.ghs-check:checked')).map(c => c.value);
            updatePreview();
        };
        picker.appendChild(div);
    }
}

// Hub generieren
function renderHub() {
    const hub = document.getElementById('hubSection');
    hub.innerHTML = '';
    APPS.forEach(app => {
        const card = document.createElement('div');
        card.className = "menu-card shadow-md";
        card.innerHTML = `<img src="${app.img}" alt="${app.name}"><span>${app.name}</span>`;
        card.onclick = () => openApp(app.id);
        hub.appendChild(card);
    });
    document.getElementById('hubSection').classList.remove('hidden');
    document.getElementById('appSection').classList.add('hidden');
    document.getElementById('backToHub').classList.add('hidden');
    document.getElementById('appTitle').innerText = "AP PRINTER SYSTEM";
}

// App öffnen
function openApp(appId) {
    state.currentApp = appId;
    state.selectedGhs = [];
    document.getElementById('hubSection').classList.add('hidden');
    document.getElementById('appSection').classList.remove('hidden');
    document.getElementById('backToHub').classList.remove('hidden');
    
    const appData = APPS.find(a => a.id === appId);
    document.getElementById('appTitle').innerText = appData.name;
    
    renderConfigFields(appId);
    initGhs();
    updatePreview();
}

// Dynamische Formularfelder
function renderConfigFields(appId) {
    const form = document.getElementById('configForm');
    const ghsCont = document.getElementById('ghsContainer');
    const printSet = document.getElementById('printSettings');
    form.innerHTML = '';
    ghsCont.classList.add('hidden');
    printSet.classList.add('hidden');

    const addField = (label, id, type = 'text', val = '', options = null) => {
        const div = document.createElement('div');
        let input = `<input type="${type}" id="${id}" value="${val}" class="w-full p-2 border-2 rounded font-bold outline-none focus:border-[#064e3b]">`;
        if (type === 'select') {
            input = `<select id="${id}" class="w-full p-2 border-2 rounded font-bold outline-none focus:border-[#064e3b]">${options.map(o => `<option value="${o.v}">${o.t}</option>`).join('')}</select>`;
        } else if (type === 'textarea') {
            input = `<textarea id="${id}" rows="2" class="w-full p-2 border-2 rounded font-bold outline-none focus:border-[#064e3b] resize-none">${val}</textarea>`;
        }
        div.innerHTML = `<label class="block text-xs font-bold text-gray-500 mb-1 uppercase">${label}</label>${input}`;
        form.appendChild(div);
    };

    const addSlider = (label, id, min, max, val) => {
        const div = document.createElement('div');
        div.innerHTML = `<div class="flex justify-between text-xs font-bold text-gray-500 mb-1 uppercase"><span>${label}</span><span id="${id}Val">${val}</span></div>
                         <input type="range" id="${id}" min="${min}" max="${max}" value="${val}" class="w-full accent-[#064e3b]">`;
        form.appendChild(div);
    };

    // App-Spezifische Felder
    switch(appId) {
        case 'schilder':
        case 'kanister':
        case 'hobbock':
            addField('Farbe', 'subClass', 'select', '', [{v:'white',t:'Weiß'},{v:'yellow',t:'Gelb'},{v:'red',t:'Rot'},{v:'green',t:'Grün'},{v:'blue',t:'Blau'},{v:'brown',t:'Braun'},{v:'violet',t:'Violett'}]);
            addField('Text', 'mainText', 'text', 'STOFFNAME');
            addSlider('Schriftgröße', 'textSize', 10, 80, 30);
            addField('Signalwort', 'signal', 'select', '', [{v:'',t:'Keines'},{v:'GEFAHR',t:'GEFAHR'},{v:'ACHTUNG',t:'ACHTUNG'}]);
            addField('Pfeil', 'arrowDir', 'select', '', [{v:'none',t:'Kein'},{v:'right',t:'→'},{v:'left',t:'←'},{v:'up',t:'↑'},{v:'down',t:'↓'}]);
            ghsCont.classList.remove('hidden');
            printSet.classList.remove('hidden');
            break;
        case 'tankwagen':
            addField('Stoffname', 'mainText', 'textarea', 'NATRONLAUGE\n50%');
            addSlider('Schriftgröße', 'textSize', 10, 200, 90);
            addField('Betrieb/Abt', 'footerLeft', 'text', 'Betrieb | Abteilung');
            addField('Firma/Adr', 'footerRight', 'text', 'Firma | Adresse');
            ghsCont.classList.remove('hidden');
            break;
        case 'lolc':
            addField('Status', 'statusType', 'select', '', [{v:'LO',t:'LO'},{v:'LC',t:'LC'},{v:'NO',t:'NO'},{v:'NC',t:'NC'},{v:'EA',t:'EA'}]);
            addField('Nummerierung', 'mainText', 'textarea', '01-01');
            addSlider('Schriftgröße', 'textSize', 10, 80, 50);
            printSet.classList.remove('hidden');
            break;
        case 'behaelter':
            addField('Anlagenteil', 'plantText', 'text', 'A-101');
            addSlider('Größe Anlage', 'plantSize', 20, 150, 80);
            addField('Stoffname', 'mainText', 'text', 'STOFFNAME');
            addSlider('Größe Stoff', 'textSize', 20, 150, 50);
            ghsCont.classList.remove('hidden');
            break;
        case 'probeklein':
            addField('Stoff', 'mainText', 'text', 'PROBE');
            addField('Signal', 'signal', 'select', '', [{v:'',t:'Kein'},{v:'GEFAHR',t:'GEFAHR'},{v:'ACHTUNG',t:'ACHTUNG'}]);
            ghsCont.classList.remove('hidden');
            break;
        case 'probegross':
            addField('Stoff', 'mainText', 'text', 'STOFF');
            addSlider('Größe Stoff', 'textSize', 10, 60, 30);
            addField('Stelle', 'location', 'text', 'T-100');
            addField('Probenehmer', 'sampler', 'text', 'Name');
            ghsCont.classList.remove('hidden');
            break;
    }

    // Event Listener für Echtzeit-Vorschau an alle Felder binden
    document.querySelectorAll('#configForm input, #configForm select, #configForm textarea').forEach(el => {
        el.addEventListener('input', updatePreview);
    });
}

// Vorschau Update
function updatePreview() {
    const container = document.getElementById('previewContainer');
    const appId = state.currentApp;
    const appData = APPS.find(a => a.id === appId);
    
    // UI Elemente & Werte
    const mainText = document.getElementById('mainText')?.value || '';
    const textSize = document.getElementById('textSize')?.value || 30;
    const signal = document.getElementById('signal')?.value || '';
    const subClass = document.getElementById('subClass')?.value || 'white';
    if(document.getElementById('textSizeVal')) document.getElementById('textSizeVal').innerText = textSize;

    // Preview Container Dimensionen setzen
    if (appData.type === 'a4l') { container.style.aspectRatio = "297/210"; container.style.maxWidth = "600px"; }
    else if (appData.type === 'small80') { container.style.aspectRatio = "356/169"; container.style.maxWidth = "400px"; }
    else { container.style.aspectRatio = "991/423"; container.style.maxWidth = "500px"; }

    let html = `<div class="label-canvas color-${subClass}">`;

    // Spezifisches Vorschau HTML je nach App
    switch(appId) {
        case 'schilder':
        case 'kanister':
        case 'hobbock':
            html += `<div class="schild-top" style="font-size:${textSize/10}rem">${mainText.toUpperCase()}</div>
                     <div class="schild-bot">
                        <div class="ghs-row">${state.selectedGhs.map(id => `<img src="ghs_${id}.png">`).join('')}</div>
                        <div style="font-weight:900;font-style:italic;font-size:0.8rem">${signal}</div>
                     </div>`;
            break;
        case 'tankwagen':
            html += `<div class="zone-3" style="border:none; height:66%; font-size:${textSize/10}rem; white-space:pre-wrap;">${mainText.toUpperCase()}</div>
                     <div style="height:20%; display:flex; align-items:center; justify-content:center; gap:20px; border-top:1px solid #eee;">
                        <div class="ghs-row">${state.selectedGhs.map(id => `<img src="ghs_${id}.png">`).join('')}</div>
                        <div style="font-weight:900;font-style:italic;font-size:1.5rem">${signal}</div>
                     </div>
                     <div style="height:14%; border-top:1px solid #eee; display:flex; justify-content:space-between; padding:5px 20px; font-size:0.8rem; font-weight:bold;">
                        <div>${document.getElementById('footerLeft')?.value || ''}</div>
                        <div style="text-align:right">${document.getElementById('footerRight')?.value || ''}</div>
                     </div>`;
            break;
        case 'lolc':
            const st = document.getElementById('statusType').value;
            const lines = mainText.split('\n')[0]; // Vorschau zeigt 1. Zeile
            html = `<div class="label-canvas color-${st.toLowerCase()}" style="font-size:${textSize/10}rem; align-items:center; justify-content:center; font-weight:bold;">${st}-${lines}</div>`;
            break;
        case 'behaelter':
            const pText = document.getElementById('plantText').value;
            const pSize = document.getElementById('plantSize').value;
            html += `<div class="zone-3" style="font-size:${pSize/10}rem">${pText.toUpperCase()}</div>
                     <div class="zone-3" style="font-size:${textSize/10}rem">${mainText.toUpperCase()}</div>
                     <div class="zone-3"><div class="ghs-row">${state.selectedGhs.map(id => `<img src="ghs_${id}.png">`).join('')}</div>
                     <div style="font-style:italic;font-weight:900">${signal}</div></div>`;
            break;
        case 'probeklein':
            html += `<div style="height:55%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:1.5rem;">${mainText.toUpperCase()}</div>
                     <div style="height:45%; display:flex; border-top:1px solid #eee;">
                        <div style="width:60%; display:flex; flex-direction:column; justify-content:flex-end; padding:5px;">
                            <div class="ghs-row" style="justify-content:flex-start">${state.selectedGhs.map(id => `<img src="ghs_${id}.png" style="height:25px">`).join('')}</div>
                            <div style="font-size:8px; font-weight:bold; font-style:italic;">${signal}</div>
                        </div>
                        <div style="width:40%; display:flex; align-items:flex-end; padding:5px; font-size:8px; font-weight:bold;">Datum: _______</div>
                     </div>`;
            break;
    }
    
    html += `</div>`;
    container.innerHTML = html;
}

// PDF GENERIERUNG (Kombinierte Logik)
document.getElementById('pdfBtn').onclick = () => {
    const appId = state.currentApp;
    const appData = APPS.find(a => a.id === appId);
    const orientation = appData.type === 'a4l' ? 'l' : 'p';
    const doc = new jsPDF({ orientation: orientation, unit: 'mm', format: 'a4' });

    // Werte holen
    const mainText = document.getElementById('mainText')?.value || '';
    const signal = document.getElementById('signal')?.value || '';
    const textSize = parseInt(document.getElementById('textSize')?.value) || 30;

    const colors = { 
        white:[255,255,255], yellow:[255,255,0], red:[255,0,0], green:[34,197,94], 
        blue:[0,0,255], brown:[139,69,19], violet:[128,0,128], lo:[34,197,94], lc:[239,68,68], no:[34,197,94], nc:[239,68,68], ea:[255,255,255]
    };

    if (appData.type === 'a4l') {
        // Einzelseite A4 Querformat
        const midX = 148.5;
        if (appId === 'tankwagen') {
            doc.setFont("helvetica", "bold"); doc.setFontSize(textSize);
            doc.text(mainText.toUpperCase(), midX, 70, { align: 'center', baseline: 'middle', maxWidth: 270 });
            state.selectedGhs.forEach((id, i) => doc.addImage(`ghs_${id}.png`, 'PNG', midX - 50 + (i*15), 147, 20, 20));
            doc.setFontSize(25); doc.text(signal, midX + 40, 160);
            doc.setFontSize(10); doc.text(document.getElementById('footerLeft').value, 20, 200);
            doc.text(document.getElementById('footerRight').value, 277, 200, { align: 'right' });
        } else if (appId === 'behaelter') {
            const pSize = parseInt(document.getElementById('plantSize').value);
            doc.setFontSize(pSize * 1.5); doc.text(document.getElementById('plantText').value.toUpperCase(), midX, 40, { align: 'center', baseline: 'middle' });
            doc.setFontSize(textSize * 1.5); doc.text(mainText.toUpperCase(), midX, 105, { align: 'center', baseline: 'middle' });
            state.selectedGhs.forEach((id, i) => doc.addImage(`ghs_${id}.png`, 'PNG', midX - 40 + (i*15), 150, 30, 30));
        }
    } else {
        // Bogen-Druck (12er oder 80er)
        const startPos = parseInt(document.getElementById('startPos')?.value) || 1;
        const printCount = parseInt(document.getElementById('printCount')?.value) || 12;
        
        let labelW, labelH, leftM, topM, cols, rows;
        if(appData.type === 'small80') {
            labelW=35.6; labelH=16.9; leftM=13; topM=13; cols=5; rows=16;
        } else {
            labelW=99.1; labelH=42.3; leftM=6.4; topM=21.6; cols=2; rows=6;
        }

        const listLines = appId === 'lolc' ? mainText.split('\n') : [];

        for (let i = startPos - 1; i < Math.min(startPos - 1 + printCount, cols * rows); i++) {
            const x = leftM + (i % cols * (labelW + (appData.type === 'small80' ? 2.5 : 0)));
            const y = topM + (Math.floor(i / cols) * labelH);
            
            let bgKey = (appId === 'lolc') ? document.getElementById('statusType').value.toLowerCase() : document.getElementById('subClass').value;
            doc.setFillColor(...colors[bgKey]); doc.rect(x, y, labelW, labelH, 'F');
            
            const isDark = (bgKey === 'red' || bgKey === 'blue' || bgKey === 'lc' || bgKey === 'nc');
            doc.setTextColor(isDark ? 255 : 0);
            doc.setFont("helvetica", "bold");

            if(appId === 'lolc') {
                const st = document.getElementById('statusType').value;
                doc.setFontSize(textSize); doc.text(`${st}-${listLines[i-(startPos-1)] || ''}`, x+labelW/2, y+labelH/2, { align: 'center', baseline: 'middle' });
            } else if(appId === 'probeklein') {
                doc.setFontSize(8); doc.text(mainText.toUpperCase(), x+labelW/2, y+6, { align: 'center', maxWidth: labelW-4 });
                state.selectedGhs.forEach((id, g) => doc.addImage(`ghs_${id}.png`, 'PNG', x+2+(g*5), y+10, 4.5, 4.5));
            } else {
                doc.setFontSize(textSize); doc.text(mainText.toUpperCase(), x+labelW/2, y+18, { align: 'center', maxWidth: 90 });
                state.selectedGhs.forEach((id, g) => doc.addImage(`ghs_${id}.png`, 'PNG', x+5+(g*10), y+29, 9, 9));
            }
        }
    }
    doc.save(`AP_System_${appId}.pdf`);
};

document.getElementById('backToHub').onclick = renderHub;
renderHub();
