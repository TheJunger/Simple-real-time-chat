const admin = require('firebase-admin');
const firebase = require('firebase/app');

const cors = require('cors')
const bodyParser = require('body-parser')
const authenticathor = require('firebase/auth')
const { getDatabase, ref, onValue, limitToLast, orderByChild, equalTo, query, orderByValue, push, update, set, get, child, onChildAdded } = require('firebase/database')
const { createServer } = require('http')
const express = require('express')
const { Server } = require('socket.io')
const dotenv = require('dotenv').config()

const app = express()
const httpServer = createServer(app)

//app.use('/socket.io', require('cors')());
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const serviceAccount = require(process.env.SERVICE_ACCOUNT)

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID,
  databaseURL: process.env.DATABASE_URL,
};

const iniciar = firebase.initializeApp(firebaseConfig)

const auth = authenticathor.getAuth(iniciar)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "realtimechatbypera",
});

app.get('/main', async (req,res)=>{
  res.send('cosa lista')
})

app.post('/rsc/login', async(req,res)=>{
  if(req.body.tryLogin == true){
  // Autenticarse con un usuario de prueba
  authenticathor.signInWithEmailAndPassword(auth,req.body.email,req.body.password)
  .then((userCredential) => {
    const myUserId = auth.currentUser;
    // Autenticación exitosa
    console.log('Inicio de sesion exitosa de', + myUserId.displayName + ' UID = ' + myUserId.uid);

    //auth.onIdTokenChanged((user)=>{
    //  authenticathor.updateProfile(user,{displayName:'Usuario de prueba'})
    //  console.log(myUserId.displayName)
    //})

    if(userCredential){ // si userCredentail existe entonces =>
      console.log('login')
      res.send({'login':true})
    }
    });
  }
  console.log(req.body)
})

app.get('/rsc/obtainmyuserdata', async(req,res)=>{
  const myUserId = auth.currentUser;
  res.send({'userName':myUserId.displayName?myUserId.displayName:myUserId.email, 'userID':auth.currentUser.uid, 'userImage':''})
})

app.post('/rsc/obtainmessages', async(req, res) => {
  const io = new Server(httpServer, {
    cors:{
      origin: '*'
    }
  })
  io.on('connection', async (socket) => {
  //  if(sendAllMessages == 0){
  const myUserId = auth.currentUser;
  const basededatos = getDatabase(iniciar, 'https://realtimechatbypera-default-rtdb.firebaseio.com/');
  const refADB = ref(basededatos, `messages/users/${myUserId.uid}/messages`);
  const mensajesEnviadosDeDB = ref(basededatos, `messages/users/${req.body.id}/messages`);
  const search = query(refADB, limitToLast(15), orderByChild('timestamp'));
  const searchAll = query(mensajesEnviadosDeDB, limitToLast(15), orderByChild('timestamp'));
  const listaDeMensajesEnviados = [];
  const listaDeMensajesRecibidos = [];
  onValue(search,(cosa)=>{
    const dataMensajes = cosa.val()
    for(const mensajes in dataMensajes){
      listaDeMensajesEnviados.push({'contenido':dataMensajes[mensajes].content, 'mensajeid':mensajes, 'fecha':dataMensajes[mensajes].date, 'timestamp':dataMensajes[mensajes].timestamp, 'tipo':'enviado'})
    }
     //SEPARAR POSTERIORMENTE FECHA Y HORA  //SEPARAR POSTERIORMENTE FECHA Y HORA  //SEPARAR POSTERIORMENTE FECHA Y HORA
  })

  onValue(searchAll,(cosa)=>{
    const dataMensajes = cosa.val()
    for(const mensajes in dataMensajes){
      if(dataMensajes[mensajes].receiverId == myUserId.uid){
        listaDeMensajesRecibidos.push({'contenido':dataMensajes[mensajes].content, 'mensajeid':mensajes, 'fecha':dataMensajes[mensajes].date, 'timestamp':dataMensajes[mensajes].timestamp, 'tipo':'recibido'})
        }
      }
    })
  //  sendAllMessages = 1
  //}
    onChildAdded(query(refADB, limitToLast(1), orderByChild('timestamp')), async (data) => { //CREO QUE EL MANEJADOR LO TENGO QUE AHCER ACA
        console.log(data.key)
        //console.log ('-1-------')
        //console.log(listaDeMensajesEnviados[listaDeMensajesEnviados.length - 1].mensajeid)
        //console.log ('-2-------')
        console.log(data.key == listaDeMensajesEnviados[listaDeMensajesEnviados.length - 2].mensajeid)
        if(data.key != listaDeMensajesEnviados[listaDeMensajesEnviados.length - 2].mensajeid){
          socket.emit('nuevoMensajeEnviado', {'contenido':data.val().content, 'fecha':data.val().date, 'mensajeid':data.key, 'timestamp':data.val().timestamp, 'tipo':'enviado'})
          //console.log('el socket deberia ser emitido')
        }
    });
  
    // Escuchar nuevos mensajes recibidos
    onChildAdded(query(mensajesEnviadosDeDB, limitToLast(1)), (data) => {
      if (data.key != listaDeMensajesRecibidos[listaDeMensajesRecibidos.length - 2].mensajeid && data.val().receiverId == myUserId.uid) {
        socket.emit('nuevoMensajeRecibido', {'contenido':data.val().content, 'fecha':data.val().date, 'mensajeid':data.key, 'timestamp':data.val().timestamp, 'tipo':'recibido'})
        //actualizarEmisorEnviado();
      }
    });
  

    //console.log('Nueva conexión socket');
    // Enviar todos los mensajes
    //res.send({ mensajesEnviados: listaDeMensajesEnviados, mensajesRecibidos: listaDeMensajesRecibidos });
    socket.emit('messages', { mensajesEnviados: listaDeMensajesEnviados, mensajesRecibidos: listaDeMensajesRecibidos });
    //tester++
    //console.log(tester + ' emit messagers ')
    // Escuchar nuevos mensajes enviados

  });  
  //res.send({ mensajesEnviados: listaDeMensajesEnviados, mensajesRecibidos: listaDeMensajesRecibidos });
});

