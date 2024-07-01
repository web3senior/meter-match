const can = canvas;
const ctx = can.getContext("2d");
const W=960;
const H=540;
var cw=W,ch=H,cx=0,cy=0;
//const can2 = document.createElement("canvas");
//can2.width = W; can2.height = H;
//const ctx = can2.getContext("2d");

can.addEventListener("mousemove", function () { Mouse.MouseMove(event, false) }, !1);
can.addEventListener("mousedown", function () { Mouse.MouseClick(event) }, !1);
can.addEventListener("mouseup", function () { Mouse.MouseClick(event) }, !1);
/* Touches */can.addEventListener("touchmove", function () { Mouse.TouchMove(event, true); event.preventDefault();}, !1);
/* Touches */can.addEventListener("touchstart", function () { Mouse.TouchMove(event,true); Mouse.TouchClick(); event.preventDefault(); }, !1);
/* Touches */can.addEventListener("touchend", function () { if (Mouse.Left != 0 && Mouse.Left != 1) { Mouse.Left = 0;} event.preventDefault(); }, !1);
can.tabIndex = 1;

var tab=[], light=[], vx=230, vy=20, sc={x1:-1,y1:-1,x2:-1,y2:-1}, score=0, time=0, refresh_time=0;
var tab_w=9, sz=55, tsz=tab_w*sz, s_x=[], s_l=[], fall_time=6, maxScore=0, sn_timer=[], o_particles=[];
const G = {
  isReady:false, state:"main", state2:"idle", sound:true, bg_y:0, max_delay:0, pause:false
  ,newGame(i){
    P.reset();
    L.load(i); sn_timer=[]; refresh_time=30*15; sc.x1=sc.x2=sc.y1=sc.y2=-1;
    var t=[],l=[],x,y,len, c=L.lv.t;
    for(y = 0; y < tab_w; y++){
      t[y]=[]; l[y]=[];
      for(x = 0; x < tab_w; x++){
        switch (c[y][x]) {
          case '1': t[y][x] = new Item_class(L.new_item_i(),x,y); break;
          case '0': t[y][x] = wall_obj; break;
        }
        l[y][x]=0
      }
    }

    tab=t; light=l;
    for (var j = 0; j < 100; j++) {
      if(!G.test_first_tab(t)) break;
    }

    G.state="game"; G.state2="game"; G.pause=false; score=0;
    //tab[7][2].replace_to_power(2);
    //tab[7][3].replace_to_power(0);
    if(G.CheckCrush()){
      G.state2='crush'; G.time=10;
    }
  }
  ,check_if_all_loaded(){
    for(var i=0, len=Img_arr.length ;i<len; i++){
      if(!(Img_arr[i].complete && Img_arr[i].naturalHeight !== 0)) return;
    }
    G.isReady=true;
    P.load();
    //G.newGame(0);
  }
  ,loop(){
    if(G.state == 'game'){ G.drawGame();}
    else if(G.state == 'map'){ Map.update(); Map.draw();}
    else if(G.state == 'main') G.drawMain();
    else if(G.state == 'end') G.drawEnd();

    // top right buttons
    if(DrawBtn(W-40, 10, 40, 40, img.btn_fs) && Mouse.Down('Left')) sys.swithFullscreen();
    if(DrawBtn(W-90, 10, 40, 40, G.sound?img.btn_sound_on:img.btn_sound_off) && Mouse.Down('Left')){
      G.sound=!G.sound;
      if(G.msc!=undefined){
        if(G.sound){stopSound(G.msc); playMusic(G.msc);}
        else stopSound(G.msc);
      }
    }

    if(snd_crush){ snd_crush=false; G.PlaySound(sound.crush);}
  }
  ,drawBG(){
    ctx.drawImage(img.table,vx-2,vy-2,tsz+4,tsz+4);
  }
  ,drawMain(){
    ctx.drawImage(img.bg1, 0, 0, W, H);
    ctx.drawImage(img.title, (W-700)/2, 20);
    if(DrawBtn(W/2, 350, 358, 174,img.btn_play) && Mouse.Down('Left')) Map.open();
  }
  ,drawGame(){
    G.update_st();
    G.max_delay=0;
    ctx.drawImage(img.bg2, 0, 0, W, H); G.drawBG();
    ctx.drawImage(img.left_box, 10, 110);
    ctx.textBaseline = "top"; ctx.fillStyle = "#fff"; ctx.textAlign = "left";
    ctx.font = "bold 30px font1"; ctx.fillText("Score: "+score,20,150);
    ctx.font = "bold 50px font1"; ctx.fillText(G.get_time(time),20,200);
    var l=L.lv;
    ctx.font = "bold 30px font1"; ctx.fillText('boosts '+l.power_percent+'%', 20,255);
    var t=tab,l=light,x,y,i,len,a, c=ctx, mld=Mouse.Down('Left');
    var {mx,my,inside}=G.get_mouse();

    if(G.state2=='game'){
      if(inside && Mouse.Down('Left') && !G.pause){ G.select_item(mx,my); }
    }
    else if(G.state2=='switch'){

      if(--G.time<=0){
        G.switch_item(sc.x1,sc.y1,sc.x2,sc.y2);
        G.state2='game';
        var arr=[['x1','y1','x2','y2'],['x2','y2','x1','y1']];
        if(G.isPower(sc.x1,sc.y1) && G.isItem(sc.x2,sc.y2)){
          var k = arr[0]; arr[0]=arr[1]; arr[1]=k;
        }
        for (var o of arr) {
          var x1=sc[o[0]], y1=sc[o[1]], x2=sc[o[2]], y2=sc[o[3]];
          if(G.isPower(x1,y1)){t[y1][x1].crush(x1,y1);}
          else {
            var r1=G.check_crush_point(x1,y1);
            if(r1.crush){ G.active_crush_point(r1,x1,y1);}
          }
        }
        /*

        if(G.isPower(sc.x1,sc.y1)){t[sc.y1][sc.x1].crush(sc.x1,sc.y1);}
        else {
          var r1=G.check_crush_point(sc.x1,sc.y1);
          if(r1.crush){ G.active_crush_point(r1,sc.x1,sc.y1);}
        }
        if(G.isPower(sc.x2,sc.y2)){t[sc.y2][sc.x2].crush(sc.x2,sc.y2);}
        else {
          var r1=G.check_crush_point(sc.x2,sc.y2);
          if(r1.crush){ G.active_crush_point(r1,sc.x2,sc.y2);}
        }
        */
        sc.x1=sc.y1=sc.x2=sc.y2=-1;
      }
    }
    else if(G.state2=='fusion'){
      if(--G.time<=0){
        o_power.fusion(sc.x1,sc.y1,sc.x2,sc.y2);
        sc.x1=sc.y1=sc.x2=sc.y2=-1;
      }
    }
    else if(G.state2=='crush'){
      if(--G.time<=0){ G.start_fall();}
    }
    else if(G.state2=='fall'){
      if(--G.time<=0){G.start_fall();}
    }
    ctx.fillStyle = "#fff";

    for(y = 0,i=0; y < tab_w; y++){
      for(x = 0; x < tab_w; x++){
        if(!t[y][x].wall)c.drawImage(img['box'+((x+y)%2+1)], vx+x*sz, vy+y*sz, sz ,sz);
      }
    }
    for(y = 0; y < tab_w; y++) for(x = 0; x < tab_w; x++) if(l[y][x]){
      if(l[y][x]<=20){
        c.globalAlpha=l[y][x]/40;
        c.fillRect(vx+x*sz, vy+y*sz, sz ,sz);
      }
      l[y][x]--;
    }
    c.globalAlpha=1;
    for(y = 0; y < tab_w; y++){
      for(x = 0; x < tab_w; x++){
        a=t[y][x];
        a.draw(x,y);
      }
    }
    /////// particles
    P.update(); P.draw();
    /// G.pause=false;

    if(G.pause) G.draw_pause_box();
    else{
      if(DrawBtn(100, 350, 128, 126, img.btn_pause2) && mld) G.open_pause_box();
      var bb = refresh_time==0&&G.state2=='game';
      if(DrawBtn(W-100, 350, 128, 126, bb?img.btn_refresh1:img.btn_refresh2) && mld && bb) G.refresh();
      if(refresh_time>0){ctx.textAlign = "center"; ctx.fillStyle='white'; ctx.fillText(Math.ceil(refresh_time/30),W-100, 350+53);}
    }

    time-=30/1000;
    if(refresh_time>0) refresh_time--;
    if(time<=0){
      G.set_game_end();
    }
  }
  ,refresh(){
    var t=tab,x,y;
    for(y = 0,i=0; y < tab_w; y++){
      for(x = 0; x < tab_w; x++){
        if(!t[y][x].wall){ t[y][x].re_roll(); t[y][x].reset();}
      }
    }
    for (var j = 0; j < 30; j++) {
      if(!G.test_first_tab(t)) break;
    }
    if(G.CheckCrush()){
      G.state2='crush'; G.time=10;
    }
    refresh_time=30*15;
    G.PlaySound(sound.refresh);
  }
  ,open_pause_box(){
    G.pause=true;
    G.pause_time=10;
  }
  ,draw_pause_box(){
    var x=Math.floor((W-500)/2), mld=Mouse.Down('Left'), t=G.pause_time;
    if(t>0){
      var p=1-t/10, w=500*p, x2=w/2-250;
      ctx.globalAlpha=p;
      ctx.fillStyle='rgba(0,0,0,0.8)'; ctx.fillRect(0,0,W,H);
      ctx.drawImage(img.msg_quit, x-x2, 0, w, 363);
      ctx.globalAlpha=1;
      G.pause_time--;
    }
    else {
      ctx.fillStyle='rgba(0,0,0,0.8)'; ctx.fillRect(0,0,W,H);
      ctx.drawImage(img.msg_quit, x, 0);
      if(DrawBtn(x+250, 220, 300, 101, img.btn_lvl_quit) && mld) {Map.open(); close_level(L.lv_i);}

      if(DrawBtn(x+450, 15, 70, 70, img.btn_pause) && mld){ G.pause=false;}
    }
  }
  ,drawEnd(){
    ctx.drawImage(img.bg2, 0, 0, W, H);
    ctx.textBaseline = "top"; ctx.textAlign = "center"; ctx.font = "bold 40px font1"; ctx.fillStyle = "#fff";
    ctx.drawImage(img.left_box, 250, 30, W-500, 130);
    ctx.fillText("The total score collected is",W/2,50);
    ctx.fillText(score,W/2,100);

    if(DrawBtn(W/2+250, 300, 358, 174,img.btn_play_again) && Mouse.Down('Left')) G.newGame(0);
    if(DrawBtn(W/2-250, 300, 358, 174,img.btn_back) && Mouse.Down('Left')){ Map.open();}
  }
  ,drawTimer(){
    var w=sz*tab_w;
    ctx.fillStyle='white';
    ctx.fillRect(vx,H-30,w,20);
    ctx.fillStyle='#1e174e';
    ctx.fillRect(vx,H-30,w*(time/60),20);
  }
  ,update_st(){
    for(var s=sn_timer, i=s.length-1; i >=0; i--){
      if(--s[i].t<=0){
        G.PlaySound(s[i].s);
        s.splice(i,1);
      }
    }
  }
  ,get_mouse(){
    return {mx:Math.floor((Mouse.X-vx)/sz), my:Math.floor((Mouse.Y-vy)/sz), inside:Mouse.Square(vx,vy,tsz,tsz)};
  }
  ,select_item(x,y){
    var t=tab;
    if(t[y][x].wall || t[y][x].state!='idle'){sc.x1=sc.y1=sc.x2=sc.y2=-1; return;}
    if(sc.x1==-1){
      sc.x1=x; sc.y1=y;
    }
    else {
      sc.x2=x; sc.y2=y;
      var {x1,y1,x2,y2}=sc;
      // active power
      if(x1==x2&&y1==y2&&G.isPower(x1,y1)){t[y1][x1].crush(x1,y1);sc.x1=sc.y1=sc.x2=sc.y2=-1;return;}
      // if not close to other
      if(Math.abs(x1-x2)+Math.abs(y1-y2)!=1){sc.x1=sc.y1=sc.x2=sc.y2=-1; return;}
      // fusion
      if(t[y1][x1].pn==3||t[y2][x2].pn==3||(G.isPower(x1,y1)&&G.isPower(x2,y2))){
        G.state2='fusion'; G.time=10;
        t[y1][x1].move_to(x2-x1,y2-y1);
        return;
      }


      if(G.isPower(x1,y1)||G.isPower(x2,y2)||G.test_crush(x1,y1,x2,y2)){
        tab[y1][x1].move_to(x2-x1,y2-y1);
        tab[y2][x2].move_to(x1-x2,y1-y2);
        G.state2='switch'; G.time=10;
      }
      else sc.x1=sc.y1=sc.x2=sc.y2=-1;
    }
  }
  ,switch_item(x1,y1,x2,y2){
    var t=tab[y1][x1];
    tab[y1][x1]=tab[y2][x2]
    tab[y2][x2]=t;
    tab[y1][x1].reset();
    tab[y2][x2].reset();
  }
  ,test_crush(x1,y1,x2,y2){
    G.switch_item(x1,y1,x2,y2);
    var r=G.check_crush_point(sc.x1,sc.y1).crush || G.check_crush_point(sc.x2,sc.y2).crush;
    G.switch_item(x1,y1,x2,y2);
    return r;
  }
  ,active_crush_point(o,x,y){
    if(o.cw){
      for(i=0,d=o.w,len=d.length; i < len; i++){
        tab[d[i].y][d[i].x].crush(d[i].x,d[i].y);
      }
    }
    if(o.ch){
      for(i=0,d=o.h,len=d.length; i < len; i++){
        tab[d[i].y][d[i].x].crush(d[i].x,d[i].y);
      }
    }
    if(G.power_chance()){
      if(o.p4){ tab[y][x].change_to_power(3); P.add_tiki(x,y,0);}
      else if(o.p3) tab[y][x].change_to_power(2);
      else if(o.p2) tab[y][x].change_to_power(1);
      else if(o.p1) tab[y][x].change_to_power(0);
    }
    G.state2='crush'; G.time=10;
  }
  ,check_crush_point(x1,y1){
    var T=tab, x, y, r={w:[{x:x1, y:y1}], h:[{x:x1, y:y1}], x:x1, y:y1};
    var n = T[y1][x1].n, it=G.isItem;
    for(x=x1+1; x < tab_w; x++){
      if(T[y1][x].n == n && it(x,y1)) r.w.push({x:x, y:y1}); else break;
    }
    for(x=x1-1; x >= 0; x--){
      if(T[y1][x].n == n && it(x,y1)) r.w.unshift({x:x, y:y1}); else break;
    }

    for(y=y1+1; y < tab_w; y++){
      if(T[y][x1].n == n && it(x1,y)) r.h.push({x:x1, y:y}); else break;
    }
    for(y=y1-1; y >= 0; y--){
      if(T[y][x1].n == n && it(x1,y)) r.h.unshift({x:x1, y:y}); else break;
    }

    r.p1    = r.h.length >= 4;
    r.p2    = r.w.length >= 4;
    r.p3    = r.w.length >= 3 && r.h.length >= 3;
    r.p4    = r.w.length >= 5 || r.h.length >= 5;
    r.cw    = r.w.length >= 3;
    r.ch    = r.h.length >= 3;
    r.crush = r.cw || r.ch;
    return r;
  }
  ,remove_all_crushed(){
    var t=tab,x,y;
    for(y = 0; y < tab_w; y++){
      for(x = 0; x < tab_w; x++){
        if(!t[y][x].visible) t[y][x].n=-1;
      }
    }
  }
  ,start_fall(){
    var t=tab,x,y,len,a, test=[], isFall=false, xa=[0,1,-1],FX=[];
    for(x = 0; x < tab_w; x++){
      FX[x]=false;
      if(!s_l[x]) continue;
      if(!G.isFree(x,s_x[x])) {FX[x]=true; isFall=true;}
    }
    //alert(FX[3])
    for(y = 0; y < tab_w; y++) for(x = 0; x < tab_w; x++) t[y][x].reset();
    for(y = 0; y < tab_w; y++){
      test[y]=[];
      for(x = 0; x < tab_w; x++){
        if(t[y][x].state=='crush'){
          test[y][x]=false;
          //isFall=true;
        }
        else test[y][x]=true;
      }
    }
    for(y = tab_w-1; y > 0; y--){
      for(x = 0; x < tab_w; x++){
        //var x1=x, y1=y-1; if(t[y1][x1].wall) continue;
        //if(!test[y][x] && test[y1][x1]){G.switch_item(x,y,x1,y1);t[y][x].fall(0,1);test[y][x]=true;test[y1][x1]=false;isFall=true;}
      }
    }
    ///////////////////////////
    for(x=0; x < tab_w; x++){
      for(y=tab_w-1; y > 0; y--){
        var x1=x, y1=y-1; if(t[y1][x1].wall) continue;
        if(!test[y][x] && test[y1][x1]){G.switch_item(x,y,x1,y1);t[y][x].fall(0,1);test[y][x]=true;test[y1][x1]=false;isFall=true; FX[x]=true;}
      }
    }
    for(i=1; i < 3; i++){
      for(x=0; x < tab_w; x++){
        x1 = x+xa[i];
        if(x1 < 0 || x1 >= tab_w || FX[x]) continue;
        for(y=tab_w-1; y > 0; y--){
          y1=y-1; if(t[y1][x1].wall) continue;
          if(!test[y][x] && test[y1][x1] && t[y1][x1].state=='idle'){
            G.switch_item(x,y,x1,y1);
            t[y][x].fall(xa[i],1);
            test[y][x]=true;
            test[y1][x1]=false;
            isFall=true;
          }
        }
      }
    }
    ///////////////////////////

    for(x = 0; x < tab_w; x++){
      if(!s_l[x]) continue;
      y=s_x[x];
      if(!test[y][x]){
        t[y][x].re_roll();
        isFall=true;
      }
    }
    if(isFall){
      G.state2='fall'; G.time=fall_time;
    }
    else{
      G.state2='game';
      if(G.CheckCrush()){
        G.state2='crush'; G.time=10;
      }
    }

  }
  ,isFree(x,y){ var a=tab[y][x]; return !a.wall && (a.isItem || a.isPower);}
  ,isItem(x,y){ return tab[y][x].isItem;}
  ,isPower(x,y){ return tab[y][x].isPower && !tab[y][x].wall;}
  ,isInside(x,y){ return x>=0&&x<tab_w&&y>=0&&y<tab_w;}
  ,CheckCrush(){
    var i,j,k,x,y,n,a1=1,a2=1,cnt,r=false;
    var T = tab;
    for(y=0; y < tab_w; y++) for(x=0; x < tab_w; x++) T[y][x].test_crush = T[y][x].state!='idle';
    for(y=0; y < tab_w; y++){
      for(x=0; x < tab_w; x++){
        if(!T[y][x].test_crush && G.isItem(x,y)){
          for(j=x+1,cnt=1; j < tab_w; j++) if(G.isItem(j,y) && T[y][x].n == T[y][j].n) cnt++; else break;
          if(cnt >= 3){r=true; for(j=x; j < x+cnt; j++){T[y][j].test_crush = true;}}
          for(j=y+1,cnt=1; j < tab_w; j++) if(G.isItem(x,j) && T[y][x].n == T[j][x].n) cnt++; else break;
          if(cnt >= 3){r=true; for(j=y; j < y+cnt; j++){T[j][x].test_crush = true;}}
        }
      }
    }
    if(r){
      var a1=['p4','p3','p2','p1'];
      for(i=0; i < 4; i++){
        for(y=0; y < tab_w; y++){
          for(x=0; x < tab_w; x++){
            if(T[y][x].test_crush && G.isItem(x,y)){
              var r1 = G.check_crush_point(x,y);
              if(r1[a1[i]]){
                G.active_crush_point(r1,x,y);
              }
            }
          }
        }
      }
      for(y=0; y < tab_w; y++) for(x=0; x < tab_w; x++) if(T[y][x].test_crush && T[y][x].state=='idle'){ T[y][x].crush(x,y);}
      //G.time1 = 7; G.State = State.Crush;
    }
    return r;
  }
  ,test_first_tab(T){
    var i,j,k,x,y,n,a1=1,a2=1,cnt,r=false;
    for(y=0; y < tab_w; y++) for(x=0; x < tab_w; x++) T[y][x].test_sort = false;
    for(y=0; y < tab_w; y++){
      for(x=0; x < tab_w; x++){
        if(!T[y][x].test_sort && G.isItem(x,y)){
          for(j=x+1,cnt=1; j < tab_w; j++) if(G.isItem(j,y) && T[y][x].n == T[y][j].n) cnt++; else break;
          if(cnt >= 3){r=true; for(j=x; j < x+cnt; j++){T[y][j].test_sort = true; T[y][j].n=L.new_item_i();}}
          for(j=y+1,cnt=1; j < tab_w; j++) if(G.isItem(x,j) && T[y][x].n == T[j][x].n) cnt++; else break;
          if(cnt >= 3){r=true; for(j=y; j < y+cnt; j++){T[j][x].test_sort = true; T[y][j].n=L.new_item_i();}}
        }
      }
    }
    if(r){
      for(y=tab_w-1; y > 0; y--){
        for(x=0; x < tab_w; x++){
          if(T[y][x].test_sort){
            if(y-1<0 || T[y-1][x].wall){ T[y][x].n=L.new_item_i();}
            else G.switch_item(x,y,x,y-1);
          }
        }
      }
      //s_x[x]=0; s_l[x]=false;
      for(x=0; x < tab_w; x++) if(s_l[x]) T[0][s_x[x]].n=L.new_item_i();
    }
    return r;
  }
  ,get_time(t){
    t=Math.floor(t);
    var s = t%60,m = Math.floor(t/60);
    if(s < 10)s = '0'+s; if(m < 10)m = '0'+m;
    return m+":"+s;
  }
  ,set_game_end(){
    G.state='end';
    G.end_music();
    G.PlaySound(sound.win);
    level_completed(L.lv_i, score);
  }
  ,PlaySound(s){
    if(G.sound){
      //stopSound(s);
      playSound(s);
    }
  }
  ,power_chance(){
    return irandom(100)<L.power_percent;
  }
  ,update_delay(d){
    if(d>G.max_delay) G.max_delay=d;
  }
  ,time_daley(){
    G.time=10+G.max_delay;
  }
  ,start_music(s){
    if(G.msc!=undefined){stopSound(G.msc); G.msc=undefined;}
    G.msc=s;
    if(G.sound) playMusic(s);
  }
  ,end_music(){
    if(G.msc!=undefined) stopSound(G.msc);
    G.msc=undefined;
  }
};

