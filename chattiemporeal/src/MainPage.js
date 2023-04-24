import React from "react";
import './MainPage.css'
import userImg from './imgTest.jpg'  //THIS WILL NOT WORK
import ondas from './ondas.svg'
import { useEffect, useState, useRef } from "react";
import io from 'socket.io-client';
import { MyProfileSchema } from "./MyProfile";
import { MensajeEnviadoSchema, MensajeRecibidoSchema } from "./Mensajeria";
import UserList from "./UserList";

const MainPage = ()=>{

    const [userInfo, setUserInfo] = useState({})
    const [allUsers, setAllUsers] = useState({})
    const [arrayMensajes, setArrayMensajes] = useState([])
    const [temporalSendId, setTemporalSendId] = useState(0)
    const arrayMensajesRef = useRef(arrayMensajes);
    const [isLoading, setIsLoading] = useState(true);

    let emisionEnviada = false;
    let messagesReceived = true;
    let timestamp = [];

    const requestMessages = async () =>{
      const socket = io('http://localhost:3001');
      messagesReceived = true
      timestamp = []
      socket.on('messages', (data) => {
        if(timestamp.length !=0){
          console.log('esto se ejecuta')
          emisionEnviada = true;
          messagesReceived = false
        }
        if (!emisionEnviada) {
          console.log('emision enviada --------')
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

    useEffect(() => {

    }, []);

    
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
        //.then(()=>{
        //  fetch('http://localhost:3001/rsc/obtainusers')
        //  .then(res => res.json())
        //  .then(data => {
        //    console.log(data)
        //    const userList = data
        //      .filter(user => user.uid !== userInfo.userID)
        //      .map(user => ({
        //        userName: user.username,
        //        userUID: user.uid
        //      }));
        //    setAllUsers(userList);
        //    setIsLoading(false);
        //  })
        //  .catch(error => console.error(error));
        //})
    },[])

    useEffect(() => {
      console.log('reconocido')
      fetch('http://localhost:3001/rsc/obtainusers')
        .then(res => res.json())
        .then(data => {
          const userList = data
            .filter(user => user.uid !== userInfo.userID)
            .map(user => ({
              userName: user.username,
              userUID: user.uid
            }));
          setAllUsers(userList);
          setIsLoading(false);
        })
        .catch(error => console.error(error));
    }, [userInfo.userID]);
    

    const UserMessageSchema = ()=>{

        const UserSchema = (props) =>{
            return(
                    <div className="userMessageSchema" key={props.index} onClick={()=>{
                            setTemporalSendId(props.id);
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
          return (
            <>
              {isLoading ? (
                <p>Cargando...</p>
              ) : (
                allUsers
                  .filter(user => user.userUID !== userInfo.userID)
                  .map(user => (
                    <UserSchema key={user.userUID} id={user.userUID} usuario={user.userName} />
                  ))
              )}
            </>
          );
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

    const SendMessageInput = () =>{
        const [messageContent, setMessageContent] = useState('');
        const handleSendClick = () => {
            if(messageContent.length != 0){
                fetch('http://localhost:3001/rsc/sendmessage', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ msgContent: messageContent, sendTo: temporalSendId }),
                  })
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