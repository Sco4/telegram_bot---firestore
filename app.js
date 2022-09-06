require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const { setInterval } = require('timers');
let fs = require('fs');
const path = require('node:path');
const http = require("http");
const { collection, query, where, onSnapshot } = require("firebase/firestore");

//const serviceAccount = require("./fb_config").fb_config;
const serviceAccount = require("./fb_config").fb_config;


const TOKEN = process.env.TG_TOKEN;
const PORT = process.env.PORT || 3000;

const bot = new Telegraf(TOKEN)
const app = express();




setInterval(function() {
    http.get("http://telegrambotkidspace.uc.r.appspot.com/");
}, 300000);



const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

const { Markup } = require('telegraf');

let isSco4Talking = false;
let currentTaskID = '001';
const sco4_id = 370562012;

let summaryMark = 0;
const enterAnswer = '📌 Введіть вашу відповідь та відправте повідомлення';


initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();


//**************** change name to userID *****************

/* db.collection("users").doc("Тимур").get().then(async function (doc) {
    if (doc && doc.exists) {
        var data = doc.data();
        
        // saves the data to 'name'
        db.collection("users").doc("1742522503").set(data);
        await db.collection('users').doc('Тимур').delete();
        //res();
    }
}); */


async function returnScore() {
     const scoreRef = db.collection('users');
     const snapshot = await scoreRef.where('userName', '!=', false).get();
       if (snapshot.empty) {
       console.log('No matching documents.');
       return;
     }  
    
         return snapshot;
     }

    async function returnTasks() {
        const scoreRef = db.collection('tasks');
        const snapshot = await scoreRef.where('taskID', '!=', false).get();
          if (snapshot.empty) {
          console.log('No matching documents.');
          return;
        }  
          return snapshot;
        }   
        
        async function returnHints() {
            const scoreRef = db.collection('hints');
            const snapshot = await scoreRef.where('hintID', '!=', false).get();
              if (snapshot.empty) {
              console.log('No matching documents.');
              return;
            }  
           
                return snapshot;
            } 
 
console.log('The Beginning');

  async function writeUserDataFS(userId, userName, isAnswer, answer, score) {

    await db.collection('users').doc(userId).set({
        userId,
        userName,
        isAnswer,
        answer,
        score
      
      });
    }


async function addAnswer(userId, data) {
    await db.collection('users').doc(userId).set(
        {
        "answer": data,
        }, { merge: true });
    
    }
/******************* */
   
async function addTask(taskID, taskText) {
     await db.collection('tasks').doc(taskID).set({
        taskID,
        taskText
       
       });
      isSco4Talking = false;
     }

function addAnswerToTask(userName, hisAnswer){
    set(ref(db, 'tasks/' + currentTaskID + '/' + userName), {
        userName,
        hisAnswer,
               
      });
    }

    //клавіатура головного меню
    const mainMenuKB =() => {
        return Markup.keyboard([
            ['Мої бали', 'Рейтинг учасників'],
            ['Завдання'],
            ['Підказки до завдань'],
        ]).resize()
    }

    //кнопка 'Головне меню'
    const mainMenu =() => {
        return Markup.keyboard([
            ['Головне меню']
        ]).resize()
    }

  //клавіатура "Завдання"
  async function  tasksKB(){

        let arrKB =[['Головне меню']];
        const arrFromBase =  await returnTasks();
        let i =1;

        arrFromBase.forEach(el =>{
            
            arrKB.push(['Завдання ' + (i)])
            i++;
            
        })

        return Markup.keyboard(arrKB).resize()
    }

    async function  tasksKB_inline(){

        let arrKB =[['Головне меню']];
        const arrFromBase =  await returnTasks();
        let i =1;

        arrFromBase.forEach(el =>{
            
            arrKB.push(['Завдання ' + (i)])
            i++;
            
        })

        return inline_keyboard(arrKB).resize()
    }


    async function  hintsKB(){

        let arrKB =[['Головне меню']];
        const arrFromBase =  await returnHints();
        let i =1;

        arrFromBase.forEach(el =>{
            
            arrKB.push(['Підказка до завд. ' + (i)])
            
            i++;
            
        })
        return Markup.keyboard(arrKB).resize()
       
        }

     //клавіатура "Додати завдання"
     const addTasksKB =() => {
        return Markup.keyboard([
            ['Оновити SCOREs'],
            ['Хто відповів?'],
            ['Головне меню']
        ]).resize()
    }

    //bot.telegram.sendMessage(sco4_id, "Hello man")


