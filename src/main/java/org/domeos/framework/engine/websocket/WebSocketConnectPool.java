package org.domeos.framework.engine.websocket;

import java.util.LinkedList;
import java.util.List;

/**
 * Created by feiliu206363 on 2015/12/4.
 */
public enum WebSocketConnectPool {

    INSTANCE;

    private static List<Connection> connections = new LinkedList<>();

    public void addConnection(Connection connection) throws Exception {
        connections.add(connection);
        connection.sendMessage();
    }

    public void removeConnection(Connection connection) {
        connection.stopMessage();
        connections.remove(connection);
    }
}
