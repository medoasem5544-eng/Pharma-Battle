const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

const PORT = process.env.PORT || 3000;
const questions = [{"text": "جالك حد و بيقولك (يا دكتور صدري بيكركر و مكتوم و مش قادر اخد نفسي) تفتكر ده ايه ؟", "options": ["دليل علي وجود التهاب في الشعب الهوائية", "دليل علي خطر كبير في الجهاز التنفسي", "تديله مضاد حيوي", "تحوله لطبيب"], "correct": 0, "difficulty": "easy", "points": 1}, {"text": "تفتكر بنادول اكسترا أمن بشكل كامل علي مرضي الضغط و الحوامل و المرضعات ؟", "options": ["ايوا امن جدا", "لا مش أمن الافضل باناول ادفانس", "بانادول مينفعش اصلا لمرضي الضغط و الحوامل", "ينفع بس بشروط"], "correct": 1, "difficulty": "easy", "points": 1}, {"text": "تعتقد الكركديه بيوطي الضغط لما يكون عالي بس و لا في جميع الحالات ؟", "options": ["في حالة الضغط لما يكون عالي بس", "يوطيه سواء كان عالي أو طبيعي", "مش بيوطي الضغط اصلا", "بيوطيه لما يكون طبيعي"], "correct": 0, "difficulty": "easy", "points": 1}, {"text": "شاب ٢٠ سنة دخلك الصيدلية بيشتكي من آلالام و احتقان في حلقه و عنده كحه ب بلغم و رشح تساعده ازاي ؟", "options": ["تديله مضاد حيوي", "تديله حاجة تهدي الرشح و الاحتقان مع دواء كحه مناسب للبلغم", "تحول لطبيب", "تقوله اشرب سوايل دافيه بس"], "correct": 1, "difficulty": "easy", "points": 1}, {"text": "سواق دخلك الصيدلية بليل بيشتكيلك من مغص شديد . تساعده ازاي ؟ ( علما بأن Atropine له تأثير منبه علي الجهاز العصبى المركزى و الHyoscine له تأثير مهدئ علي الجهاز العصبى المركزى)", "options": ["تديله Atropine بس", "تديله Hyoscine بس", "تديله Atropine and Hyoscine", "تحول لطبيب"], "correct": 0, "difficulty": "easy", "points": 1}, {"text": "يا تري ليه بنغلي اللبن ؟", "options": ["عشان نقتل كل البكتيريا و الكائنات الدقيقة اللي فيه", "عادة قديمة و خلاص", "عشان نحميه من أنه يبوظ", "مفيش إجابة صح"], "correct": 0, "difficulty": "easy", "points": 1}, {"text": "انا مادة فعالة اول حرف من اسمي P و بعالج الصداع و السخونة من اكون ؟", "options": ["Pantoprazole (pantoloc)", "Piroxicam (lornoxicam)", "Paracetamol (panadol)", "Pregabaline (Lyrica)"], "correct": 2, "difficulty": "easy", "points": 1}, {"text": "انا دواء من مشتق من مادة طبيعية يعني نصف مخلق اعمل كمسكن للالتهابات و الآلام و في بعض التركيزات اعمل كواقي من الجلطات فمن اكون ؟", "options": ["Acetyl salicylic Acid (Aspirin)", "Amoxicillin (Augmentine)", "Azithromycine (xithrone)", "Acyclovir (Lovir)"], "correct": 0, "difficulty": "easy", "points": 1}, {"text": "مريض عنده نزلة برد بسيطة ورشح وعطس من غير ضيق نفس أو أعراض شديدة. إيه النصيحة الأنسب غالبًا؟", "options": ["مضاد حيوي ضروري", "علاج داعم للأعراض مثل السوائل والراحة، مع اختيار دواء مناسب عند الحاجة", "كورتيزون لازم لكل الحالات", "يوقف شرب السوائل"], "correct": 1, "difficulty": "easy", "points": 1}, {"text": "مريض عنده حموضة بسيطة بعد وجبة كبيرة، وبيسأل عن خطوة تساعده تقلل الأعراض. تختار إيه؟", "options": ["الاستلقاء مباشرة بعد الأكل", "تقليل الوجبات الكبيرة وتجنب الاستلقاء مباشرة بعد الأكل", "شرب قهوة قبل النوم", "أخذ مضاد حيوي"], "correct": 1, "difficulty": "easy", "points": 1}, {"text": "مريض بيقولك إنه بياخد Warfarin وعايز يبدأ مسكن للألم من نفسه. أي اختيار يحتاج حذر أكبر بسبب زيادة خطر النزيف؟", "options": ["Paracetamol بجرعات معتدلة ولفترة قصيرة", "Ibuprofen", "محلول ملح للأنف", "Vitamin C"], "correct": 1, "difficulty": "medium", "points": 3}, {"text": "مريض سكر بيقولك إن رجله فيها جرح صغير من يومين، والجرح بدأ يحمر ويسخن وفيه إفرازات. تتصرف إزاي؟", "options": ["تحط أي كريم وتستنى أسبوع", "تديله مسكن فقط", "توجهه لتقييم طبي سريع لأن علامات العدوى موجودة", "تقول له يمشي عليها كتير"], "correct": 2, "difficulty": "medium", "points": 3}, {"text": "شخص عنده إسهال بسيط من يوم واحد، لكنه قادر يشرب ومفيش دم في البراز ولا حرارة شديدة. إيه أهم حاجة في البداية؟", "options": ["تعويض السوائل والأملاح", "مضاد حيوي لكل الحالات", "إيقاف الأكل تمامًا", "كورتيزون"], "correct": 0, "difficulty": "medium", "points": 3}, {"text": "مريض بياخد مضاد حيوي وبيسأل: لو حسيت بتحسن بعد يومين أوقفه من نفسي؟ إيه التصرف الأفضل؟", "options": ["أيوه دائمًا", "لا، يلتزم بالمدة والتعليمات الموصوفة له، ولو عنده مشكلة يرجع للطبيب أو الصيدلي", "يضاعف الجرعة قبل الإيقاف", "يبدله بمضاد حيوي آخر"], "correct": 1, "difficulty": "medium", "points": 3}, {"text": "شخص عنده حساسية أنف وبيشتكي إن دواء الحساسية بيخليه نعسان جدًا. أي نوع غالبًا يكون أكثر تسببًا في النعاس؟", "options": ["مضاد هيستامين من الجيل الأول", "محلول ملحي للأنف", "Paracetamol", "مضاد حموضة"], "correct": 0, "difficulty": "medium", "points": 3}, {"text": "مريض عنده ضغط وبيستخدم علاج منتظم، وجاي يشتري دواء للبرد. أي مكوّن يحتاج حذر لأنه قد يرفع ضغط الدم؟", "options": ["Pseudoephedrine", "Paracetamol", "Saline nasal spray", "Honey"], "correct": 0, "difficulty": "medium", "points": 3}, {"text": "مريض بيستخدم بخاخ Salbutamol للربو وبيقولك إنه بقى محتاجه بشكل متكرر أكتر من المعتاد. إيه الأفضل؟", "options": ["يزود الجرعة من نفسه باستمرار", "يتجاهل الموضوع طالما البخاخ بيفتح صدره", "يحتاج مراجعة طبية لأن زيادة الاعتماد عليه قد تعني أن التحكم في الربو غير كافٍ", "يوقف كل أدوية الربو"], "correct": 2, "difficulty": "medium", "points": 3}, {"text": "شخص بيشتكي من حرقان في المعدة معظم الأيام بقاله فترة، وخصوصًا بالليل، وبدأت الأعراض تأثر على حياته. إيه التصرف الأنسب؟", "options": ["يستخدم أي مضاد حيوي", "يستمر على مضادات الحموضة للأبد بدون تقييم", "يحتاج تقييم طبي بدل الاعتماد على العلاج الذاتي المستمر", "يشرب قهوة أكثر"], "correct": 2, "difficulty": "medium", "points": 3}, {"text": "مريضة بتاخد Iron وبتقول إنها بتشرب الشاي مباشرة بعد الجرعة. إيه النصيحة الأفضل؟", "options": ["الشاي يزيد امتصاص الحديد", "يفضل تجنب الشاي قريبًا من جرعة الحديد لأنه قد يقلل امتصاصه", "الشاي يحول الحديد لمضاد حيوي", "مفيش أي علاقة"], "correct": 1, "difficulty": "medium", "points": 3}, {"text": "مريض عنده صداع مع قيء متكرر وبيقول إن الصداع ده مختلف وشديد جدًا وظهر فجأة. إيه التصرف؟", "options": ["تديله مسكن وتقول له يستنى", "تحوله لتقييم طبي عاجل", "تديله مضاد حيوي", "تقوله يشرب قهوة"], "correct": 1, "difficulty": "medium", "points": 3}, {"text": "مريض بياخد Metformin وبيشتكي من إسهال ومغص بدأوا بعد بدء العلاج مباشرة. إيه التصرف الأكثر منطقية؟", "options": ["يوقفه نهائيًا من نفسه ويبدأ إنسولين", "يفهم أن الأعراض قد تكون من الآثار الجانبية ويحتاج مراجعة طريقة الاستخدام والجرعة مع الطبيب/الصيدلي", "يزود الجرعة لتقليل الإسهال", "يضيف مضاد حيوي تلقائيًا"], "correct": 1, "difficulty": "hard", "points": 5}, {"text": "مريض ضغط بياخد ACE inhibitor وبيقول إن عنده كحة جافة مستمرة من غير بلغم من وقت بدء العلاج. إيه الاحتمال الأقرب؟", "options": ["أثر جانبي معروف لبعض أدوية ACE inhibitors", "لازم يكون التهاب رئوي", "ده دليل مؤكد على حساسية غذائية", "نقص الحديد"], "correct": 0, "difficulty": "hard", "points": 5}, {"text": "مريض بياخد Tetracycline وبيسأل ينفع ياخده مع اللبن في نفس الوقت؟", "options": ["نعم، اللبن يزيد الامتصاص دائمًا", "يفضل الفصل لأن الكالسيوم قد يقلل امتصاص بعض أدوية Tetracyclines", "اللبن يحول الدواء لمضاد فيروسات", "مفيش أي تأثير"], "correct": 1, "difficulty": "hard", "points": 5}, {"text": "مريض بياخد Levothyroxine صباحًا وبيشرب قهوة وفطاره مباشرة بعد القرص. إيه النصيحة الأفضل؟", "options": ["يفضل أخذه على معدة فارغة والانتظار قبل الأكل/المشروبات حسب التعليمات الطبية", "ياخده بعد وجبة دسمة", "يزود الجرعة مع القهوة", "يوقف العلاج أيام القهوة"], "correct": 0, "difficulty": "hard", "points": 5}, {"text": "مريض بيستخدم NSAID لفترة طويلة وبدأ يشتكي من براز أسود قطراني ودوخة. إيه أهم تصرف؟", "options": ["يعتبرها حموضة عادية", "يستخدم مضاد حموضة فقط ويكمل الدواء", "يحتاج تقييمًا طبيًا عاجلًا لاحتمال وجود نزيف بالجهاز الهضمي", "يشرب قهوة"], "correct": 2, "difficulty": "hard", "points": 5}, {"text": "مريض عنده التهاب حلق وحرارة وبيسأل عن مضاد حيوي، لكن عنده أيضًا طفح جلدي بعد استخدام Penicillin سابقًا مع تورم وصعوبة تنفس. إيه أهم نقطة؟", "options": ["يديله Penicillin بجرعة أقل", "يتعامل مع تاريخ الحساسية كعلامة خطيرة ويحتاج تقييمًا طبيًا، خصوصًا مع أعراض التنفس", "يضيف Vitamin C فقط", "يقول له يجرب المضاد مرة أخرى"], "correct": 1, "difficulty": "hard", "points": 5}, {"text": "مريض بياخد Digoxin وبيشتكي من غثيان واضطراب في الرؤية وإحساس إن الألوان مختلفة. إيه التصرف الأنسب؟", "options": ["يطمّنه ويزود الجرعة", "يعتبر الأعراض عادية دائمًا", "يحتاج تقييمًا طبيًا سريعًا لاحتمال سمية الدواء", "يديله مسكن فقط"], "correct": 2, "difficulty": "hard", "points": 5}, {"text": "مريض بياخد Corticosteroid لفترة وعايز يوقفه فجأة لأنه اتحسن. إيه التصرف الصحيح؟", "options": ["يوقفه فجأة في كل الحالات", "مايوقفوش فجأة بدون توجيه طبي؛ بعض الاستخدامات الطويلة تحتاج تقليلًا تدريجيًا", "يضاعف الجرعة ثم يوقفه", "يستبدله بمضاد حيوي"], "correct": 1, "difficulty": "hard", "points": 5}, {"text": "مريض عنده ألم بالصدر مع عرق بارد وضيق نفس ويمتد الألم للذراع. إيه التصرف؟", "options": ["تديله مسكن وتطلب منه الانتظار", "توجهه للطوارئ فورًا لأن الأعراض قد تشير لحالة قلبية خطيرة", "تديله دواء للغازات فقط", "تقول له يمشي شوية"], "correct": 1, "difficulty": "hard", "points": 5}, {"text": "مريضة حامل بتسأل عن أي دواء للصداع لأنها عايزة تاخد مسكن من نفسها. إيه أفضل تصرف صيدلي؟", "options": ["أي مسكن بدون سؤال", "تحديد عمر الحمل والأدوية والحالة أولًا واختيار الخيار المناسب للحمل عند الحاجة، مع تجنب الأدوية غير المناسبة", "تديلها NSAID بشكل تلقائي", "تديلها مضاد حيوي"], "correct": 1, "difficulty": "hard", "points": 5}];