bot.start(async ctx => {
    const appeal = ctx.message.from.username? ctx.message.from.username: ctx.message.from.first_name;
    ctx.reply(`Вітаю тебе, ${appeal}! Я KidSpaceBot - буду допомагати тобі у навчанні.`+'\n'+
'Поки що я вмію не дуже багато, але... Все попереду 😉'+'\n'+
'Дякую за реєстрацію та до нових оновлень!' ,mainMenuKB());
    console.log(ctx.message)
    const userId = ctx.message.from.id.toString();
  

    const usersRef = db.collection('users').doc(userId);

    usersRef.get()

      .then((docSnapshot)  => {
        if (!docSnapshot.exists) {
            writeUserDataFS(userId, appeal, false, ' ', 0).catch(
                handleUnknownErr(ctx,'writeUserDataFS')
                );
        }
    });  
})

const getTask = async (ctx)  =>{
    let text = ctx.message.text;
    //let re = /За222вдання [0-9]/;
    let resText = text.match(/Завдання [0-9]/ );

    //m46atchAll = Array.from(matchAll);
    //console.log(matchAll[0].input);
        if(resText !== null){
            console.log(resText);
        let taskName ='';
        currentTaskID = +(text.split(' ')[1]);
        currentTaskID.toString().length<2?

        taskName = '0' + '0' + currentTaskID:
        taskName = '0' + currentTaskID;

        const name = ctx.message.from.username? ctx.message.from.username: ctx.message.from.first_name;
        //await ctx.deleteMessage(ctx.message.message_id);
        console.log (name + ' Просять завдання ' +currentTaskID)
        const userId = ctx.message.from.id.toString();
        const tasksRef = db.collection('tasks').doc(taskName);
        const doc2 = await tasksRef.get();
        const niceText = await doc2.data().taskText.replace( /Y/g, '\n');
        //const niceText = taskText.replace( /$/g, '\n');
       const taskMark = await doc2.data().taskMark;
//console.log(niceText);
        //const taskFromBase = currentTaskID-1;
        //const usersRef = db.collection('users').doc(name);
    
        const userRef = db.collection('users').doc(userId);
            const doc = await userRef.get();
            //const str = currentTaskID.toString();
            const myScore = doc.data();
           // console.log(myScore);
    //console.log(myScore['1']);
    if (myScore.answer[currentTaskID]){
        let str = '';
        if (myScore.answer[currentTaskID].hisMark !== null){
            str = '✅ Вам нараховано '+ myScore.answer[currentTaskID].hisMark+ ' балів';
        }
        else{
            str = '☝️ Ваше завдання ще на перевірці';
        }
        ctx.reply('Завдання '+currentTaskID+'. ' +'\n'  +'\n'+
        'Максимальна кількість балів: ' + taskMark +'\n'+ '\n'+niceText+'\n'+'\n'  +'\n'+ '🟢 Ви вже відповіли'+'\n'  +'\n'+ str + '\n'  +'\n'+
        '📌 Введіть нову відповідь та відправте повідомлення'+'\n'  +'\n'+
        'Або перейдіть в Головне меню 👇👇👇', mainMenu())
    }
    else{
    ctx.reply('Завдання '+currentTaskID+'. '+'\n'  +'\n'+
    'Максимальна кількість балів: ' + taskMark +'\n'+ '\n'+niceText+'\n'+'\n' + enterAnswer, mainMenu())
    }
    
        await db.collection("users").doc(userId).update({
            "isAnswer": true,
        }).catch(
            (error)=>{
                console.error()
            }
        )
    }
        }  

    const getHint = async (ctx)  =>{
            let text = ctx.message.text;
            let resText = text.match(/Підказка до завд. [0-9]/ );
            let hintName ='';
                if(resText !== null){
                    //console.log(resText);
                
                let hintID = +(text.split(' ')[3]);
                hintID.toString().length<2?

        hintName = '0' + '0' + hintID:
        hintName = '0' + hintID;
        console.log(hintName);
                const name = ctx.message.from.username? ctx.message.from.username: ctx.message.from.first_name;
                console.log (name + ' Просить підказку ' +hintID)                        
                const hintsRef = db.collection('hints').doc(hintName);
                const doc2 = await hintsRef.get();
                const niceText = await doc2.data().hintText.replace( /Y/g, '\n');              
                ctx.reply('Підказка до завдання '+ hintID+ '\n' + '\n' + niceText, mainMenu())

            }
        }

