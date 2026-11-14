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
    var sl=td.getAttribute('soluong_nghi');var vt=txt(vc);var m=vt.match(/V[ắa]ng:\s*(\d+)/i);var tong=m?m[1]:(sl!==''&&sl!=null?sl:''); /* lấy số vắng hiện trên sổ ("Vắng: N"), thuộc tính ẩn soluong_nghi có lúc sai */
    var P=0,K=0;names.forEach(function(s){if(/\(\s*P\s*\)/i.test(s))P++;else if(/\(\s*K\s*\)/i.test(s))K++});
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
/* trạng thái ký số (mục Ký số PDF → Danh sách sổ đầu bài), chỉ đọc */
var KY=window.__ksdbKy=window.__ksdbKy||{};
function aj(call,p){return new Promise(function(res,rej){if(window.jQuery)jQuery.ajax({url:'?call='+call,data:p,type:'get',dataType:'json',success:res,error:function(x,s,e){rej(s)}});
  else Ext.Ajax.request({url:'?call='+call,method:'GET',params:p,success:function(r){try{res(JSON.parse(r.responseText))}catch(e){rej(e)}},failure:rej})})}
function kyAll(){var a=[];Object.keys(KY).sort(function(x,y){return x-y}).forEach(function(w){a=a.concat(KY[w])});return a}
function bo(s){return String(s).replace(/ /g,'')}
async function layKySo(w1,w2,tenLop){var cc=combo('cap'),cap=cc?cc.getValue():2,chua=[],tong=0;
  for(var w=w1;w<=w2&&!stop;w++){status('Đang xem trạng thái ký số tuần '+w+'…');var L;
    try{L=await aj('app.kyso.hocba.serv.hoc_ba_dien_tu.danhSachSoDiemTongHop',{object_type:33,khoi_hoc_id:0,lop_id:0,cap_hoc:cap,diem_truong_id:0,hoc_ky:w,giao_vien_id:0,trang_thai_ky:0,role:1,page:1,start:0,limit:500})}catch(e){chua.push(w+' (lỗi)');continue}
    var files=(L&&L.data||[]).filter(function(f){return !tenLop||bo(f.lop)===bo(tenLop)});
    if(!files.length){chua.push(w);delete KY[w];continue}var out=[];
    for(var i=0;i<files.length&&!stop;i++){var f=files[i],D;
      try{D=await aj('app.kyso.hocba.serv.hoc_ba_dien_tu.danhSachKyMonPhu',{id:f.id,lop_hoc_id:f.lop_hoc_id,page:1,start:0,limit:100})}catch(e){continue}
      var mons=D&&D.data||[],thieu=mons.filter(function(m){return +m.status!==1});
      thieu.forEach(function(m){out.push({tuan:w,lop:f.lop,vaitro:'GVBM',gv:m.full_name,mon:m.ten_mon_hoc})});
      if(!thieu.length&&mons.length&&+f.gvcn!==1)out.push({tuan:w,lop:f.lop,vaitro:'GVCN',gv:'',mon:''});
      else if(+f.gvcn===1&&+f.bgh!==1)out.push({tuan:w,lop:f.lop,vaitro:'BGH',gv:'',mon:''});tong++}
    KY[w]=out}
  return {chua:chua,tong:tong}}
function tsv(){var out=[H.join('\t')];Object.keys(G).sort().forEach(function(k){var ref=G[k].ref?'x':'';G[k].rows.forEach(function(r){out.push(r.concat([ref]).map(function(v){return String(v==null?'':v).replace(/[\t\r\n]+/g,' ')}).join('\t'))})});var k=kyAll();return out.join('\n')+(k.length?'\n#KYSO\n'+JSON.stringify(k):'')}
function copy(){var s=tsv();var ok=function(){status('Đã chép '+count()+' sổ. Sang trang Kiểm tra sổ đầu bài, bấm “Dán từ vnEdu”.')};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(s).then(ok,fb);else fb();
  function fb(){var a=document.createElement('textarea');a.value=s;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();ok()}}
