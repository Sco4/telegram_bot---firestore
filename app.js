require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const { setInterval } = require('timers');
let fs = require('fs');
const path = require('node:path');
const http = require("http");

//const serviceAccount = require("./fb_config").fb_config;
const serviceAccount = require("./fb_config").fb_config;

const TOKEN = process.env.TG_TOKEN;
const PORT = process.env.PORT || 3000;

const bot = new Telegraf(TOKEN)
const app = express();

setInterval(function() {
    http.get("http://https://telegrambotkidspace.uc.r.appspot.com/");
}, 300000);



const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

const { Markup } = require('telegraf');

let isSco4Talking = false;
let currentTaskID = '001';
const enterAnswer = '📌 Введіть вашу відповідь та відправте повідомлення';
const tasksArray = 
[{tskid: 1,
tskText:
'Cтворіть 2 змінні. Одна має бути числовою. Інша - булевського типу:'+
'спочатку true, потім false. В консоль (console.log) виведіть їх суму.'+
'Зробіть висновки на основі отриманих даних',
tskMark: 1},

{tskid: 2,
tskText:
'Написати програму, яка б міняла місцями дані у двох змінних.'+
 'Що мається на увазі: є дві змінні: a = \'first\' та " b = \'second\''+
 '. Після виконання певних дій результатом роботи методу \'console.log( a + b )\''+
 'має бути \'secondfirst\'. Дуже круто, якщо вони виведуться у консоль з пробілом'+
'(\'second first\') (конструкцію (a+b) для цього можна трішки змінити).'+
'Додавати пробіл до змінної неможна.',
tskMark: 3},

{tskid: 3,
tskText:
'З певного моменту пройшло 395 днів. Скільки повних тижнів пройшло з цього моменту?'+
'\nПримітка: функцію округлення не використовувати, результат отримати у вигляді цілого'+
 'числа. Використовувати можна лише оператори з лекції (+, -, *, /, %, **)',
 tskMark: 5},

 {tskid: 4,
tskText:
'1. Микола отримав заробітну плату у розмірі 10000грн.\n' +
'2. Цього ж місяця йому дали премію у вигляді 15% від зарплати.\n' +
'3. Податки є податки. Слід платити)) 10% від загальної суми (зарплата+премія)'+
'микола віддав у вигляді податків.\n' +
'4. Так як зарплату отримали і колеги Миколи, то Семен повернув Миколі борг - 2700 грн.\n' +
'5. Перед тим, як опинитись вдома, Микола зайшов в АТБ і витратив там 450 грн.\n' +
'6. За сімейною домовленістю, всі отримані гроші Микола ділить навпіл з дружиною.\n' +
'\n' +
'Скільки грошей залишилось у Миколи?\n' +
'\n' +

'Примітка: використовувати ТІЛЬКИ оператори +=, -=, *=, /=. Кожний крок коментувати',
tskMark: 4},

{tskid: 5,
tskText:
'Дана строка: Всім Гарних Вихідних, Йо!\n' +
'Написати програму, яка б виводила в консоль це речення'+
'у звичному нам вигляді "Всім гарних вихідних, йо!\"',
tskMark: 5},

{tskid: 6,
tskText:
'Є дві числових змінних: a та b, причому a не дорівнює b.'+
'Не порівнюючи між собою значення змінних a та b, написати програму,'+
'яка б виводила в консоль \'true\', якщо a > b і \'false\', якщо a < b. Успіхів!',
tskMark: 7},

{tskid: 7,
tskText:'Дано тризначне число N. Вивести в консоль також тризначне число,'+
'отримане шляхом перестановки цифр числа N. Якщо нове отримане число -'+
'парне, наступною строкою вивести сповіщення про це - \'Число парне\'.\n' +
'\n' +
'Нарриклад:\n' +
'\n' +
'let N = 456;\n' +
'... //ваш код\n' +
'\n' +
'Результат виводу в консоль: 654',
tskMark: 6},
]