function handleUnknownErr(ctx,errorID=''){
return function(error){
    //console.error(error);
    console.log(errorID, error);
    ctx.reply('Уупс. Щось пішло не так. Спробуйте пізніше.')
}
}

bot.hears('Підказки до завдань', async ctx => {
    await ctx.deleteMessage(ctx.message.message_id);
    ctx.reply('Відкриваю підказки...',await hintsKB());

 
})


bot.hears('Завдання', async ctx => {
    await ctx.deleteMessage(ctx.message.message_id);
    ctx.reply('Відкриваю завдання...',await tasksKB());

 
})

async function rewriteScore(userId, score) {
    await db.collection('users').doc(userId).set(
        {
        "score": score,
        }, { merge: true });
    
    }


bot.hears('1722', async ctx => {
    if(ctx.message.from.id === 370562012) {   
       ctx.reply('Оновити дані учасників',addTasksKB());    
}}
)

async function returnWhoAnsw() {
    const usersWhoAnsw = []; 
    const scoreRef = db.collection('users');
    const snapshot = await scoreRef.where('userName', '!=', false).get();
      if (!snapshot.empty) {
        const arrFromBase = snapshot;
        
        arrFromBase.forEach(async el =>{
            // const userId = el.data().userId.toString();
             //console.log(userId)
             //let hisScore=0;
             const answers = await el.data().answer;                  
                if(answers){
  
                  for (var key in answers) {
                     if(answers[key].hisMark == null){
                      usersWhoAnsw.push([el.data().userId,el.data().sco4_name,key,answers[key].hisMark]);
                     }
                      }
                  }
                 
                                    
             });
    }  
       
        return usersWhoAnsw;
    }



bot.hears('Хто відповів?', async ctx => {
    if(ctx.message.from.id === 370562012) {  
        const arr = await returnWhoAnsw();
        const str = arr.join('\n');
        console.log(arr)
        console.log(str)
        ctx.reply(str)
    }}
)


    bot.hears('Оновити SCOREs', async ctx => {
        if(ctx.message.from.id === 370562012) {  
           const arrFromBase = await returnScore(); 
           arrFromBase.forEach(async el =>{
               const userId = el.data().userId.toString();
              // console.log(userId)
               let hisScore=0;
               const answers = await el.data().answer;                  
                  if(answers){

                    for (var key in answers) {
                       hisScore += answers[key].hisMark;
                        }
                    }
                    console.log(hisScore);
                   if(!isNaN(hisScore)) {
                       rewriteScore(userId, hisScore)
                    }                     
               });
         } 
        }
)

bot.hears('Мої бали', async ctx => {
    await ctx.deleteMessage(ctx.message.message_id);
    const name = ctx.message.from.username? ctx.message.from.username: ctx.message.from.first_name;
    const userId = ctx.message.from.id.toString();
    summaryMark =0;
    let tasksNum =0;
    const arrFromBase = await returnTasks(); 
    arrFromBase.forEach(el =>{
        summaryMark += +el.data().taskMark
        tasksNum++;
    })
   
    const userRef = db.collection('users').doc(userId);
        const doc = await userRef.get();
        let myScore = 0;
        let answNum = 0;
        const answers = await doc.data().answer;
        console.log(answers);
        for (var key in answers) {
            myScore += answers[key].hisMark;
            answNum++;
          }
         if  (isNaN(myScore)){
            myScore =0;
            answNum =0;
         }
        
    console.log(name + ' запросив бали');

    ctx.reply('🧠 МАКСИМАЛЬНО МОЖЛИВА КІЛЬКІСТЬ БАЛІВ: ' + summaryMark+ '\n'+'\n'
    +'✔ ' +name + ', у Вас '+ myScore + ' балів.'+'\n'+'\n'
    +'➡ Розв\'язано завдань: ' +answNum + ' з ' + tasksNum);

})