var CHECK_URL=BASE;
function send(){if(!count()){status('Chưa gom sổ nào. Bấm “Lấy sổ” trước.');return}
  var s=tsv(),w=window.open(CHECK_URL,'_blank');if(!w){status('Trình duyệt chặn mở cửa sổ mới. Thầy cô dùng nút “Chép để dán”.');return}
  status('Đang gửi sang trang kiểm tra…');var done=false;
  function on(e){if(e.source!==w||e.data!=='ksdb-ready')return;done=true;w.postMessage({type:'ksdb-data',tsv:s,ky:kyAll()},'*');window.removeEventListener('message',on);status('Đã gửi '+count()+' sổ sang trang kiểm tra.')}
  window.addEventListener('message',on);setTimeout(function(){if(!done){window.removeEventListener('message',on);status('Không gửi được. Thầy cô dùng nút “Chép để dán”.')}},30000)}
var P=document.createElement('div');window.__ksdbPanel=P;
P.style.cssText='position:fixed;right:16px;bottom:16px;z-index:999999;background:#fff;color:#142039;border:2px solid #0f3d8c;border-radius:12px;padding:12px 14px;width:330px;font:13px/1.45 Arial,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.25)';
P.innerHTML='<b style="font-size:15px;color:#0f3d8c">Lấy sổ đầu bài để kiểm tra</b><a id="kx" style="float:right;cursor:pointer;font-size:16px">✕</a>'+
 '<div style="margin:6px 0;color:#5d6880">Chỉ đọc sổ, không sửa gì trên vnEdu.</div>'+
 '<div>Tuần từ <input id="kt1" style="width:40px"> đến <input id="kt2" style="width:40px"></div>'+
 '<label style="display:block;margin:4px 0"><input type="checkbox" id="kky" checked> Lấy kèm trạng thái ký số (ai chưa ký số sổ đầu bài)</label>'+
 '<label style="display:block;margin:4px 0"><input type="checkbox" id="kref" checked> Lấy kèm tuần trước để so thời khoá biểu (phát hiện GV chưa ghi sổ)</label>'+
 '<div style="margin:4px 0">Lớp: <select id="kl" style="max-width:150px"><option value="">Tất cả lớp</option></select></div>'+
 '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"><button id="kgo">Lấy sổ</button><button id="ksend" style="font-weight:bold">Gửi sang trang kiểm tra</button><button id="kcp">Chép để dán</button><button id="kclr">Xoá đã gom</button><button id="kstop" style="display:none">Dừng</button></div>'+
 '<div id="kst" style="margin-top:8px;color:#0f7a3d"></div>'+
 '<div style="border-top:1px solid #dfe4ee;margin-top:10px;padding-top:8px"><b style="color:#0f3d8c">Điểm cuối kì → xếp hạng theo khối</b>'+
 '<div style="margin:4px 0">Học kỳ <select id="dhk"><option value="1">Học kỳ 1</option><option value="2">Học kỳ 2</option></select> Khối <select id="dkh"><option value="">Tất cả</option></select></div>'+
 '<div style="display:flex;gap:6px;flex-wrap:wrap"><button id="dgo">Lấy điểm và xếp hạng</button><button id="dcp">Chép điểm để dán</button></div>'+
 '<div id="dst" style="margin-top:6px;color:#0f7a3d"></div></div>';
document.body.appendChild(P);
function $(i){return P.querySelector('#'+i)}
function status(s){$('kst').textContent=s}
var lc=combo('cboLopHoc'),wc=combo('cboTuanHoc');
if(!lc||!wc){status('Thầy cô mở mục Sổ đầu bài → Chi tiết sổ đầu bài trước, rồi bấm lại nút.');}
else{$('kt1').value=$('kt2').value=wc.getValue();lc.store.each(function(r){var o=document.createElement('option');o.value=r.get(lc.valueField);o.textContent=r.get(lc.displayField);$('kl').appendChild(o)});
  $('kl').value=String(lc.getValue());status('Đã gom '+count()+' sổ.')}