const _ef=()=>{}, wall_obj={wall:true,n:-1,isPower:false,visible:false,state:'wall',draw:_ef,reset:_ef,fall:_ef,crush:_ef,change_to_power(n,o){alert(JSON.stringify(this.n))}};

var L={
  items:[0,1,2,3], power_percent:100, lv_i:0
  ,new_item_i(){return L.items[irandom(L.items.length-1)]}
  ,load(i){
    new_level(i);
    var t=Levels[i];
    time=t.time;
    L.items=t.items;
    L.power_percent=t.power_percent;
    L.lv_i=i;
    L.lv=t;
    tab_w=t.w;
    var sz1=Math.floor(55*9/tab_w);
    sz=sz1;
    tsz=tab_w*sz;
    s_x=[]; s_l=[];
    var x,y, c=t.t;
    for(x = 0; x < tab_w; x++){
      s_x[x]=0; s_l[x]=false;
      for(y = 0; y < tab_w; y++){
        if(c[y][x]!='0'){ s_x[x]=y; s_l[x]=true;break;}
      }
    }
    // music
    G.end_music();
    switch (t.music) {
      case 0: G.msc = sound.music1; break;
      case 1: G.msc = sound.music2; break;
    }
    if(G.msc!=undefined){ G.start_music(G.msc);}
  }
};
var o_power={
  power_1(x,y,sd){
    var t=tab,i,d=sd||0;
    for(i = 0; i < tab_w; i++){
      d=Math.abs(i-x);
      t[y][i].crush(i,y,undefined,d);
    }
    G.state2='crush'; G.time_daley();
    sn_timer.push({s:sound.LineVerticalHorizontal,t:sd})
  }
  ,power_2(x,y,sd){
    var t=tab,i,d=sd||0;
    for(i = 0; i < tab_w; i++){
      d=Math.abs(i-y)+sd;
      t[i][x].crush(x,i,undefined,d);
    }
    G.state2='crush'; G.time_daley();
    sn_timer.push({s:sound.LineVerticalHorizontal,t:sd})
  }
  ,power_3(x,y,sd){
    var t=tab,x1,y1,d=sd||0;
    for(y1 = -1; y1 <= 1; y1++){
      for(x1 = -1; x1 <= 1; x1++){
        if(G.isInside(x+x1,y+y1)) t[y+y1][x+x1].crush(x+x1,y+y1,undefined,d+Math.abs(x1)+Math.abs(y1));
      }
    }
    G.state2='crush'; G.time_daley();
    sn_timer.push({s:sound.ColorBomb,t:sd})

  }
  ,power_4(x,y,n,sd){
    var t=tab,d=sd||0;
    for(y = 0; y < tab_w; y++){
      for(x = 0; x < tab_w; x++){
        if(t[y][x].n==n && G.isItem(x,y)) t[y][x].crush(x,y,undefined,d);
      }
    }
    G.state2='crush'; G.time_daley();
  }
  ,fusion(x1,y1,x2,y2){
    G.state2='game';
    var t1=tab[y1][x1], t2=tab[y2][x2], n1=t1.n, n2=t2.n, pn1=t1.pn, pn2=t2.pn;
    t1.crush(x1,y1,true); t2.crush(x2,y2,true);
    t1.visible=false;
    if(pn1<pn2){pn1=t2.pn; pn2=t1.pn; n1=t2.n; n2=t1.n;}
    if((pn1==2&&pn2==0)||(pn1==2&&pn2==1)) o_power.power_3_1(x2,y2);
    else if(pn1==2&&pn2==2) o_power.power_3_3(x2,y2);
    else if((pn1==0||pn1==1)&&(pn2==0||pn2==1)) o_power.power_1_1(x2,y2);
    else if(pn1==3&&pn2==-1) o_power.power_4(x2,y2,n2);
    else if(pn1==3&&pn2==3) o_power.power_4_4(x2,y2);
    else if(pn1==3&&pn2<3) o_power.power_4_n(x2,y2,pn2);

  }
  ,power_1_1(x,y){
    var t=tab,i;
    for(i = 0; i < tab_w; i++){
      t[y][i].crush(i,y); t[i][x].crush(x,i);
    }
    G.state2='crush'; G.time_daley();
    G.PlaySound(sound.LineVerticalHorizontal);
  }
  ,power_3_1(x,y){
    var t=tab,i,j;
    for(i = 0; i < tab_w; i++){
      for(j = -1; j <= 1; j++) if(G.isInside(i,y+j)) t[y+j][i].crush(i,y+j);
      for(j = -1; j <= 1; j++) if(G.isInside(x+j,i)) t[i][x+j].crush(x+j,i);
    }
    G.state2='crush'; G.time_daley();
    G.PlaySound(sound.ColorBomb);
    G.PlaySound(sound.LineVerticalHorizontal);

  }
  ,power_3_3(x,y){
    var t=tab,x1,y1;
    for(y1 = -2; y1 <= 2; y1++){
      for(x1 = -2; x1 <= 2; x1++){
        if(G.isInside(x+x1,y+y1)) t[y+y1][x+x1].crush(x+x1,y+y1);
      }
    }
    G.state2='crush'; G.time_daley();
    G.PlaySound(sound.ColorBomb);
  }
  ,power_4_n(x,y,n){
    var t=tab,i,j,cnt=0,nn;
    for(y = 0; y < tab_w; y++) for(x = 0; x < tab_w; x++) if(G.isItem(x,y)) cnt++;
    if(cnt>6)cnt=6;
    for(i = 0; i < cnt; i++){
      do {
        x=irandom(tab_w-1);
        y=irandom(tab_w-1);
      } while (!G.isItem(x,y));
      if(n==0||n==1) n=irandom(1);
      t[y][x].change_to_power(n,{active:true,x:x,y:y});
    }
    G.state2='crush'; G.time_daley();
    G.time+=10;
  }
  ,power_4_4(x1,y1){
    var t=tab, x, y;
    for(y = 0; y < tab_w; y++){
      for(x = 0; x < tab_w; x++){
        //alert(x+"  "+y);
        t[y][x].crush(x,y,true,(Math.abs(x1-x)+Math.abs(y1-y))*2);
      }
    }
    G.state2='crush'; G.time_daley();
    G.PlaySound(sound.ColorBomb);
  }
};
class Item_class {
  constructor(n,x,y) {
    var t=this;
    t.n=n;
    t.x=x;
    t.y=y;
    t.d=0;
    t.pn=-1;
    t.visible=true;
    t.time=0;
    t.isItem=true;
    t.isPower=false;
    t.state='idle';
  }
  move_to(x,y){
    var t=this;
    t.time=0;
    t.x=x; t.y=y;
    t.state='switch';
  }
  change_to_power(n,o){
    var t=this;
    t.old_n=t.n;
    t.isItem=false;
    t.isPower=true;
    t.pn=n;
    t.time=0;
    t.state='power_apper';
    if(o!=undefined){ t.crush_power=o;}
    else t.crush_power={active:false};
    t.test_crush=false;
  }
  replace_to_power(n){
    var t=this;
    t.isItem=false;
    t.isPower=true;
    t.pn=n;
  }
  fall(x,y){
    var t=this;
    t.time=0;
    t.x=x; t.y=y;
    t.state='fall';
  }
  re_roll(){
    var t=this;
    t.time=0;
    t.isItem=true;
    t.isPower=false;
    t.n=L.new_item_i();
    t.pn=-1;
    t.state='re_roll';
    t.visible=true;
  }
  crush(x,y,skip,d){
    var t=this;
    d=d||0; light[y][x]=20+d;
    t.test_crush=false;
    if(t.state!='crush'){
      t.d=d; G.update_delay(d);
      //time+=0.2; if(time>60) time=60;
      if(!t.isPower) snd_crush=true;
      t.time=0;
      score+=10;
      t.state='crush';
      t.isItem=false;
      if(t.isPower) P.add(x,y,P.ap,d);
      else P.add_item(x,y,t.n,d);
      //if(x!=undefined&&y!=undefined&&G.isInside(x,y)){ light[y][x]=20;}

      if(!skip && t.isPower){
        switch (t.pn) {
          case 0:o_power.power_1(x,y,d);break;
          case 1:o_power.power_2(x,y,d);break;
          case 2:o_power.power_3(x,y,d);break;
          case 3:o_power.power_4(x,y,L.new_item_i(),d);break;
        }
      }
    }
    //else alert(x+"  "+y+"  Crush!!!!!!!!!!!!!!!!!!!!!!!");
  }
  delay(n){
    t.d=n;
  }
  reset(){
    var t=this;
    if(t.state!='crush'){
      t.visible=true;
      t.state='idle';
    }
  }
  draw(x,y){
    if(this.visible){
      var t=this, c=ctx, m=t.isPower?img.power[t.pn]:img.b[t.n];
      if(t.pn==0||t.pn==1){ m=m[t.n]; }
      if(t.d<=0){
        switch (t.state) {
          case 'idle':
          if(sc.x1==x&&sc.y1==y) c.drawImage(img.sc, vx+x*sz, vy+y*sz, sz ,sz);
          c.drawImage(m, vx+x*sz, vy+y*sz, sz ,sz);
          break;

          case 'switch':
          var p=t.time/10;
          x=(x+t.x*p); y=(y+t.y*p);
          c.drawImage(m, vx+x*sz, vy+y*sz, sz ,sz);
          if(t.time<10) t.time++;
          break;

          case 'fall':
          var p=1-t.time/fall_time;
          x=(x+t.x*p); y=(y-t.y*p);

          //y=(y-1+p);
          c.drawImage(m, vx+x*sz, vy+y*sz, sz ,sz);
          if(t.time<fall_time) t.time++;
          break;

          case 'crush':
          var p=t.time/10, ss=10*p, ss2=ss*2;
          c.globalAlpha=1-p;
          c.drawImage(m, vx+x*sz+ss, vy+y*sz+ss, sz-ss2 ,sz-ss2);
          c.globalAlpha=1;
          if(t.time<10) t.time++;
          else{ t.visible=false; t.isPower=t.isItem=false;}
          break;

          case 'power_apper':
          var p=t.time/10, ss=10*p, ss2=ss*2;
          c.globalAlpha=1-p;
          c.drawImage(img.b[this.old_n], vx+x*sz+ss, vy+y*sz+ss, sz-ss2 ,sz-ss2);

          ss=10-10*p, ss2=ss*2;
          c.globalAlpha=p;
          c.drawImage(m, vx+x*sz+ss, vy+y*sz+ss, sz-ss2 ,sz-ss2);
          c.globalAlpha=1;
          if(t.time<10) t.time++;
          else if(t.crush_power.active){
            t.crush(t.crush_power.x, t.crush_power.y);
          }
          break;

          case 're_roll':
          var p=t.time/fall_time;
          c.globalAlpha=p;
          y=(y-(1-p));
          //y=(1*p)-1;
          c.drawImage(m, vx+x*sz, vy+y*sz, sz ,sz);
          c.globalAlpha=1;
          if(t.time<fall_time) t.time++;
          break;
        }
      }
      else {
        switch (t.state) {
          default:
          if(sc.x1==x&&sc.y1==y) c.drawImage(img.sc, vx+x*sz, vy+y*sz, sz ,sz);
          c.drawImage(m, vx+x*sz, vy+y*sz, sz ,sz);
          break;
        }
        t.d--;
      }

    }
  }
}
const P = {
  a:[], at:[4,4,0,1,3,5,2]
  ,load(){
    for (var i = 0; i < 6; i++) P.a.push(P.split(img.particles_item[i]));
    P.ap=P.split(img.particles_power);
  }
  ,reset(){o_particles=[];}
  ,split(m){
    var part =[], cp=[{x:0, y:0},{x:30, y:0},{x:0, y:30},{x:30, y:30}];
    for (var i = 0; i < 4; i++) {
      var c = document.createElement("canvas"), x=c.getContext("2d");
      c.width=c.height=30;
      x.drawImage(m, -cp[i].x, -cp[i].y);
      part[i] = c;
    }
    return part;
  }
  ,add_ran(x,y,d){
    var m=P.a[irandom(5)];
    P.add(x,y,m,d)
  }
  ,add_item(x,y,i,d){
    var m=P.a[P.at[i]];
    P.add(x,y,m,d)
  }
  ,add(x,y,m,d){
    var sz2=Math.floor(sz/2), ms=sz/50;
    x=vx+x*sz;
    y=vy+y*sz;
    o_particles.push({
      a:[{x:x, y:y, m:m[0], mx:-ms, my:-ms},
        {x:x+sz2, y:y, m:m[1], mx:ms, my:-ms},
        {x:x, y:y+sz2, m:m[2], mx:-ms, my:ms},
        {x:x+sz2, y:y+sz2, m:m[3], mx:ms, my:ms}],
      s:sz2,
      t:20,
      d:d||0,
      type:0,
    });
  }
  ,add_tiki(x,y,d){
    x=vx+x*sz;
    y=vy+y*sz;
    o_particles.push({
      x:x,
      y:y,
      s:sz,
      t:40,
      d:(d||0)+10,
      type:1,
    });
  }
  ,update(){
    var op=o_particles, o, i, j, ms=sz/50;
    for(i = op.length-1; i>=0; i--){
      o=op[i];
      if(o.d>0) o.d--;
      else if(o.t>0){
        o.t--;
        if(o.type==0){
          var a=o.a;
          for(j = 0; j<4; j++){
            a[j].x+=a[j].mx;
            a[j].y+=a[j].my;
          }
          if(o.t>10) o.s+=ms;
          else o.s-=ms*2;
        }
        else if(o.type==1){
          var p1=o.t/40, p2=1-p1;
          o.s=sz*p1+260*p2;
        }

      }
      else op.splice(i,1);
    }
  }
  ,draw(){
    var op=o_particles, i, j, o, sz2=Math.floor(sz/2);
    for(i = op.length-1; i>=0; i--){
      if(op[i].d>0) continue;
      else{
        o=op[i];
        if(o.type==0){
          var t=o.t, a=o.a, ns=o.s, ns2=(sz2-ns)/2;;
          ctx.globalAlpha=t/20;
          for(j = 0; j<4; j++){
            ctx.drawImage(a[j].m, a[j].x+ns2, a[j].y+ns2, ns, ns);
          }
        }
        else if(o.type==1){
          var t=o.t, ns=o.s, ns2=(sz-ns)/2;;
          ctx.globalAlpha=t>=30?(t-30)/10:1;
          ctx.drawImage(img.power[3], o.x+ns2, o.y+ns2, ns, ns);
        }
      }
    }
    ctx.globalAlpha=1;
  }
};
const Map = {
  s:W/404, w:404, h:1255, y:0, state:'idle', s1:-1
  ,open(){
    Map.state = 'idle';
    Map.s1 = -1;
    G.state = 'map';
    G.start_music(sound.music1);
  }
  ,update(){
    var mld=Mouse.Down('Left'), mlu=Mouse.Up('Left');
    switch (Map.state) {
      case 'idle':{
        for(var i = 0, o=Map.ba, len=o.length; i < len; i++){
          Map.update_lvl_btn(i);
          if(o[i].hover){
            if(mld) Map.s1=i;
            if(mlu && Map.s1==i) Map.open_level_message(i);
            mld=false;
          }
        }
        if(mld) Map.start_drag();
      } break;
      case 'drag':{
        Map.update_drag();
        if(mlu) Map.end_drag();
      } break;
    }
  }
  ,draw(){
    ctx.textBaseline = "middle"; ctx.fillStyle = "black";ctx.textAlign = "center"; ctx.font = "bold 70px font1";
    var s=Map.s, h=Map.h*s, y=H+Map.y-h;
    ctx.drawImage(img.map, 0, y, W, h);
    for(var i = 0, o=Map.ba, len=o.length; i < len; i++){
      Map.draw_lvl_btn(i);
    }
    if(Map.state=='level') Map.draw_level_message();
  }
  ,open_level_message(i){
    Map.state='level';
    Map.time=10;
    Map.lvl_i=i;
    Map.ba[i].hover=false;
  }
  ,draw_level_message(){
    var x=Math.floor((W-500)/2), mld=Mouse.Down('Left'), t=Map.time;
    if(t>0){
      var p=1-t/10, w=500*p, x2=w/2-250;
      ctx.globalAlpha=p;
      ctx.fillStyle='rgba(0,0,0,0.8)'; ctx.fillRect(0,0,W,H);
      ctx.drawImage(img.msg_level, x-x2, 0, w, 542);
      ctx.globalAlpha=1;
      Map.time--;
    }
    else {
      ctx.fillStyle='rgba(0,0,0,0.8)'; ctx.fillRect(0,0,W,H);
      ctx.drawImage(img.msg_level, x, 0);
      ctx.fillStyle='white'; ctx.fillText('Level '+(Map.lvl_i+1), x+250, 125);
      var l=Levels[Map.lvl_i];
      ctx.font = "bold 30px font1"; ctx.fillText('possibility of boosts appearing '+l.power_percent+'%', x+250, 325);

      if(DrawBtn(x+250, 350, 300, 101, img.btn_lvl_play) && mld) G.newGame(Map.lvl_i);

      if(DrawBtn(x+450, 15, 70, 70, img.btn_pause) && mld){ Map.state='idle'; Map.s1 = -1;}
    }
  }
  ,start_drag(){
    Map.sy=Map.y;
    Map.my=Mouse.Y;
    Map.state = 'drag';
  }
  ,update_drag(){
    var y=Map.sy+(Mouse.Y-Map.my)*2, h=Map.h*Map.s-H;
    if(y<0)y=0;
    else if(y>h)y=h;
    Map.y=Math.floor(y);
  }
  ,end_drag(){Map.state = 'idle';}
  ,update_lvl_btn(i){
    var s=Map.s, h=Map.h*s, y=H+Map.y, b=Map.ba[i];
    b.hover = Mouse.Square(b.x, y+b.y, 136, 140);
  }
  ,draw_lvl_btn(i){
    var s=Map.s, h=Map.h*s, y=H+Map.y, b=Map.ba[i], x=b.x;
    ctx.drawImage(img.lvl_btn, x-b.s, y+b.y-b.s, 136+b.s*2, 140+b.s*2);
    ctx.fillStyle = "#e199af"; ctx.font = "bold 78px font1"; ctx.fillText(i+1, x+70, y+b.y+55);
    ctx.fillStyle = "white"; ctx.font = "bold 70px font1"; ctx.fillText(i+1, x+70, y+b.y+55);
    if(b.hover){if(b.s<10)b.s+=2;}
    else if(b.s>0) b.s-=2;
  }
};
Map.ba=[
  {x:280, y:-180, hover:false, s:0}, // 1
  {x:560, y:-320, hover:false, s:0}, // 2
  {x:690, y:-320, hover:false, s:0}, // 3
  {x:720, y:-520, hover:false, s:0}, // 4
  {x:690, y:-780, hover:false, s:0}, // 5
  {x:560, y:-780, hover:false, s:0}, // 6
  {x:240, y:-800, hover:false, s:0}, // 7
  {x:230, y:-930, hover:false, s:0}, // 8
  {x:260, y:-1120, hover:false, s:0}, // 9
  {x:500, y:-1180, hover:false, s:0}, // 10
  {x:20, y:-1260, hover:false, s:0}, // 11
  {x:620, y:-1290, hover:false, s:0}, // 12
  {x:300, y:-1460, hover:false, s:0}, // 13
  {x:140, y:-1590, hover:false, s:0}, // 14
  {x:550, y:-1620, hover:false, s:0}, // 15
  {x:437, y:-1800, hover:false, s:0}, // 16
  {x:470, y:-1950, hover:false, s:0}, // 17
  {x:550, y:-2220, hover:false, s:0}, // 18
  {x:240, y:-2260, hover:false, s:0}, // 19
  {x:400, y:-2500, hover:false, s:0}, // 20
];

