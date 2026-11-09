(() => {
  'use strict';
  const data = window.TREE_DATA;
  const byId = new Map(data.cards.map(card => [card.id, card]));
  const viewport = document.getElementById('viewport');
  const board = document.getElementById('board');
  const cards = document.getElementById('cards');
  const links = document.getElementById('links');
  const W = 258, H = 150;
  const colors = {chigirin:'#f37ca1',ivanov:'#80a9ec',losev:'#64c999',fomichev:'#d2ae76',fedorenko:'#a591e5',voznyak:'#c19be1',zolotov:'#d3a075',ushakov:'#d6a071',kuleshov:'#8fbd86',other:'#8aa8ba'};
  let view = {x:0,y:0,zoom:1}, pointer = null;
  const bounds = (() => {
    const shown = data.cards;
    return {minX:Math.min(...shown.map(c=>c.x)),maxX:Math.max(...shown.map(c=>c.x+W)),minY:Math.min(...shown.map(c=>c.y)),maxY:Math.max(...shown.map(c=>c.y+H))};
  })();
  function initials(name){return name.replace(/\([^)]*\)/g,'').trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase()}
  function render(){
    for(const person of data.cards){
      const card=document.createElement('article');card.className='person';card.dataset.id=person.id;card.style.cssText=`left:${person.x}px;top:${person.y}px;--branch:${colors[person.branch]||colors.other}`;
      const avatar=document.createElement('div');avatar.className='avatar';
      if(person.photo){const img=document.createElement('img');img.src=person.photo;img.alt='';img.loading='lazy';img.onerror=()=>avatar.replaceChildren(document.createTextNode(initials(person.name)));avatar.append(img)}else avatar.textContent=initials(person.name);
      const copy=document.createElement('div');copy.className='copy';const name=document.createElement('div');name.className='name';name.textContent=person.name;const years=document.createElement('div');years.className='years';years.textContent=[person.birth,person.death].filter(Boolean).join(' — ')||'Даты не указаны';copy.append(name,years);card.append(avatar,copy);
      card.addEventListener('click',()=>focus(person));cards.append(card);
    }
    const svg='http://www.w3.org/2000/svg';
    for(const link of data.links){const a=byId.get(link.from),b=byId.get(link.to);if(!a||!b)continue;let d;
      if(link.kind==='parent'||link.kind==='adoptive_parent'){const x1=a.x+W/2,y1=a.y+H,x2=b.x+W/2,y2=b.y,m=(y1+y2)/2;d=`M ${x1} ${y1} C ${x1} ${m}, ${x2} ${m}, ${x2} ${y2}`}
      else{const forward=a.x<=b.x,x1=forward?a.x+W:a.x,x2=forward?b.x:b.x+W,y1=a.y+H/2,y2=b.y+H/2,m=(x1+x2)/2;d=`M ${x1} ${y1} C ${m} ${y1}, ${m} ${y2}, ${x2} ${y2}`}
      const path=document.createElementNS(svg,'path');path.setAttribute('d',d);path.setAttribute('class',`edge ${link.kind}`);links.append(path)}
    document.getElementById('counts').textContent=`${data.cards.length} человек · ${data.links.length} связей`;
  }
  function apply(){board.style.transform=`translate(${view.x}px,${view.y}px) scale(${view.zoom})`;document.getElementById('zoom').textContent=Math.round(view.zoom*100)+'%'}
  function fit(){const r=viewport.getBoundingClientRect(),w=bounds.maxX-bounds.minX,h=bounds.maxY-bounds.minY;view.zoom=Math.max(.08,Math.min(1.25,(r.width-80)/w,(r.height-80)/h));view.x=(r.width-w*view.zoom)/2-bounds.minX*view.zoom;view.y=(r.height-h*view.zoom)/2-bounds.minY*view.zoom;apply()}
  function focus(person){const r=viewport.getBoundingClientRect();view.zoom=Math.max(view.zoom,.8);view.x=r.width/2-(person.x+W/2)*view.zoom;view.y=r.height/2-(person.y+H/2)*view.zoom;apply();document.querySelectorAll('.person.focus').forEach(el=>el.classList.remove('focus'));document.querySelector(`[data-id="${person.id}"]`)?.classList.add('focus')}
  function zoom(factor,cx,cy){const r=viewport.getBoundingClientRect(),x=cx-r.left,y=cy-r.top,next=Math.max(.08,Math.min(2.5,view.zoom*factor)),ratio=next/view.zoom;view.x=x-(x-view.x)*ratio;view.y=y-(y-view.y)*ratio;view.zoom=next;apply()}
  viewport.addEventListener('pointerdown',e=>{if(e.target.closest('.person'))return;pointer={x:e.clientX,y:e.clientY,viewX:view.x,viewY:view.y};viewport.setPointerCapture(e.pointerId);viewport.classList.add('grabbing')});
  viewport.addEventListener('pointermove',e=>{if(!pointer)return;view.x=pointer.viewX+e.clientX-pointer.x;view.y=pointer.viewY+e.clientY-pointer.y;apply()});
  viewport.addEventListener('pointerup',()=>{pointer=null;viewport.classList.remove('grabbing')});
  viewport.addEventListener('wheel',e=>{if(!e.ctrlKey)return;e.preventDefault();zoom(e.deltaY<0?1.18:1/1.18,e.clientX,e.clientY)},{passive:false});
  document.getElementById('fit').addEventListener('click',fit);
  document.getElementById('root').addEventListener('click',()=>{const root=data.cards.find(c=>c.name==='Чигирин Емельян');if(root)focus(root)});
  document.getElementById('plus').addEventListener('click',()=>{const r=viewport.getBoundingClientRect();zoom(1.2,r.left+r.width/2,r.top+r.height/2)});
  document.getElementById('minus').addEventListener('click',()=>{const r=viewport.getBoundingClientRect();zoom(1/1.2,r.left+r.width/2,r.top+r.height/2)});
  document.getElementById('search').addEventListener('input',e=>{const query=e.target.value.trim().toLocaleLowerCase('ru');if(query.length<2)return;const person=data.cards.find(c=>c.name.toLocaleLowerCase('ru').includes(query));if(person)focus(person)});
  render();requestAnimationFrame(()=>{const root=data.cards.find(c=>c.name==='Чигирин Емельян');if(root){view.zoom=.9;focus(root)}else fit()});
})();
