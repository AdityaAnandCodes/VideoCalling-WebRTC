import React,{useMemo} from 'react';
import {io} from 'socket.io-client';
const SocketContext = React.createContext(null);

export const useSocket = () => {
    const context = React.useContext(SocketContext);
    if (!context) {
      throw new Error(`useSocket must be used within a SocketProvider`);
    }
    return context;
  }

export const SocketProvider = (props) =>{
    const socket = useMemo(() => io('http://localhost:8001'),[]);
    return(
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    )
}