var stop=false;
/* ===== điểm đánh giá cuối kì (ĐĐGck) từ Sổ điểm – chỉ đọc ===== */
var DIEM=window.__ksdbDiem=window.__ksdbDiem||[];
function dst(t){$('dst').textContent=t}
function J(x){try{return typeof x==='string'?JSON.parse(x):x}catch(e){return null}}
function ajx(u,p,m){return new Promise(function(res,rej){jQuery.ajax({url:u,data:p||{},type:m||'get',success:res,error:function(x,s){rej(s)}})})}
var NH=window.phpviet_nam_hoc;var capNow=(combo('cap')&&combo('cap').getValue())||2;
(capNow==1?[1,2,3,4,5]:[6,7,8,9]).forEach(function(k){var o=document.createElement('option');o.value=k;o.textContent='Khối '+k;$('dkh').appendChild(o)});
function docCk(h,lop,khoi,mon){var th=(h.match(/<thead>([\s\S]*?)<\/thead>/)||[])[1]||'';var m=th.match(/b='(\d+)'[^>]*cn='ĐĐGck'/)||th.match(/cn='ĐĐGck'[^>]*b='(\d+)'/);if(!m)return 0;var b=m[1];
  var tb=(h.match(/<tbody>([\s\S]*?)<\/tbody>/)||[])[1]||'';var d=document.createElement('tbody');d.innerHTML=tb.replace(/<script[\s\S]*?<\/script>/gi,'');var n=0;
  [].forEach.call(d.querySelectorAll('tr'),function(tr){var td=tr.children;if(td.length<5)return;var sp=tr.querySelector('.input_diem[b="'+b+'"][c="1"]');var v=sp?txt(sp):'';
    DIEM.push([khoi,lop,txt(td[1]),(txt(td[2])+' '+txt(td[3])).trim(),txt(td[4]),mon,v]);n++});return n}
async function layDiem(){if(!window.jQuery||!NH){dst('Không đọc được năm học trên trang vnEdu.');return}stop=false;DIEM.length=0;
  var hk=$('dhk').value,ks=$('dkh').value?[+$('dkh').value]:(capNow==1?[1,2,3,4,5]:[6,7,8,9]);$('dgo').disabled=true;$('kstop').style.display='';var lops=[];
  for(var i=0;i<ks.length;i++){var l=J(await ajx('?call=edu.khoi_hoc.getLopByKhoix&nam_hoc='+NH,{khoi:ks[i]}));(l&&(l.data||l)||[]).forEach(function(x){if(+x.khoi===ks[i])lops.push({id:x.id,ten:x.ten,khoi:ks[i]})})}
  var nlop=0,nmon=0;
  for(var a=0;a<lops.length&&!stop;a++){var L=lops[a];var mons=J(await ajx('?call=edu.so_diem.getMon&nam_hoc='+NH,{lop_id:L.id,iLopId:L.id,lop_hoc_id:L.id,hoc_ky_id:hk}))||[];
    for(var b=0;b<mons.length&&!stop;b++){dst('Năm học '+NH+'-'+(+NH+1)+', HK'+hk+': lớp '+L.ten+' ('+(a+1)+'/'+lops.length+'), môn '+mons[b].ten+'…');
      try{var h=await ajx('?load=edu.so_diem.nhap',{winid:'ksdbdiem',nam_hoc:NH,iLopId:L.id,iKhoi:L.khoi,iMonHocId:mons[b].id,iHocKyId:hk,thang:0,muc:'',dot_diem_id:0,dot_diem_data:'',dot_id:0,dm_cua_mon_hoc:0,dm_cua_khoi_hoc:0,dm_cua_toi:0},'POST');
        if(docCk(h,L.ten,L.khoi,mons[b].ten))nmon++}catch(e){}}
    nlop++}
  $('dgo').disabled=false;$('kstop').style.display='none';
  var co=DIEM.filter(function(r){return r[6]!==''}).length;
  dst((stop?'Đã dừng. ':'Xong! ')+nlop+' lớp, '+nmon+' sổ môn, '+co+' điểm cuối kì.'+(co?' Đang mở trang xếp hạng…':' Chưa có điểm cuối kì (học kỳ chưa kết thúc?).'));if(co)guiDiem()}
