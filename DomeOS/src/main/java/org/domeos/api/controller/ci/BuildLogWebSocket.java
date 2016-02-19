package org.domeos.api.controller.ci;

import org.apache.commons.lang3.StringUtils;
import org.domeos.api.model.ci.BuildConnection;
import org.domeos.api.model.ci.WebSocketConnectPool;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.server.standard.SpringConfigurator;

import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;

/**
 * Created by feiliu206363 on 2015/12/4.
 */
@ServerEndpoint(value = "/api/ci/build/log/realtime", configurator = SpringConfigurator.class)
public class BuildLogWebSocket {

    private Logger logger = LoggerFactory.getLogger(BuildLogWebSocket.class);
    private BuildConnection connection = new BuildConnection();

    @OnOpen
    public void onOpen(Session session) {
        if (!StringUtils.isBlank(session.getQueryString())) {
            String[] queryString = session.getQueryString().split("&");
            int buildId = 0;
            for (String param : queryString) {
                String kv[] = param.split("=");
                if ("buildid".equals(kv[0].toLowerCase())) {
                    buildId = Integer.valueOf(kv[1]);
                }
            }
            if (buildId > 0) {
                connection.setBuildId(buildId);
                connection.setSession(session);
                try {
                    WebSocketConnectPool.INSTANCE.addConnection(connection);
                } catch (Exception e) {
                    try {
                        session.getBasicRemote().sendText(e.getMessage());
                        logger.error("send build log realtime message error, " + e.getMessage());
                    } catch (IOException e1) {
                        logger.error("send build log realtime message error, " + e.getMessage());
                    }
                }
            } else {
                try {
                    session.getBasicRemote().sendText("parameter error, project id or build id is null");
                } catch (IOException e) {
                    logger.error("send build log realtime message error, " + e.getMessage());
                }
            }
        }
        logger.info("open connection, query string is " + session.getQueryString());
    }

    @OnClose
    public void onClose() {
        WebSocketConnectPool.INSTANCE.removeConnection(connection);
    }

    @OnMessage
    public void onMessage(String message, Session session) {
    }

    @OnError
    public void onError(Throwable t) {
        logger.warn("build message pass error, message is " + t.getMessage());
        WebSocketConnectPool.INSTANCE.removeConnection(connection);
    }
}
