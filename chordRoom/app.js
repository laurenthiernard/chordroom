(() => {
  const names = ['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
  const spellings = { 'C♯':'D♭','D♯':'E♭','F♯':'G♭','G♯':'A♭','A♯':'B♭' };
  const qualities = {
    major:{suffix:'',title:'major',tones:[0,4,7],labels:['Root','Major 3rd','Perfect 5th']},
    minor:{suffix:'m',title:'minor',tones:[0,3,7],labels:['Root','Minor 3rd','Perfect 5th']},
    diminished:{suffix:'dim',title:'diminished',tones:[0,3,6],labels:['Root','Minor 3rd','Diminished 5th']},
    augmented:{suffix:'aug',title:'augmented',tones:[0,4,8],labels:['Root','Major 3rd','Augmented 5th']},
    sus2:{suffix:'sus2',title:'suspended 2nd',tones:[0,2,7],labels:['Root','Major 2nd','Perfect 5th']},
    sus4:{suffix:'sus4',title:'suspended 4th',tones:[0,5,7],labels:['Root','Perfect 4th','Perfect 5th']}
  };
  const extensions = { '6':{tone:9,label:'Major 6th',degree:'6'},'7':{tone:10,label:'Minor 7th',degree:'♭7'},maj7:{tone:11,label:'Major 7th',degree:'7'},'9':{tone:2,label:'Major 9th',degree:'9'},'11':{tone:5,label:'Perfect 11th',degree:'11'},'13':{tone:9,label:'Major 13th',degree:'13'} };
  const scales = [
    {name:'Major',steps:[0,2,4,5,7,9,11],rank:0}, {name:'Natural minor',steps:[0,2,3,5,7,8,10],rank:1},
    {name:'Harmonic minor',steps:[0,2,3,5,7,8,11],rank:2}, {name:'Melodic minor',steps:[0,2,3,5,7,9,11],rank:3},
    {name:'Dorian',steps:[0,2,3,5,7,9,10],rank:4}, {name:'Phrygian',steps:[0,1,3,5,7,8,10],rank:5},
    {name:'Lydian',steps:[0,2,4,6,7,9,11],rank:6}, {name:'Mixolydian',steps:[0,2,4,5,7,9,10],rank:7},
    {name:'Locrian',steps:[0,1,3,5,6,8,10],rank:8}, {name:'Major pentatonic',steps:[0,2,4,7,9],rank:9}, {name:'Minor pentatonic',steps:[0,3,5,7,10],rank:10}
  ];
  const state={root:0,quality:'major',ext:new Set(),inversion:0};
  const keyboard=document.getElementById('keyboard');
  const rangeStart=60, rangeEnd=83;
  let audioCtx, master, activeTimers=[];
  const enharmonic = n => spellings[n] || n;
  const noteName = midi => names[((midi%12)+12)%12];
  const titleName = midi => enharmonic(noteName(midi));
  const midiLabel = midi => `${titleName(midi)}${Math.floor(midi/12)-1}`;
  const currentChord=()=>{
    const q=qualities[state.quality], tones=q.tones.map((tone,i)=>({tone,label:q.labels[i],degree:['1','3','5'][i],priority:i}));
    for(const key of state.ext){const e=extensions[key];const exists=tones.find(x=>x.tone===e.tone);if(exists){exists.label=e.label;exists.degree=e.degree;exists.priority=4;}else tones.push({tone:e.tone,label:e.label,degree:e.degree,priority:4});}
    // 9ths and 11ths/13ths are shown in their extended register when played.
    return tones.sort((a,b)=>a.priority-b.priority).map(t=>({...t,absolute:state.root+t.tone+(t.tone===2||t.tone===5&&t.priority===4?12:0)}));
  };
  function chordName(){const q=qualities[state.quality];let ext='';const selected=[...state.ext];if(selected.includes('maj7'))ext+='maj7';else if(selected.includes('7'))ext+='7';else if(selected.includes('6'))ext+='6';if(selected.includes('9'))ext+='(add9)';if(selected.includes('11'))ext+='(add11)';if(selected.includes('13'))ext+='(add13)';return `${titleName(state.root)}${q.suffix}${ext}`;}
  function chordNotesMidi(){
    const notes=currentChord().map(n=>n.absolute);const base=notes.slice().sort((a,b)=>a-b);let ordered=base.slice();
    const inversion=Number(state.inversion);for(let i=0;i<inversion;i++)ordered.push(ordered.shift()+12);
    return ordered;
  }
  function renderKeyboard(){
    keyboard.innerHTML='';const active=new Set(chordNotesMidi().map(n=>n%12));
    for(let midi=rangeStart;midi<=rangeEnd;midi++){
      if([1,3,6,8,10].includes(midi%12))continue;
      const key=document.createElement('button');key.type='button';key.className='white-key';key.dataset.note=midi;key.setAttribute('aria-label',`${midiLabel(midi)}${active.has(midi%12)?', in chord':''}`);if(midi%12===state.root%12)key.classList.add('root-key');else if(active.has(midi%12))key.classList.add('chord-key');
      if(midi%12===0)key.innerHTML=`<span class="key-label">${midiLabel(midi)}</span>`;keyboard.appendChild(key);
    }
    // 14 white keys: black keys sit at each semitone boundary, excluding E-B and B-C.
    const blackAfter=[0,1,3,4,5,7,8,10,12,13,15,16,17,19,20,22];
    // Keyboard white-key index map across two octaves, position black keys by white-key fraction.
    let whiteCount=0;for(let m=rangeStart;m<=rangeEnd;m++)if(![1,3,6,8,10].includes(m%12))whiteCount++;
    const whiteSemitones=[];for(let m=rangeStart;m<=rangeEnd;m++)if(![1,3,6,8,10].includes(m%12))whiteSemitones.push(m);
    for(let midi=rangeStart;midi<=rangeEnd;midi++)if([1,3,6,8,10].includes(midi%12)){
      const before=whiteSemitones.filter(w=>w<midi).length;const key=document.createElement('button');key.type='button';key.className='black-key';key.dataset.note=midi;key.style.left=`${(before/whiteCount)*100}%`;key.setAttribute('aria-label',`${midiLabel(midi)} black key${active.has(midi%12)?', in chord':''}`);if(midi%12===state.root%12)key.classList.add('root-key');else if(active.has(midi%12))key.classList.add('chord-key');keyboard.appendChild(key);
    }
  }
  function renderNotes(){
    const notes=currentChord();document.getElementById('chord-symbol').textContent=chordName();document.getElementById('chord-subtitle').textContent=`${titleName(state.root)} ${qualities[state.quality].title}${state.ext.size?' chord':''}`;
    document.getElementById('note-cards').innerHTML=notes.map((n,i)=>`<div class="note-card"><div class="note-name">${titleName(n.absolute)}</div><div class="note-interval">${n.label}</div><div class="note-degree">Scale degree ${n.degree}</div></div>`).join('');
    renderScales(notes);renderKeyboard();
  }
  function renderScales(notes){
    const pcs=[...new Set(notes.map(n=>n.absolute%12))];const root=state.root%12;
    let matches=[];for(let tonic=0;tonic<12;tonic++)for(const scale of scales){const set=new Set(scale.steps.map(x=>(x+tonic)%12));if(pcs.every(pc=>set.has(pc))){const rootIsTonic=tonic===root;const rootDegree=scale.steps.indexOf((root-tonic+12)%12);const qualityMatch=(state.quality==='major'&&scale.name==='Major'&&rootIsTonic)||(state.quality==='minor'&&scale.name==='Natural minor'&&rootIsTonic);const score=(qualityMatch?-10:0)+(rootIsTonic?-3:0)+(rootDegree===0?-2:0)+scale.rank*.04;matches.push({name:`${titleName(tonic)} ${scale.name}`,score,rootIsTonic,rank:scale.rank});}}
    matches.sort((a,b)=>a.score-b.score||a.name.localeCompare(b.name));const unique=[];for(const m of matches){if(!unique.some(x=>x.name===m.name))unique.push(m);}
    document.getElementById('scale-list').innerHTML=unique.slice(0,5).map((s,i)=>`<span class="scale-chip" title="All chord notes appear in this scale">${s.name}${i===0?' · closest fit':''}</span>`).join('')||'<span class="scale-chip">No common scale found</span>';
  }
  function setupAudio(){if(!audioCtx){const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return null;audioCtx=new Ctx();master=audioCtx.createGain();master.gain.value=Number(document.getElementById('volume').value)/100*.35;master.connect(audioCtx.destination);}if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx;}
  function playMidi(midi,when,duration,instrument){const ctx=setupAudio();if(!ctx)return;const fundamental=440*Math.pow(2,(midi-69)/12);const out=ctx.createGain();const vol=Number(document.getElementById('volume').value)/100*.14;out.gain.setValueAtTime(.0001,when);out.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),when+.025);out.gain.exponentialRampToValueAtTime(.0001,when+duration);out.connect(master);
    const types=instrument==='glass'?['sine','triangle']:instrument==='warm'?['triangle','sine']:['triangle','sine'];const oscs=[];types.forEach((type,i)=>{const osc=ctx.createOscillator(),g=ctx.createGain();osc.type=type;osc.frequency.value=fundamental*(i===1?2.002:1);g.gain.value=i===0?.8:.2;osc.connect(g);g.connect(out);osc.start(when);osc.stop(when+duration+.04);oscs.push(osc);});
    if(instrument==='piano'){const bright=ctx.createOscillator(),g=ctx.createGain();bright.type='triangle';bright.frequency.value=fundamental*3;g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(vol*.1,when+.008);g.gain.exponentialRampToValueAtTime(.0001,when+.22);bright.connect(g);g.connect(master);bright.start(when);bright.stop(when+.24);}
  }
  function playChord(){const ctx=setupAudio();if(!ctx)return;const button=document.getElementById('play-chord');button.classList.add('playing');setTimeout(()=>button.classList.remove('playing'),850);const notes=chordNotesMidi();const now=ctx.currentTime+.02;notes.forEach(midi=>playMidi(midi,now,2.25,document.getElementById('instrument').value));}
  function playRoot(midi){state.root=midi;renderNotes();document.getElementById('root-hint').textContent=`${midiLabel(midi)} · ${chordName()}`;playChord();}
  document.getElementById('quality-controls').addEventListener('click',e=>{const b=e.target.closest('[data-quality]');if(!b)return;state.quality=b.dataset.quality;document.querySelectorAll('[data-quality]').forEach(x=>x.classList.toggle('active',x===b));state.inversion=0;renderNotes();playChord();});
  document.getElementById('extension-controls').addEventListener('click',e=>{const b=e.target.closest('[data-ext]');if(!b)return;const key=b.dataset.ext;if(state.ext.has(key)){state.ext.delete(key);b.classList.remove('active');}else{if(key==='7'||key==='maj7'){const other=key==='7'?'maj7':'7';state.ext.delete(other);document.querySelector(`[data-ext="${other}"]`).classList.remove('active');}state.ext.add(key);b.classList.add('active');}state.inversion=0;document.getElementById('inversion').value='0';renderNotes();playChord();});
  document.getElementById('inversion').addEventListener('change',e=>{state.inversion=Number(e.target.value);renderNotes();playChord();});
  keyboard.addEventListener('click',e=>{const key=e.target.closest('[data-note]');if(key)playRoot(Number(key.dataset.note));});
  document.getElementById('play-chord').addEventListener('click',playChord);
  const volume=document.getElementById('volume');volume.addEventListener('input',()=>{const value=Number(volume.value);document.getElementById('volume-value').textContent=`${value}%`;volume.style.background=`linear-gradient(to right,#d09ac4 ${value}%,#eeeaf1 ${value}%)`;if(master)master.gain.setTargetAtTime(value/100*.35,audioCtx.currentTime,.02);});
  document.getElementById('instrument').addEventListener('change',()=>{});
  renderNotes();
})();