const readScore = (array,ctx) =>{
    let i = 1;
    let results = '';
    array.forEach(el =>{
      if(el.name === ctx.message.from.username || el.name === ctx.message.from.first_name){
        results += '😉' + i++ + '. ' + el.name + ': ' + el.score +'\n';
      }
      else{
        results += i++ + '. ' + el.name + ': ' + el.score +'\n';
      }
        
})
return results;
}

bot.hears('Рейтинг учасників', async ctx => {
    await ctx.deleteMessage(ctx.message.message_id);
        let myArr =[];
        const arrFromBase = await returnScore(); 
        const userId = ctx.message.from.id.toString();

        arrFromBase.forEach(el =>{
            myArr.push({name: el.data().userName, score: el.data().score})
            
        })

        myArr = myArr.sort((a, b) => a.score > b.score ? -1 : 1);
        //console.log(myArr);
        ctx.reply(readScore(myArr,ctx));

    })

bot.hears('Головне меню', async ctx => {
    const name = ctx.message.from.username? ctx.message.from.username: ctx.message.from.first_name;
    const userId = ctx.message.from.id.toString();
    await ctx.deleteMessage(ctx.message.message_id);
    ctx.reply('Відкриваю головне меню...',mainMenuKB());

    db.collection("users").doc(userId).update({
        "isAnswer": false,
    });
  
})

bot.on('text',async ctx => {
        const text = ctx.message.text;
        const name = ctx.message.from.username? ctx.message.from.username: ctx.message.from.first_name;
        const userId = ctx.message.from.id.toString();

        const userRef = db.collection('users').doc(userId);
        const doc = await userRef.get();
        const isMainAnswer = await doc.data().isAnswer;

    let textTask = text.match(/Завдання [0-9]/ );
    let textHint = text.match(/Підказка до завд. [0-9]/ );
        if(textTask !== null){
          getTask(ctx);
        } else{
            if(textHint !== null){
                getHint(ctx);
             }
        
        else{

        if((ctx.message.from.id === 370562012) && isSco4Talking){

            const taskID = text.slice(0,3);
            const taskText = text.slice(4);
            console.log(isSco4Talking);
            console.log(taskID, taskText);
           
            addTask(taskID,taskText).catch(
                handleUnknownErr(ctx,'addTaskToBase')
                
                );
            
        }
    
        if (isMainAnswer){
            
            console.log(`Ваша відповідь: ${text}`);
            ctx.reply('Вашу відповідь записано. Чекайте перевірки ;-)');
            ctx.reply(`Ви відповіли: ${text}`);
            ctx.reply('Відкриваю головне меню...',mainMenuKB());
            const userRef = db.collection('users').doc(userId);
        const doc = await userRef.get();
        const sco4_name = await doc.data().sco4_name;
            const data = {         
                
                [currentTaskID]:
                {hisAnswer: text,
                hisMark: null
                },
                
            }

            addAnswer(userId,data);
            bot.telegram.sendMessage(sco4_id, `${userId}: ${sco4_name}: ${[currentTaskID]}: ${text}`)
            
            db.collection("users").doc(userId).update({
                "isAnswer": false,
            });
       
        }
          
    /********************************************* */
    else{
    
    const appeal = ctx.message.from.username? ctx.message.from.username: ctx.message.from.first_name;
    
    //ctx.reply(`${appeal} сказав ${text}`);
    await ctx.deleteMessage(ctx.message.message_id);
    console.log(`${appeal} сказав ${text}`)
   // let text = ctx.message.text;
            //let re = /Завдання [0-9]/;
            let resText = text.match(/Підказка до завд. [0-9]/ );
            if(resText == null){
    ctx.reply('Відкриваю головне меню...',mainMenuKB());
            }
        }
        /************************************ */
        }}
    })


bot.on('voice', ctx => {
    ctx.reply('нормальний такий голос')
})

bot.launch();

app.listen(PORT, () => console.log(`My server is running on port ${PORT}`))