const rooms = new Map();

function code() {
  let c;
  do c = String(Math.floor(100000 + Math.random()*900000));
  while (rooms.has(c));
  return c;
}
function publicRoom(room) {
  return {code:room.code, host:room.host, players:[...room.players.values()].map(p=>({id:p.id,name:p.name,score:p.score}))};
}
function broadcast(room, obj) {
  const msg=JSON.stringify(obj);
  for (const p of room.players.values()) if (p.ws.readyState===WebSocket.OPEN) p.ws.send(msg);
}
function send(ws,obj){ if(ws.readyState===WebSocket.OPEN) ws.send(JSON.stringify(obj)); }

function startQuestion(room) {
  if (room.qIndex >= room.questions.length) {
    room.state="finished";
    const leaderboard=[...room.players.values()].map(p=>({name:p.name,score:p.score}))
      .sort((a,b)=>b.score-a.score);
    broadcast(room,{type:"finished",leaderboard});
    return;
  }
  room.state="question";
  room.answers=new Map();
  room.endsAt=Date.now()+10000;
  const q=room.questions[room.qIndex];
  broadcast(room,{type:"question",index:room.qIndex,total:room.questions.length,
    text:q.text,options:q.options,difficulty:q.difficulty,points:q.points,endsAt:room.endsAt});
  clearTimeout(room.timer);
  room.timer=setTimeout(()=>reveal(room),10000);
}
function reveal(room) {
  if(room.state!=="question") return;
  room.state="reveal";
  const q=room.questions[room.qIndex];
  const results=[...room.players.values()].map(p=>({name:p.name,score:p.score,answer:room.answers.get(p.id)?.answer ?? null}));
  broadcast(room,{type:"reveal",correct:q.correct,results});
  clearTimeout(room.nextTimer);
  room.nextTimer=setTimeout(()=>{room.qIndex++;startQuestion(room)},2200);
}