const hints = [
    {hintsID: 1,
    hintsText: 'Ну, тут немо чого пояснювати)) Бери й роби!'},

    {hintsID: 2,
    hintsText: 'Слід пам\'ятати, що одна змінна може зберігати лише' +
' одне значення. Очевидно, щоб "перекласти" дані з однією змінної в іншу, '+
'нам знадобиться ще одна, третя змінна'},

    {hintsID: 3,
    hintsText: 'Щоб отримати залишок від ділення, слід використовувати оператор \'%\'.' + '\n'+'\n'+
'Наприклад: '+ '\n'+'\n'+
'5 % 3 = 2'+ '\n'+'\n'+
'Дійсно, 5 / 3 = 1 (2 ост.). Цю остачу (2) ми й отримуємо за допомогою оператора  \'%\''+
'Як же нам отримати цілу частинувід ділення? Все просто! Позбутися залишку (остачі) і поділити.'+
'(5 - 2) / 3 = 1'},

    {hintsID: 4,
    hintsText: 'Ця задача доволі проста. Хто звернув увагу на примітку і дійсно бажає не виходити'+
' за межі операторів +=, -+, *= та /=, пропоную пригадати, що 100% + 10% = 110%. Як з числа (100%)'+
' отримати 110%? Помножити на 1.1! '},

{hintsID: 5,
    hintsText: 'Щоб розв\'язати цю задачу, слід побудувати в голові покровий алгоритм рішення.'+ '\n'+'\n'+
    'Так як початкову строку змінювати неможна, ми зробимо з неї 2 строки (за допомогою методу slice.'+
    ' Потім першу - робимо великою ( метод toUpperCase() ), другу - маленькою ( метод toLowerCase() )'+
    ' (маються на увазі літери строки, звісно =)). Після всіх цих маніпуляцій залишиться поєднати 2 нові строки в одну'+
    ' і все! Справу зроблено!'},

{hintsID: 6,
    hintsText: 'Дуже б не хотілось, щоб саме цією підказою ви користувались, але... Вже натиснули))'+ '\n'+'\n'+
'Так як за умовами завдання НЕМОЖНА будь-яким чином порівнювати між собою змінні a та b, очевидно, що рішення '+
'вимагає від нас провести з цими змінними певні маніпуляції...'+ '\n'+'\n'+
'А тепер підказка:'+ '\n'+'\n'+

'Чому дорівнюватиме різниця a-b, якщо a=b?'+ '\n'+'\n'+
'Все, далі самі))' },

{hintsID: 7,
    hintsText: 'Будь-яке багатозначне число можна "розібрати" на складові. Що мається на увазі?'+
'Щоб отримати число, наприклад, 745, нам слід кількість сотен помножити на 100, кількість десятків помножити на 10'+
', додати кількість одиниць.'+ '\n'+'\n'+
'745 = 7*100 + 4*10 + 5'+ '\n'+'\n'+
'Як отримати кількість цих клятих сотен? Дивись Задачу 3. Все  ж те саме! Є число, слід знайти кількість'+
' повних входжень числа 100. Потім працюємо із залишком - аналогічно знаходимо десятки та одиниці.'+
'Ну й врешті-решт зліплюємо все це в результат (проводимо "збірку числа" у зворотній послідовності).'},
]

let summaryMark = 0;

tasksArray.forEach(el =>{
    summaryMark += el.tskMark;
})

//console.log(summaryMark);

//const express = require('express');

//console.log(serviceAccount);


initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function returnScore() {
     const scoreRef = db.collection('users');
     const snapshot = await scoreRef.where('userName', '!=', false).get();
       if (snapshot.empty) {
       console.log('No matching documents.');
       return;
     }  
    
         return snapshot;
     }

  
