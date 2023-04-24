import React from "react";
import './MainPage.css'
import userImg from './imgTest.jpg'  //THIS WILL NOT WORK
import ondas from './ondas.svg'
import { useEffect, useState, useRef } from "react";
import io from 'socket.io-client';

const MainPage = ()=>{

    const [userInfo, setUserInfo] = useState({})
    const [allUsers, setAllUsers] = useState({})
    const [arrayMensajes, setArrayMensajes] = useState([])
    const [temporalSendId, setTemporalSendId] = useState(0)
    const arrayMensajesRef = useRef(arrayMensajes);

    let emisionEnviada = false;

    let messagesReceived = true;
    let timestamp = [];

    
    useEffect(()=>{

        fetch('http://localhost:3001/rsc/obtainmyuserdata',{
            method:"GET"
        })
        .then(res => res.json())
        .then(data => {
            console.log(data)
            setUserInfo({
                'username': data.userName,
                'userID': data.userID,
                'userImage': data.userImage
            })
        })
        .then(()=>{
            fetch('http://localhost:3001/rsc/obtainusers',{
                method:"GET"
            })
            .then(res => res.json())
            .then(data => {
                console.log('----------------------------')
                let lista = data.map((elemento, index) =>{
                    console.log(elemento.uid == userInfo.userID)
                    return{
                        userName: elemento.username,
                        userUID: elemento.uid
                    }
                })
                setAllUsers(lista)
            })
        })
    

    
       //socket.on('connect', () => {
       //  console.log('socket conectado en tiempo real');
       //});
    
    },[])

    const UserMessageSchema = ()=>{

        const UserSchema = (props) =>{

            const requestMessages = async () =>{
              const socket = io('http://localhost:3001');
              messagesReceived = true
              timestamp = []
              //const socket = io('http://localhost:3001');
              socket.on('messages', (data) => {
                //console.log(emisionEnviada)
                //console.log(timestamp.length)
                if(timestamp.length !=0){
                  console.log('esto se ejecuta')
                  emisionEnviada = true;
                  messagesReceived = false
                }
                if (!emisionEnviada) {
                  console.log('emision enviada --------')
                  // Procesar los mensajes recibidos
                  data.mensajesEnviados.map(format => {
                    timestamp.push(format);
                  });
                  data.mensajesRecibidos.map(format => {
                    timestamp.push(format);
                  });

                  timestamp.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

                  setArrayMensajes(timestamp)
                }
              });

              fetch('http://localhost:3001/rsc/obtainmessages', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({id:temporalSendId !== 0? temporalSendId: null})
              })

            }

            return(
                    <div className="userMessageSchema" key={props.index} onClick={()=>{
                            setTemporalSendId(props.id);
                            console.log(temporalSendId);
                            console.log('aca abajo id')
                            console.log(props.id)
                            if(temporalSendId !== 0){
                                requestMessages()
                            }
                            else{console.log('algo ha fallado, intentalo de nuevo')}
                         }}>
                        <div className="ImgUserSchemaCont">
                            <img className="imgUserSchema" src={userImg}/>
                        </div>
                        <div className="textUserMsgSchema">
                            <div className="userNameSchema">{props.usuario}</div>
                            <div className="lastMessageSchema">Ultimo mensaje Ultimo mensaje Ultimo mensaje Ultimo mensaje Ultimo mensaje</div> {/*obtener ultimo mensaje de allUsers*/}
                        </div>
                    </div>
            )
        }

        return(
            allUsers.length > 0 ? allUsers.map((user, index)=>{
                if(user.userUID !== userInfo.userID){
                  return(  <UserSchema usuario={user.userName} id={user.userUID} key={index}/> )
                }
            }) : <p>Cargando...</p>
        )
    }

    useEffect(() => {
      const socket = io('http://localhost:3001');
      socket.on('nuevoMensajeEnviado', (data) => {
        console.log('message send ------')
        console.log(data.mensajeid)
        console.log(arrayMensajesRef.current[arrayMensajesRef.current.length - 1]?.mensajeid)
        if (data.mensajeid !== arrayMensajesRef.current[arrayMensajesRef.current.length - 1]?.mensajeid) {
          setArrayMensajes(prevArray => {
            const newArray = [...prevArray, data];
            arrayMensajesRef.current = newArray;
            return newArray;
          });
        }
      });
      socket.on('nuevoMensajeRecibido', (data) => {
        console.log('message recivered ------')
        console.log(data.mensajeid)
        console.log(arrayMensajesRef.current[arrayMensajesRef.current.length - 1]?.mensajeid)
        if (data.mensajeid !== arrayMensajesRef.current[arrayMensajesRef.current.length - 1]?.mensajeid) {
          setArrayMensajes(prevArray => {
            const newArray = [...prevArray, data];
            arrayMensajesRef.current = newArray;
            return newArray;
          });
        }
      });
    }, []);
    
    

    const MensajeriaSchema = () => {
        //const [mensajes, setMensajes] = useState([]);
      
        const MensajeEnviadoSchema = (props) => {
          return (
            <div className="sendedMSG">  
              <div className="userMsgContentMP">
                {props.contenido}
              </div>
            </div>
          );
        }

        const MensajeRecibidoSchema = (props) => {
            return (
              <div className="recivedMSG">  
                <div className="userMsgContentMP">
                  {props.contenido}
                </div>
              </div>
            );
          }
      
        return (
          <div className="mensajesCont">
            <div className="userTalkingMP">
              <div>User de Prueba 1</div>
              <div className="JustAseparator"></div>
            </div>
            <div className="msgContentMP">
              {arrayMensajes.map((mensaje, index) => {
                if(mensaje.tipo == 'recibido'){
                    return(
                        <MensajeRecibidoSchema
                        key={index}
                        contenido={mensaje.contenido}
                        fecha={mensaje.fecha}
                      />
                    )
                }
                else if(mensaje.tipo == 'enviado'){
                    return(
                        <MensajeEnviadoSchema
                        key={index}
                        contenido={mensaje.contenido}
                        fecha={mensaje.fecha}
                      />
                    )
                }
                else{
                    console.log('tipo de mensaje invalido')
                }
                })}
            </div>
          </div>
        );
      }

    const MyProfileSchema = (props) =>{
        return(
            <div className="MPminiSchema">
                <div className="ImgMPminiCont">
                    <img className="imgMPmini" src={userImg}/>
                </div>
                <div className="textMPmini">
                    <div className="MPminiName">{props.userName}</div>
                    <div className="MPminiStatus">Conectado</div>
                </div>
            </div>
        )
    }

    const SendMessageInput = () =>{
        const [messageContent, setMessageContent] = useState('');
        const handleSendClick = () => {
            if(messageContent.length != 0){
                fetch('http://localhost:3001/rsc/sendmessage', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ msgContent: messageContent, sendTo: temporalSendId }),
                  })
                  // Después de enviar el mensaje, borra el texto del textarea y el valor del useState
                    setMessageContent('');
            }
        };
      
        return(
          <>
            <textarea className='msgcontentMP' type="text" placeholder="Escribe tu mensaje"  value={messageContent} onChange={event => {setMessageContent(event.target.value);console.log(event.target.value)}} />
            <input type="button" value='enviar' onClick={handleSendClick} className="btnSendMP" />
          </>
        )
      }
      

    return(
        <div className="containerMainPage">
            <div className="navMainPage">
                    Mensajeria
            </div>
            <div className="mainContentMP">
                <div className="left">
                    <div>
                        <UserMessageSchema/>
                    </div>
                    <div className="myProfileMP">
                        <MyProfileSchema userName={userInfo.username}/>
                    </div>
                </div>
                <div className="right">
                    <MensajeriaSchema/>
                    <div className="btnContMP">
                    <SendMessageInput/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export {MainPage}