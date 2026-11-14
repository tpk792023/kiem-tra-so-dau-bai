(function(){
/* Nút "Lấy sổ đầu bài" chạy trên trang vnEdu: chỉ ĐỌC sổ, không sửa gì. */
var CS=document.currentScript;var BASE=CS&&CS.src?CS.src.split('lay-so.js')[0]:'https://tpk792023.github.io/kiem-tra-so-dau-bai/';
if(window.__ksdbPanel&&document.body.contains(window.__ksdbPanel)){window.__ksdbPanel.style.display='block';return}
if(typeof Ext==='undefined'){alert('Thầy cô mở trang vnEdu (Sổ đầu bài → Chi tiết sổ đầu bài) rồi mới bấm nút này.');return}
var G=window.__ksdbData=window.__ksdbData||{};
function comps(){var a=Ext.ComponentManager.all;return a.getArray?a.getArray():(a.items||[])}
function combo(n){var l=comps().filter(function(c){return c.name===n&&c.store&&!c.isDestroyed&&c.rendered&&c.el&&c.el.dom&&document.body.contains(c.el.dom)&&c.el.dom.offsetParent});return l[l.length-1]}
function txt(e){return e?(e.innerText||e.textContent||'').replace(/\u00a0/g,' ').replace(/[ \t]+/g,' ').trim():''}
function grab(){
  var f=document.querySelector('form[id$="_frm"]');if(!f)return null;var t=f.querySelector('table.table');if(!t)return null;
  var lc=combo('cboLopHoc'),lop=lc?lc.getRawValue():'';var ti=f.querySelector('input[name=iTuanHoc]');var tuan=ti?ti.value:'';
  var dates={};[].forEach.call(t.querySelectorAll('div[class^="thu"]'),function(d){dates[d.className.replace('thu','')]=txt(d)});
  var rows=[];
  [].forEach.call(t.querySelectorAll('td[tiet]'),function(td){
    if(!td.getAttribute('buoi'))return; // ô vắng cũng có thuộc tính tiet
    var c=[],n=td.nextElementSibling;while(n){c.push(n);n=n.nextElementSibling}
    var thu=td.getAttribute('thu');var vc=c[3];var names=vc?[].map.call(vc.querySelectorAll('p'),txt).filter(Boolean):[];
    var sl=td.getAttribute('soluong_nghi');var vt=txt(vc);var m=vt.match(/V[ắa]ng:\s*(\d+)/i);var tong=m?m[1]:(sl!==''&&sl!=null?sl:''); // lấy số vắng hiện trên sổ ("Vắng: N"), thuộc tính ẩn soluong_nghi có lúc sai    var P=0,K=0;names.forEach(function(s){if(/\(\s*P\s*\)/i.test(s))P++;else if(/\(\s*K\s*\)/i.test(s))K++});
    var dx=txt(c[7]);var dm=dx.match(/^([\d.,]+)\s*\/\s*(.*)$/);
    rows.push([lop,tuan,(thu==='8'||thu==='1'?'CN':'Thứ '+thu)+' ('+(dates[thu]||'')+')',td.getAttribute('buoi')==='2'?'Chiều':'Sáng',
      td.getAttribute('tiet'),txt(c[1]),txt(c[2]),tong===''?'':('Vắng: '+tong+(names.length?' – '+names.join(', '):'')),
      tong===''?'':P,tong===''?'':K,txt(c[4]),txt(c[6]),dm?dm[1]:(dx&&!isNaN(parseFloat(dx))?dx:''),dm?dm[2]:(isNaN(parseFloat(dx))?dx:''),txt(c[8]),txt(c[8])]);
  });
  var s=f.innerText||'';var i=s.indexOf('Ý kiến nhận xét của BGH');var j=s.indexOf('- Tổng số tiết');
  var foot=i>=0?s.slice(i+24,j>i?j:undefined):'';var parts=[],re=/([\s\S]*?)Người ký:\s*([^\n]*)/g,mm;
  while((mm=re.exec(foot))){parts.push({text:mm[1].replace(/[.…]{3,}/g,' ').replace(/\s+/g,' ').trim(),ky:mm[2].trim()})}
  var gvcn=parts.length>1?parts[0]:null,bgh=parts.length>1?parts[1]:null;
  if(parts.length===1){var shl=rows.filter(function(r){return /sinh ho[aạ]t/i.test(r[5])&&r[14]}).map(function(r){return r[14]})[0];
    if(/GVCN|thống nhất|đồng ý/i.test(parts[0].text)||(shl&&shl!==parts[0].ky))bgh=parts[0];else gvcn=parts[0]}
  var kt=s.match(/Tổng số tiết không thực hiện:\s*(\d+)[^(\n]*(\([^)]*\))?/);
  rows.forEach(function(r,k){if(k){r.push('','','');return}r.push(gvcn&&gvcn.text?gvcn.text+' ('+gvcn.ky+')':'',bgh&&bgh.text?bgh.text+' ('+bgh.ky+')':'',kt?(+kt[1]?kt[1]+' '+(kt[2]||''):'0'):'')});
  return {lop:lop,tuan:tuan,rows:rows};
}
function wait(ms){return new Promise(function(r){setTimeout(r,ms)})}
async function select(c,id){var f=document.querySelector('form[id$="_frm"] table.table');if(f)f.__old=1;
  var rec=c.store.findRecord(c.valueField,id);if(String(c.getValue())===String(id)&&f){f.__old=0;return true}
  c.setValue(id);c.fireEvent('select',c,[rec]);var t0=Date.now();
  while(Date.now()-t0<30000){await wait(300);var t=document.querySelector('form[id$="_frm"] table.table');if(t&&!t.__old&&t.querySelector('td[tiet]')){await wait(200);return true}}
  return false}
var H=['Lớp','Tuần','Thứ, ngày','Buổi','Tiết','Môn học','Tiết PPCT','HS vắng','Vắng có phép','Vắng không phép','Tên bài dạy','Nhận xét','Điểm','Xếp loại','Giáo viên','Ký tên','Phê GVCN','Phê BGH','Tiết không thực hiện','Tuần tham chiếu'];
function count(){return Object.keys(G).length}
function tsv(){var out=[H.join('\t')];Object.keys(G).sort().forEach(function(k){var ref=G[k].ref?'x':'';G[k].rows.forEach(function(r){out.push(r.concat([ref]).map(function(v){return String(v==null?'':v).replace(/[\t\r\n]+/g,' ')}).join('\t'))})});return out.join('\n')}
function copy(){var s=tsv();var ok=function(){status('Đã chép '+count()+' sổ. Sang trang Kiểm tra sổ đầu bài, bấm “Dán từ vnEdu”.')};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(s).then(ok,fb);else fb();
  function fb(){var a=document.createElement('textarea');a.value=s;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();ok()}}
var CHECK_URL=BASE;
function send(){if(!count()){status('Chưa gom sổ nào. Bấm “Lấy sổ” trước.');return}
  var s=tsv(),w=window.open(CHECK_URL,'_blank');if(!w){status('Trình duyệt chặn mở cửa sổ mới. Thầy cô dùng nút “Chép để dán”.');return}
  status('Đang gửi sang trang kiểm tra…');var done=false;
  function on(e){if(e.source!==w||e.data!=='ksdb-ready')return;done=true;w.postMessage({type:'ksdb-data',tsv:s},'*');window.removeEventListener('message',on);status('Đã gửi '+count()+' sổ sang trang kiểm tra.')}
  window.addEventListener('message',on);setTimeout(function(){if(!done){window.removeEventListener('message',on);status('Không gửi được. Thầy cô dùng nút “Chép để dán”.')}},30000)}
var P=document.createElement('div');window.__ksdbPanel=P;
P.style.cssText='position:fixed;right:16px;bottom:16px;z-index:999999;background:#fff;color:#142039;border:2px solid #0f3d8c;border-radius:12px;padding:12px 14px;width:330px;font:13px/1.45 Arial,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.25)';
P.innerHTML='<b style="font-size:15px;color:#0f3d8c">Lấy sổ đầu bài để kiểm tra</b><a id="kx" style="float:right;cursor:pointer;font-size:16px">✕</a>'+
 '<div style="margin:6px 0;color:#5d6880">Chỉ đọc sổ, không sửa gì trên vnEdu.</div>'+
 '<div>Tuần từ <input id="kt1" style="width:40px"> đến <input id="kt2" style="width:40px"></div>'+
 '<label style="display:block;margin:4px 0"><input type="checkbox" id="kref" checked> Lấy kèm tuần trước để so thời khoá biểu (phát hiện GV chưa ghi sổ)</label>'+
 '<div style="margin:4px 0">Lớp: <select id="kl" style="max-width:150px"><option value="">Tất cả lớp</option></select></div>'+
 '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"><button id="kgo">Lấy sổ</button><button id="ksend" style="font-weight:bold">Gửi sang trang kiểm tra</button><button id="kcp">Chép để dán</button><button id="kclr">Xoá đã gom</button><button id="kstop" style="display:none">Dừng</button></div>'+
 '<div id="kst" style="margin-top:8px;color:#0f7a3d"></div>';
document.body.appendChild(P);
function $(i){return P.querySelector('#'+i)}
function status(s){$('kst').textContent=s}
var lc=combo('cboLopHoc'),wc=combo('cboTuanHoc');
if(!lc||!wc){status('Thầy cô mở mục Sổ đầu bài → Chi tiết sổ đầu bài trước, rồi bấm lại nút.');}
else{$('kt1').value=$('kt2').value=wc.getValue();lc.store.each(function(r){var o=document.createElement('option');o.value=r.get(lc.valueField);o.textContent=r.get(lc.displayField);$('kl').appendChild(o)});
  $('kl').value=String(lc.getValue());status('Đã gom '+count()+' sổ.')}
var stop=false;
$('kx').onclick=function(){P.style.display='none'};
$('kclr').onclick=function(){for(var k in G)delete G[k];status('Đã xoá. Đã gom 0 sổ.')};
$('kstop').onclick=function(){stop=true};
$('kcp').onclick=copy;$('ksend').onclick=send;
$('kgo').onclick=async function(){if(!lc||!wc)return;stop=false;var w1=+$('kt1').value||wc.getValue(),w2=+$('kt2').value||w1;if(w2<w1){var x=w1;w1=w2;w2=x}
  var lops=$('kl').value?[$('kl').value]:lc.store.getRange().map(function(r){return r.get(lc.valueField)});
  $('kgo').disabled=true;$('kstop').style.display='';var w0=$('kref').checked&&w1>1?w1-1:w1;var n=0,tot=(w2-w0+1)*lops.length,err=0;
  for(var w=w0;w<=w2&&!stop;w++){var isRef=w<w1;if(!(await select(wc,w))){err++;continue}
    for(var i=0;i<lops.length&&!stop;i++){status('Đang đọc tuần '+w+', lớp '+lc.store.findRecord(lc.valueField,lops[i]).get(lc.displayField)+' ('+(++n)+'/'+tot+')…');
      if(!(await select(lc,lops[i]))){err++;continue}var d=grab();if(d&&d.rows.length){var key=d.lop+'|'+String(d.tuan).padStart(2,'0');d.ref=isRef&&!(G[key]&&!G[key].ref);G[key]=d}}}
  $('kgo').disabled=false;$('kstop').style.display='none';
  status((stop?'Đã dừng. ':'Xong! ')+'Đã gom '+count()+' sổ'+(err?' ('+err+' lần tải lỗi)':'')+'. Bấm “Gửi sang trang kiểm tra”.')};
})();