var Sound_arr=[], snd_crush=false, snd_power=false;
var sound={
  crush:loadSound(PATH+"crush.m4a",2),
  win:loadSound(PATH+"win.m4a"),
  refresh:loadSound(PATH+"refresh.m4a"),
  LineVerticalHorizontal:loadSound(PATH+"LineVerticalHorizontal.m4a",4),
  ColorBomb:loadSound(PATH+"ColorBomb.m4a",4),
  music1:loadSound(PATH+"music1.m4a"),
  music2:loadSound(PATH+"music2.m4a"),
};
var Img_arr=[];
var img = {
  map:newImage('map.png'),
  lvl_btn:newImage('lvl_btn.png'),
  left_box:newImage('left_box.png'),
  table:newImage('table.png'),
  msg_level:newImage('msg_level.png'),
  msg_quit:newImage('msg_quit.png'),
  bg1:newImage('bg1.png'),
  bg2:newImage('bg2.png'),
  btn_lvl_play:newImage('btn_lvl_play.png'),
  btn_lvl_quit:newImage('btn_lvl_quit.png'),
  btn_refresh1:newImage('btn_refresh1.png'), btn_refresh2:newImage('btn_refresh2.png'),
  box1:newImage('box1.png'), box2:newImage('box2.png'),
  b:[ newImage('b1.png'),newImage('b2.png'),newImage('b3.png'),newImage('b4.png'),newImage('b5.png'),newImage('b6.png'),newImage('b7.png')],
  power:[
    [newImage('powerup_1_1.png'),newImage('powerup_1_2.png'),newImage('powerup_1_3.png'),newImage('powerup_1_4.png'),newImage('powerup_1_5.png'),newImage('powerup_1_6.png'),newImage('powerup_1_7.png')],
    [newImage('powerup_2_1.png'),newImage('powerup_2_2.png'),newImage('powerup_2_3.png'),newImage('powerup_2_4.png'),newImage('powerup_2_5.png'),newImage('powerup_2_6.png'),newImage('powerup_2_7.png')],
    newImage('powerup_3.png'),newImage('powerup_4.png')],
  sc:newImage('sc.png'),
  btn_fs:newImage('btn_fs.png'),
  btn_sound_off:newImage('btn_sound_off.png'),
  btn_sound_on:newImage('btn_sound_on.png'),
  btn_pause:newImage('btn_pause.png'),
  btn_pause2:newImage('btn_pause2.png'),
  btn_back:newImage('btn_back.png'),
  btn_play_again:newImage('btn_play_again.png'),
  btn_play:newImage('btn_play.png'),
  title:newImage('title.png'),
  particles_power:newImage('particles_p.png'),
  particles_item:[newImage('particles_1.png'),newImage('particles_2.png'),newImage('particles_3.png'),newImage('particles_4.png'),newImage('particles_5.png'),newImage('particles_6.png')],
};
//for (var i = 1; i <= 10; i++) img.items.push(newImage('iteam_'+i+'.png'));

function timer_loop(){
  var a = setInterval(function () {
    clearInterval(a);
    if(G.isReady) G.loop();
    else G.check_if_all_loaded();
    /* Mouse */Mouse.Update();
    timer_loop();
  }, 30);
}
timer_loop();
