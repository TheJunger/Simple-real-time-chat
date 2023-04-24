import React from "react";

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

export {MensajeEnviadoSchema, MensajeRecibidoSchema}