function diemTsv(){return [['Khối','Lớp','Mã HS','Họ và tên','Ngày sinh','Môn','ĐĐGck'].join('\t')].concat(DIEM.map(function(r){return r.map(function(v){return String(v==null?'':v).replace(/[\t\r\n]+/g,' ')}).join('\t')})).join('\n')}
function guiDiem(){var t=diemTsv(),w=window.open(BASE+'xep-hang.html','_blank');if(!w){dst('Trình duyệt chặn mở cửa sổ mới. Dùng nút “Chép điểm để dán”.');return}var done=false;
  function on(e){if(e.source!==w||e.data!=='ksdb-ready')return;done=true;w.postMessage({type:'ksdb-diem',tsv:t,nam:NH,hk:$('dhk').value},'*');window.removeEventListener('message',on);dst('Đã gửi '+DIEM.length+' dòng điểm sang trang xếp hạng.')}
  window.addEventListener('message',on);setTimeout(function(){if(!done){window.removeEventListener('message',on);dst('Không gửi được. Dùng nút “Chép điểm để dán”.')}},30000)}
function chepDiem(){if(!DIEM.length){dst('Chưa lấy điểm. Bấm “Lấy điểm và xếp hạng” trước.');return}var t=diemTsv();
  var ok=function(){dst('Đã chép '+DIEM.length+' dòng điểm. Sang trang Xếp hạng, bấm “Dán từ vnEdu”.')};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(ok,fb);else fb();
  function fb(){var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();ok()}}
$('kx').onclick=function(){P.style.display='none'};
$('kclr').onclick=function(){for(var k in G)delete G[k];for(var q in KY)delete KY[q];status('Đã xoá. Đã gom 0 sổ.')};
$('kstop').onclick=function(){stop=true};
$('kcp').onclick=copy;$('ksend').onclick=send;$('dgo').onclick=layDiem;$('dcp').onclick=chepDiem;
$('kgo').onclick=async function(){if(!lc||!wc)return;stop=false;var w1=+$('kt1').value||wc.getValue(),w2=+$('kt2').value||w1;if(w2<w1){var x=w1;w1=w2;w2=x}
  var lops=$('kl').value?[$('kl').value]:lc.store.getRange().map(function(r){return r.get(lc.valueField)});
  $('kgo').disabled=true;$('kstop').style.display='';var w0=$('kref').checked&&w1>1?w1-1:w1;var n=0,tot=(w2-w0+1)*lops.length,err=0;
  for(var w=w0;w<=w2&&!stop;w++){var isRef=w<w1;if(!(await select(wc,w))){err++;continue}
    for(var i=0;i<lops.length&&!stop;i++){status('Đang đọc tuần '+w+', lớp '+lc.store.findRecord(lc.valueField,lops[i]).get(lc.displayField)+' ('+(++n)+'/'+tot+')…');
      if(!(await select(lc,lops[i]))){err++;continue}var d=grab();if(d&&d.rows.length){var key=d.lop+'|'+String(d.tuan).padStart(2,'0');d.ref=isRef&&!(G[key]&&!G[key].ref);G[key]=d}}}
  var kq=null;if($('kky').checked&&!stop){var tl=$('kl').value?lc.store.findRecord(lc.valueField,$('kl').value).get(lc.displayField):'';try{kq=await layKySo(w1,w2,tl)}catch(e){kq=null}}
  $('kgo').disabled=false;$('kstop').style.display='none';
  status((stop?'Đã dừng. ':'Xong! ')+'Đã gom '+count()+' sổ'+(err?' ('+err+' lần tải lỗi)':'')+(kq?'; ký số: '+kq.tong+' sổ, '+kyAll().length+' chỗ chưa ký'+(kq.chua.length?' (tuần '+kq.chua.join(', ')+' chưa có file ký số – BGH chưa đóng gói)':''):'')+'. Bấm “Gửi sang trang kiểm tra”.')};
})();