//returnScore();
console.log('The Beginning');

  // Create a query against the collection
  


  async function writeUserDataFS(userId, userName, isAnswer, answer, score) {
    
   /*  if (userName==='mrSco4'){
        throw new Error('my err msg');
    } */
    await db.collection('users').doc(userName).set({
        userId,
        userName,
        isAnswer,
        answer,
        score
      
      });
    }



  async function addAnswer(userName, data) {
    await db.collection('users').doc(userName).update(data);
    
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



//const e = require('express');

//const dirName = 'C:\\Users\\stask\\My Drive\\KID space\\01\\';

/* const inl_KB = {
    reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Edit Text',
              callback_data: 'edit'
            }
          ]
        ]
        }
    } */



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
    function  tasksKB(){
        return Markup.keyboard([
           ['Головне меню'],
           ['Завдання 1'],
           ['Завдання 2'],
           ['Завдання 3'],
           ['Завдання 4'],
           ['Завдання 5'],
           ['Завдання 6'],
           ['Завдання 7'],
           
        ]).resize()
    }

        //клавіатура "Завдання"
        function  hintsKB(){
            return Markup.keyboard([
               ['Головне меню'],
               ['Підказка до завд. 1'],
               ['Підказка до завд. 2'],
               ['Підказка до завд. 3'],
               ['Підказка до завд. 4'],
               ['Підказка до завд. 5'],
               ['Підказка до завд. 6'],
               ['Підказка до завд. 7'],
               
            ]).resize()
        }

     //клавіатура "Додати завдання"
     const addTasksKB =() => {
        return Markup.keyboard([
            ['Додати завдання'],
            ['Головне меню']
        ]).resize()
    }



bot.start(async ctx => {
    ctx.reply('ВПРИВІТ!',mainMenuKB());
    console.log(ctx.message)
    const name = ctx.message.from.username? ctx.message.from.username: ctx.message.from.first_name;
  

    const usersRef = db.collection('users').doc(name);

    usersRef.get()

      .then((docSnapshot)  => {
        if (!docSnapshot.exists) {
            writeUserDataFS(ctx.message.from.id, name, false, ' ', 0).catch(
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
        
        currentTaskID = +(text.split(' ')[1]);
        const name = ctx.message.from.username? ctx.message.from.username: ctx.message.from.first_name;
        //await ctx.deleteMessage(ctx.message.message_id);
        console.log (name + ' Просять завдання ' +currentTaskID)
        const tasFromArrNum = currentTaskID-1;
        //const usersRef = db.collection('users').doc(name);
    
        const userRef = db.collection('users').doc(name);
            const doc = await userRef.get();
            //const str = currentTaskID.toString();
            const myScore = doc.data();
    //console.log(myScore['1']);
    if (myScore[currentTaskID]){
        ctx.reply('Завдання '+currentTaskID+'. ' +'\n'  +'\n'+
        'Максимальна кількість балів: ' + tasksArray[tasFromArrNum].tskMark +'\n'+ '\n'+tasksArray[tasFromArrNum].tskText+'\n'+'\n'  +'\n'+ '🟢 Ви вже відповіли 🟢'+'\n'  +'\n'+
        '📌 Введіть нову відповідь та відправте повідомлення'+'\n'  +'\n'+
        'Або перейдіть в Головне меню 👇👇👇', mainMenu())
    }
    else{
    ctx.reply('Завдання '+currentTaskID+'. '+'\n'  +'\n'+
    'Максимальна кількість балів: ' + tasksArray[tasFromArrNum].tskMark +'\n'+ '\n'+tasksArray[tasFromArrNum].tskText+'\n'+'\n' + enterAnswer, mainMenu())
    }
    
        await db.collection("users").doc(name).update({
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
            //let re = /Завдання [0-9]/;
            let resText = text.match(/Підказка до завд. [0-9]/ );
        
            //matchAll = Array.from(matchAll);
            //console.log(matchAll[0].input);
                if(resText !== null){
                    console.log(resText);
                
                let hintID = +(text.split(' ')[3]);
                const name = ctx.message.from.username? ctx.message.from.username: ctx.message.from.first_name;
                //await ctx.deleteMessage(ctx.message.message_id);
                console.log (name + ' Просить підказку ' +hintID)
                const hintFromArrNum = hintID-1;
                //const usersRef = db.collection('users').doc(name);
            
            ctx.reply(hints[hintFromArrNum].hintsText, mainMenu())
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
    ctx.reply('Відкриваю підказки...',hintsKB());

 
})


bot.hears('Завдання', async ctx => {
    await ctx.deleteMessage(ctx.message.message_id);
    ctx.reply('Відкриваю завдання...',tasksKB());

 
})

bot.hears('1722', ctx => {
    if(ctx.message.from.id === 370562012) {
        const text = ctx.message.text;
        ctx.reply('Додай, бро!',addTasksKB());;
        console.log('1722, Sco4 is talking');
        console.log(isSco4Talking);
        
    }
})

    bot.hears('Додати завдання', ctx => {
        if(ctx.message.from.id === 370562012) {
            isSco4Talking = true;
            ctx.reply('Введіть завдання у форматі №№№ЗавданняХ');
            console.log('Sco4 is talking');
            console.log(isSco4Talking);
            
        }


})


bot.hears('Мої бали', async ctx => {
    await ctx.deleteMessage(ctx.message.message_id);
    const name = ctx.message.from.username? ctx.message.from.username: ctx.message.from.first_name;
    const userRef = db.collection('users').doc(name);
        const doc = await userRef.get();
        const myScore = await doc.data().score;
        
    console.log(name + ' запросив бали');

    ctx.reply('🧠 МАКСИМАЛЬНО МОЖЛИВА КІЛЬКІСТЬ БАЛІВ: ' + summaryMark+ '\n'+'\n'
    +name + ', у Вас '+ myScore + ' балів.');

})

const readScore = (array,ctx) =>{
    let i = 1;
    let results = '';
    array.forEach(el =>{
      if(el.name === ctx.message.from.username){
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
    const name = ctx.message.from.username? ctx.message.from.username: ctx.message.from.first_name;
        let myArr =[];
        const arrFromBase = await returnScore(); 
        
        arrFromBase.forEach(el =>{
            myArr.push({name: el.id, score: el.data().score})
            
        })

        
        myArr = myArr.sort((a, b) => a.score > b.score ? -1 : 1);
        console.log(myArr);
        ctx.reply(readScore(myArr,ctx));

    })

bot.hears('Головне меню', async ctx => {
    const name = ctx.message.from.username? ctx.message.from.username: ctx.message.from.first_name;
    await ctx.deleteMessage(ctx.message.message_id);
    ctx.reply('Відкриваю головне меню...',mainMenuKB());

    db.collection("users").doc(name).update({
        "isAnswer": false,
    });
  
})

bot.on('text',async ctx => {
        const text = ctx.message.text;
        const name = ctx.message.from.username? ctx.message.from.username: ctx.message.from.first_name;
        

        const userRef = db.collection('users').doc(name);
        const doc = await userRef.get();
        const isMainAnswer = await doc.data().isAnswer;

        getTask(ctx);
        getHint(ctx);

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
            const data = {         
                
                [currentTaskID]:
                {hisAnswer: text}
            }

            addAnswer(name,data);
            
            db.collection("users").doc(name).update({
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
    
    })


bot.on('voice', ctx => {
    ctx.reply('нормальний такий голос')
})

bot.launch();

app.listen(PORT, () => console.log(`My server is running on port ${PORT}`))