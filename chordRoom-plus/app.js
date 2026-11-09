(() => {
  const naturalPitch={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  const tonicOptions=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
  const chromatic=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
  const scaleCatalog=[
    {id:'major',name:'Major',steps:[0,2,4,5,7,9,11],letters:[0,1,2,3,4,5,6],desc:'A bright, familiar seven-note scale.'},
    {id:'natural-minor',name:'Natural minor',steps:[0,2,3,5,7,8,10],letters:[0,1,2,3,4,5,6],desc:'A versatile minor scale with a warm, reflective sound.'},
    {id:'harmonic-minor',name:'Harmonic minor',steps:[0,2,3,5,7,8,11],letters:[0,1,2,3,4,5,6],desc:'Minor with a raised seventh, creating a strong pull to the tonic.'},
    {id:'melodic-minor',name:'Melodic minor',steps:[0,2,3,5,7,9,11],letters:[0,1,2,3,4,5,6],desc:'Minor with raised sixth and seventh for a smoother upward colour.'},
    {id:'dorian',name:'Dorian',steps:[0,2,3,5,7,9,10],letters:[0,1,2,3,4,5,6],desc:'A minor mode with a brighter raised sixth.'},
    {id:'phrygian',name:'Phrygian',steps:[0,1,3,5,7,8,10],letters:[0,1,2,3,4,5,6],desc:'A minor mode with a distinctive lowered second.'},
    {id:'lydian',name:'Lydian',steps:[0,2,4,6,7,9,11],letters:[0,1,2,3,4,5,6],desc:'A major mode with a floating, raised fourth.'},
    {id:'mixolydian',name:'Mixolydian',steps:[0,2,4,5,7,9,10],letters:[0,1,2,3,4,5,6],desc:'A major mode with a relaxed, lowered seventh.'},
    {id:'phrygian-dominant',name:'Phrygian dominant',steps:[0,1,4,5,7,8,10],letters:[0,1,2,3,4,5,6],desc:'A dramatic mode with a lowered second and major third.'},
    {id:'double-harmonic',name:'Double harmonic (often called Oriental)',steps:[0,1,4,5,7,8,11],letters:[0,1,2,3,4,5,6],desc:'A symmetrical, distinctive scale with two augmented seconds.'},
    {id:'major-pentatonic',name:'Major pentatonic',steps:[0,2,4,7,9],letters:[0,1,2,4,5],desc:'A five-note major scale with a clear, open sound.'},
    {id:'minor-pentatonic',name:'Minor pentatonic',steps:[0,3,5,7,10],letters:[0,2,3,4,6],desc:'A five-note minor scale heard throughout blues and rock.'},
    {id:'blues',name:'Blues',steps:[0,3,5,6,7,10],letters:[0,2,3,3,4,6],desc:'A six-note minor pentatonic scale with an added blue note.'}
  ];
  const state={tonic:'C',scale:scaleCatalog[0],degree:null};
  const keyboard=document.getElementById('keyboard');let audioCtx,master;
  const midiStart=()=>60+tonicPc(),midiEnd=()=>midiStart()+23;
  const pitchOfName=name=>{const match=name.match(/^([A-G])([♯♭]?)$/);return (naturalPitch[match[1]]+(match[2]==='♯'?1:match[2]==='♭'?-1:0)+12)%12;};
  const tonicPc=()=>pitchOfName(state.tonic);
  const midiPc=midi=>((midi%12)+12)%12;
  const midiName=midi=>chromatic[midiPc(midi)];
  const midiLabel=midi=>`${midiName(midi)}${Math.floor(midi/12)-1}`;
  function spellingFor(stepIndex){
    const scale=state.scale, count=scale.steps.length, i=((stepIndex%count)+count)%count, octave=Math.floor(stepIndex/count);
    const tonicLetter=state.tonic[0], letters=['C','D','E','F','G','A','B'], start=letters.indexOf(tonicLetter), letter=letters[(start+scale.letters[i])%7];
    const naturalOctave=scale.letters[i]+Math.floor((start+scale.letters[i])/7);const wanted=(tonicPc()+scale.steps[i]+12*octave)%12;let diff=(wanted-naturalPitch[letter]+12)%12;if(diff>6)diff-=12;
    const accidental=diff===1?'♯':diff===2?'𝄪':diff===-1?'♭':diff===-2?'𝄫':'';
    return `${letter}${accidental}`;
  }
  function scaleMidiForDegree(degree,octave=0){return midiStart()+state.scale.steps[degree]+12*octave;}
  function chordForDegree(degree){
    const count=state.scale.steps.length,rootMidi=scaleMidiForDegree(degree);
    const indices=[degree,degree+2,degree+4];
    return indices.map((scaleIndex,j)=>{const octave=Math.floor(scaleIndex/count);const idx=scaleIndex%count;const midi=midiStart()+state.scale.steps[idx]+12*octave;const semitones=midi-rootMidi;return{midi,letter:spellingFor(scaleIndex),interval:j===0?'Root':(j===1?intervalName(semitones):intervalName(semitones)),degree:degreeLabel(idx+1+(scaleIndex>=count?count:0)),scaleIndex};});
  }
  function intervalName(n){const values={1:'Minor 2nd',2:'Major 2nd',3:'Minor 3rd',4:'Major 3rd',5:'Perfect 4th',6:'Tritone',7:'Perfect 5th',8:'Minor 6th',9:'Major 6th',10:'Minor 7th',11:'Major 7th',12:'Octave',13:'Minor 9th',14:'Major 9th'};return values[n]||`${n} semitones`;}
  function degreeLabel(n){const labelsByScale={'major':['I','II','III','IV','V','VI','VII'],'natural-minor':['I','II','♭III','IV','V','♭VI','♭VII'],'harmonic-minor':['I','II','♭III','IV','V','♭VI','VII'],'melodic-minor':['I','II','♭III','IV','V','VI','VII'],'dorian':['I','II','♭III','IV','V','VI','♭VII'],'phrygian':['I','♭II','♭III','IV','V','♭VI','♭VII'],'lydian':['I','II','III','♯IV','V','VI','VII'],'mixolydian':['I','II','III','IV','V','VI','♭VII'],'phrygian-dominant':['I','♭II','III','IV','V','♭VI','♭VII'],'double-harmonic':['I','♭II','III','IV','V','♭VI','VII'],'major-pentatonic':['I','II','III','V','VI'],'minor-pentatonic':['I','♭III','IV','V','♭VII'],'blues':['I','♭III','IV','♭V','V','♭VII']};const labels=labelsByScale[state.scale.id]||['I','II','III','IV','V','VI','VII'];const index=(n-1)%labels.length,octave=Math.floor((n-1)/labels.length);return `${labels[index]}${octave?' ↑':''}`;}
  function triadQuality(notes){const a=notes[1].midi-notes[0].midi,b=notes[2].midi-notes[0].midi;if(a===4&&b===7)return '';if(a===3&&b===7)return 'm';if(a===3&&b===6)return 'dim';if(a===4&&b===8)return 'aug';if(a===2&&b===7)return 'sus2';if(a===5&&b===7)return 'sus4';return `${intervalName(a)} · ${intervalName(b)}`;}
  function renderSelectors(){const tonic=document.getElementById('tonic'),scale=document.getElementById('scale-type');tonic.innerHTML=tonicOptions.map(n=>`<option value="${n}">${n}</option>`).join('');scale.innerHTML=scaleCatalog.map(s=>`<option value="${s.id}">${s.name}</option>`).join('');tonic.value=state.tonic;scale.value=state.scale.id;document.getElementById('scale-description').textContent=state.scale.desc;}
  function renderChord(){
    const cards=document.getElementById('note-cards'),symbol=document.getElementById('chord-symbol'),subtitle=document.getElementById('chord-subtitle'),badge=document.getElementById('degree-badge'),status=document.getElementById('degree-status'),play=document.getElementById('play-chord');
    if(state.degree===null){symbol.textContent='—';subtitle.textContent=`${state.tonic} ${state.scale.name}`;badge.textContent='—';status.textContent='CHOOSE A SCALE NOTE';play.disabled=true;cards.innerHTML='<div class="empty-construction">Choose a coloured scale note to see its chord.</div>';return;}
    const notes=chordForDegree(state.degree),root=notes[0],quality=triadQuality(notes),rootLabel=root.letter;symbol.textContent=`${rootLabel}${quality}`;subtitle.textContent=`${state.tonic} ${state.scale.name} · ${degreeLabel(state.degree+1)} degree`;badge.textContent=`${degreeLabel(state.degree+1)} chord`;status.textContent=`${degreeLabel(state.degree+1)} DEGREE`;play.disabled=false;
    cards.innerHTML=notes.map((n,i)=>`<div class="note-card"><div class="note-name">${n.letter}</div><div class="note-interval">${n.interval}</div><div class="note-degree">Scale degree ${degreeLabel(n.scaleIndex+1)}</div></div>`).join('');
  }
  function renderKeyboard(){
    const activeNotes=state.degree===null?[]:chordForDegree(state.degree).map(n=>n.midi);const activeSet=new Set(activeNotes);
    keyboard.innerHTML='';const start=midiStart(),end=midiEnd();const whiteMidi=[];for(let m=start;m<=end;m++)if(![1,3,6,8,10].includes(midiPc(m)))whiteMidi.push(m);const whiteIndex=new Map(whiteMidi.map((m,i)=>[m,i]));
    for(const midi of whiteMidi){const key=document.createElement('button');key.type='button';key.className='white-key';key.dataset.note=midi;const degree=scaleDegreeForMidi(midi);if(degree!==null){key.classList.add('scale-key');key.disabled=midi>=start+12;key.setAttribute('aria-label',`${midiLabel(midi)}, scale degree ${degreeLabel(degree+1)}${midi>=start+12?', display only':''}`);}else{key.classList.add('outside-key');key.disabled=true;key.setAttribute('aria-label',`${midiLabel(midi)}, outside selected scale`);}
      if(activeSet.has(midi))key.classList.add('chord-key');if(state.degree!==null&&midi===chordForDegree(state.degree)[0].midi)key.classList.add('root-key');key.innerHTML=`<span class="key-label">${midiLabel(midi)}</span>`;keyboard.appendChild(key);}
    for(let midi=start;midi<=end;midi++)if([1,3,6,8,10].includes(midiPc(midi))){const key=document.createElement('button');key.type='button';key.className='black-key';const before=whiteMidi.filter(w=>w<midi).length;key.style.left=`${before/whiteMidi.length*100}%`;key.dataset.note=midi;const degree=scaleDegreeForMidi(midi);if(degree!==null){key.classList.add('scale-key');key.disabled=midi>=start+12;key.setAttribute('aria-label',`${midiLabel(midi)} black key, scale degree ${degreeLabel(degree+1)}${midi>=start+12?', display only':''}`);}else{key.classList.add('outside-key');key.disabled=true;key.setAttribute('aria-label',`${midiLabel(midi)} black key, outside selected scale`);}if(activeSet.has(midi))key.classList.add('chord-key');if(state.degree!==null&&midi===chordForDegree(state.degree)[0].midi)key.classList.add('root-key');keyboard.appendChild(key);}
  }
  function scaleDegreeForMidi(midi){const rel=(midiPc(midi)-tonicPc()+12)%12;const i=state.scale.steps.indexOf(rel);return i<0?null:i;}
  function render(){renderSelectors();renderChord();renderKeyboard();document.getElementById('root-hint').textContent=state.degree===null?`Choose a scale note in the first octave to play its chord`:`${state.tonic} ${state.scale.name} · only scale notes can start a chord`;document.querySelector('.keyboard-footer span:first-child').textContent=`Two octaves · ${midiLabel(midiStart())} to ${midiLabel(midiEnd())}`;}
  function ensureAudio(){if(!audioCtx){const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return null;audioCtx=new Ctx();master=audioCtx.createGain();master.connect(audioCtx.destination);}if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx;}
  function playNote(midi,when,duration){const ctx=ensureAudio();if(!ctx)return;const freq=440*Math.pow(2,(midi-69)/12),gain=ctx.createGain(),volume=Number(document.getElementById('volume').value)/100;gain.gain.setValueAtTime(.0001,when);gain.gain.exponentialRampToValueAtTime(Math.max(.0001,volume*.12),when+.025);gain.gain.exponentialRampToValueAtTime(.0001,when+duration);gain.connect(master);const instrument=document.getElementById('instrument').value;const osc=ctx.createOscillator();osc.type=instrument==='glass'?'sine':instrument==='warm'?'triangle':'triangle';osc.frequency.value=freq;osc.connect(gain);osc.start(when);osc.stop(when+duration+.05);if(instrument==='piano'){const overtone=ctx.createOscillator(),og=ctx.createGain();overtone.type='sine';overtone.frequency.value=freq*2;og.gain.setValueAtTime(.0001,when);og.gain.exponentialRampToValueAtTime(volume*.018,when+.012);og.gain.exponentialRampToValueAtTime(.0001,when+.32);overtone.connect(og);og.connect(master);overtone.start(when);overtone.stop(when+.34);}}
  function playCurrentChord(){if(state.degree===null)return;const notes=chordForDegree(state.degree);const ctx=ensureAudio();if(!ctx)return;const now=ctx.currentTime+.02;notes.forEach(n=>playNote(n.midi,now,2.3));const button=document.getElementById('play-chord');button.classList.add('playing');setTimeout(()=>button.classList.remove('playing'),700);}
  document.getElementById('tonic').addEventListener('change',e=>{state.tonic=e.target.value;state.degree=null;render();});
  document.getElementById('scale-type').addEventListener('change',e=>{state.scale=scaleCatalog.find(s=>s.id===e.target.value);state.degree=null;render();});
  keyboard.addEventListener('click',e=>{const key=e.target.closest('[data-note]');if(!key||key.disabled)return;const degree=scaleDegreeForMidi(Number(key.dataset.note));if(degree===null)return;state.degree=degree;render();document.getElementById('root-hint').textContent=`${midiLabel(Number(key.dataset.note))} · ${degreeLabel(degree+1)} chord`;playCurrentChord();});
  document.getElementById('play-chord').addEventListener('click',playCurrentChord);
  document.getElementById('volume').addEventListener('input',e=>{const v=Number(e.target.value);document.getElementById('volume-value').textContent=`${v}%`;});
  render();
})();
