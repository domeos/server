package org.domeos.api.model.ci;

import org.apache.commons.lang.StringUtils;
import org.domeos.client.kubernetesclient.util.TimeoutResponseHandler;

import javax.websocket.Session;
import java.io.IOException;

/**
 * Created by feiliu206363 on 2015/12/6.
 */
public class ContainerLogHandler extends TimeoutResponseHandler<String> {
    private boolean stop;
    private Session session;

    public ContainerLogHandler(Session session) {
        this.session = session;
    }

    public boolean isStop() {
        return stop;
    }

    public void setStop(boolean stop) {
        this.stop = stop;
    }

    public Session getSession() {
        return session;
    }

    public void setSession(Session session) {
        this.session = session;
    }

    @Override
    public boolean handleResponse(String unit) throws IOException {
        if (StringUtils.isBlank(unit)) {
            return !stop;
        }
        session.getBasicRemote().sendText(unit + "\n");
        return !stop;
    }
}
