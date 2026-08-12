export const INTERACTION_CSS = `
.interaction-test { padding: 12px; margin: 8px 0; background: #fff8e1; border-radius: 8px; border: 2px dashed #ff9800; }
.interaction-test h4 { margin: 0 0 8px; color: #e65100; font-size: 14px; }
.btn-group { display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
.test-btn { padding: 10px 16px; background: #1976d2; color: #fff; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; }
.test-btn:active { transform: scale(0.95); }
.draggable { width: 80px; height: 80px; background: linear-gradient(135deg, #ff9800, #f44336); color: #fff; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 13px; font-weight: bold; cursor: grab; position: relative; touch-action: none; user-select: none; box-shadow: 0 4px 8px rgba(0,0,0,0.3); }`;

export const INTERACTION_HTML = `
<div class="interaction-test">
  <h4>交互测试</h4>
  <div class="btn-group">
    <button class="test-btn" onclick="this.textContent=this.textContent==='点击测试'?'已点击':'点击测试'">点击测试</button>
    <button class="test-btn" onclick="var s=this.querySelector('span');s.textContent=parseInt(s.textContent)+1">计数 <span>0</span></button>
  </div>
  <div class="draggable" id="drag-box" ontouchstart="startDrag(event)" onmousedown="startDrag(event)">拖拽我</div>
</div>`;

export const INTERACTION_JS = `
<script>
var dragEl=null,offX=0,offY=0;
function startDrag(e){dragEl=document.getElementById('drag-box');var r=dragEl.getBoundingClientRect();var t=e.touches?e.touches[0]:e;offX=t.clientX-r.left;offY=t.clientY-r.top;e.preventDefault();}
function moveDrag(e){if(!dragEl)return;var t=e.touches?e.touches[0]:e;dragEl.style.left=(t.clientX-offX)+'px';dragEl.style.top=(t.clientY-offY)+'px';e.preventDefault();}
function endDrag(){dragEl=null;}
document.addEventListener('touchmove',moveDrag,{passive:false});
document.addEventListener('touchend',endDrag);
document.addEventListener('mousemove',moveDrag);
document.addEventListener('mouseup',endDrag);
</script>`;