// Manejar la conexión del socket y la lógica de escucha en el nivel de la aplicación



app.get('/rsc/obtainusers', async (req,res)=>{
  const basededatos = getDatabase(iniciar,'https://realtimechatbypera-default-rtdb.firebaseio.com/');
  const refADB = ref(basededatos, 'messages/users');
  const listaUsuarios = [];

  onValue(refADB, (snapshot) => {
    const users = snapshot.val();
    const uidArray = Object.keys(users);

    for (const uid in users) {
      const username = users[uid].userName?users[uid].userName:users[uid].username
      listaUsuarios.push({uid, username}) //OBTENER TAMBIEN EL ULTIMO MENSAJE
    }
  });
  res.send(listaUsuarios)
})

app.post('/rsc/sendmessage', async (req,res)=>{
  const myUserId = auth.currentUser;
  const mensaje = req.body.msgContent
  const basededatos = getDatabase(iniciar,'https://realtimechatbypera-default-rtdb.firebaseio.com/')
  const refDatabase = ref(basededatos, `messages`)
  const almacenarMensaje = ref(basededatos, `messages/users/${myUserId.uid}/messages`)
  const refADB = ref(basededatos, `messages/users/${myUserId.uid}`)
  const searchAll = query(refADB, limitToLast(10), /*orderByChild('fecha') orderByChild('autor'), equalTo('Juan')*/)
  const searchMsg = query(almacenarMensaje)
  const getMsgSize = async () => {
    const snapshot = await get(searchMsg)
    return snapshot.size
  }
  
  const msgSize = await getMsgSize()
  const nuevoID = `messageId${msgSize + 1}`
  console.log(msgSize)
  console.log(nuevoID)  

  if(msgSize == 0){
    let horario = Date.now()
    let horarioObj = new Date(horario)
    let timestamp = new Date().toISOString()
    let horarioFix = horarioObj.toLocaleString()
    console.log('Creando nueva base de datos')
    update(refADB,{
      email:myUserId.email,
      messages:{
          [nuevoID]:{
            "senderId": myUserId.uid,
            "receiverId": req.body.sendTo,
            "content": mensaje,
            'date': horarioFix,
            'timestamp': timestamp
          }
      },
      userID: myUserId.uid,
      userName: myUserId.displayName?myUserId.displayName:myUserId.email
  })
  }
  else{
    let horario = Date.now()
    let horarioObj = new Date(horario)
    let timestamp = new Date().toISOString()
    let horarioFix = horarioObj.toLocaleString()
    update(almacenarMensaje,{
      [nuevoID]:{/* id autogenerado? */
      "senderId": myUserId.uid,
      "receiverId": req.body.sendTo,
      "content": mensaje,
      'date': horarioFix,
      'timestamp': timestamp
      }
    })
  }
})

httpServer.listen(3001)
console.log('la cosa ha iniciado')