const server=http.createServer((req,res)=>{
  let file=req.url.split("?")[0];
  if(file==="/") file="/index.html";
  const p=path.join(__dirname,"public",file);
  fs.readFile(p,(err,data)=>{
    if(err){res.writeHead(404);return res.end("Not found");}
    const ext=path.extname(p);
    const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8"};
    res.writeHead(200,{"Content-Type":types[ext]||"application/octet-stream"});
    res.end(data);
  });
});
const wss=new WebSocket.Server({server});
wss.on("connection",ws=>{
  let playerId=Math.random().toString(36).slice(2);
  ws.on("message",raw=>{
    let m; try{m=JSON.parse(raw)}catch{return}
    if(m.type==="create"){
      const room={code:code(),host:playerId,players:new Map(),qIndex:0,state:"lobby",questions:[...questions],answers:new Map()};
      const p={id:playerId,name:(m.name||"اللاعب").slice(0,20),score:0,ws};
      room.players.set(playerId,p); rooms.set(room.code,room); ws.room=room;
      send(ws,{type:"created",code:room.code,id:playerId,room:publicRoom(room)});
    }
    if(m.type==="join"){
      const room=rooms.get(String(m.code||""));
      if(!room) return send(ws,{type:"error",message:"الكود غير صحيح أو الغرفة غير موجودة"});
      if(room.state!=="lobby") return send(ws,{type:"error",message:"اللعبة بدأت بالفعل"});
      const p={id:playerId,name:(m.name||"اللاعب").slice(0,20),score:0,ws};
      room.players.set(playerId,p); ws.room=room;
      broadcast(room,{type:"lobby",room:publicRoom(room)});
    }
    if(m.type==="start"){
      const room=ws.room;
      if(room && room.host===playerId && room.state==="lobby") startQuestion(room);
    }
    if(m.type==="answer"){
      const room=ws.room;
      if(!room || room.state!=="question" || room.answers.has(playerId)) return;
      const q=room.questions[room.qIndex];
      const answer=Number(m.answer);
      room.answers.set(playerId,{answer,at:Date.now()});
      if(answer===q.correct){
        const p=room.players.get(playerId); p.score += q.points;
      }
      if(room.answers.size===room.players.size) reveal(room);
    }
  });
  ws.on("close",()=>{
    const room=ws.room;
    if(!room) return;
    room.players.delete(playerId);
    if(room.players.size===0){clearTimeout(room.timer);clearTimeout(room.nextTimer);rooms.delete(room.code);}
    else if(room.state==="lobby") broadcast(room,{type:"lobby",room:publicRoom(room)});
  });
});

server.listen(PORT,()=>console.log("Pharma Battle running on port "+PORT));
