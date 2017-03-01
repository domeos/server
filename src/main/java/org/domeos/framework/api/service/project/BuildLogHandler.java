package org.domeos.framework.api.service.project;

import org.domeos.framework.api.model.ci.BuildConnection;
import org.domeos.framework.engine.model.JobType;
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
public class BuildLogHandler extends TextWebSocketHandler {
    private static Logger logger = LoggerFactory.getLogger(BuildLogHandler.class);
    private BuildConnection connection = new BuildConnection();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        if (!StringUtils.isBlank(session.getUri().getQuery())) {
            String[] queryString = session.getUri().getQuery().split("&");
            int buildId = 0;
            String type = JobType.PROJECT.name().toLowerCase();
            for (String param : queryString) {
                String kv[] = param.split("=");
                if ("buildid".equals(kv[0].toLowerCase())) {
                    buildId = Integer.valueOf(kv[1]);
                }
                if ("type".equals(kv[0].toLowerCase())) {
                    type = kv[1];
                }
            }
            if (buildId > 0) {
                connection.setBuildId(buildId);
                connection.setSession(session);
                if (type.equals(JobType.BASEIMAGE.name().toLowerCase())) {
                    connection.setJobType(JobType.BASEIMAGE);
                } else {
                    connection.setJobType(JobType.PROJECT);
                }
                try {
                    WebSocketConnectPool.INSTANCE.addConnection(connection);
                } catch (Exception e) {
                    try {
                        session.sendMessage(new TextMessage(e.getMessage()));
                        logger.error("send build log realtime message error, " + e.getMessage());
                    } catch (IOException e1) {
                        logger.error("send build log realtime message error, " + e.getMessage());
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
        WebSocketConnectPool.INSTANCE.removeConnection(connection);
        SocketSessionHandler.newInstance().removeSession(session.getId());
    }
}
