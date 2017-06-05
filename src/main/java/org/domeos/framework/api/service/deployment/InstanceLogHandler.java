package org.domeos.framework.api.service.deployment;

import org.domeos.framework.api.model.deployment.InstanceConnection;
import org.domeos.framework.engine.websocket.SocketSessionHandler;
import org.domeos.framework.engine.websocket.WebSocketConnectPool;
import org.domeos.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;

/**
 * Created by feiliu206363 on 2017/2/8.
 */
@Component
public class InstanceLogHandler extends TextWebSocketHandler {
    private static Logger logger = LoggerFactory.getLogger(InstanceLogHandler.class);
    private InstanceConnection connection = new InstanceConnection();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        logger.info("Opened new session in instance " + this);
        SocketSessionHandler.newInstance().addSession(session);

        if (!StringUtils.isBlank(session.getUri().getQuery())) {
            String[] queryString = session.getUri().getQuery().split("&");
            int clusterId = 0;
            String namespace = null, podName = null, containerName = null;
            for (String param : queryString) {
                String kv[] = param.split("=");
                if ("clusterid".equals(kv[0].toLowerCase())) {
                    clusterId = Integer.valueOf(kv[1]);
                }
                if ("namespace".equals(kv[0].toLowerCase())) {
                    namespace = kv[1];
                }
                if ("instancename".equals(kv[0].toLowerCase())) {
                    podName = kv[1];
                }
                if ("containername".equals(kv[0].toLowerCase())) {
                    containerName = kv[1];
                }
            }
            if (clusterId > 0) {
                connection.setClusterId(clusterId);
                connection.setSession(session);
                connection.setNamespace(namespace);
                connection.setPodName(podName);
                connection.setContainerName(containerName);
                try {
                    WebSocketConnectPool.INSTANCE.addConnection(connection);
                } catch (Exception e) {
                    try {
                        session.sendMessage(new TextMessage(e.getMessage()));
                        logger.error("send instance log realtime message error, " + e.getMessage());
                    } catch (IOException e1) {
                        logger.error("send instance log realtime message error, " + e.getMessage());
                    }
                }
            } else {
                try {
                    session.sendMessage(new TextMessage("parameter error, project id or build id is null"));
                } catch (IOException e) {
                    logger.error("send build log realtime message error, " + e.getMessage());
                }
            }
        }
        logger.info("open connection, query string is " + session.getUri());
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        WebSocketConnectPool.INSTANCE.removeConnection(connection);
        session.close(CloseStatus.SERVER_ERROR);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        logger.info("Close session in instance, sessionId = " + session.getId());
        SocketSessionHandler.newInstance().removeSession(session.getId());
        WebSocketConnectPool.INSTANCE.removeConnection(connection);
    }
}
