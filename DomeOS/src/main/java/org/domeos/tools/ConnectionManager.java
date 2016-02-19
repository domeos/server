package org.domeos.tools;

import org.apache.http.client.config.RequestConfig;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.apache.log4j.Logger;
import org.domeos.global.ClientConfigure;

import java.io.IOException;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class ConnectionManager {
    private static Logger logger = Logger.getLogger(ConnectionManager.class
            .getName());
    private CloseableHttpClient httpClient = null;
    private RequestConfig requestConfig = null;
    private ScheduledExecutorService scheduler = null;
    private PoolingHttpClientConnectionManager cm = null;
    private int timeout = 20000;

    public ConnectionManager() {
        Init();
    }
    public ConnectionManager(int timeoutInMs) {
        this.timeout = timeoutInMs;
        Init();
    }
    public void Init() {
        cm = new PoolingHttpClientConnectionManager();
        // Increase max total connection to 200
        cm.setMaxTotal(ClientConfigure.DEFAULT_TOTAL_CONNECTION);
        // Increase default max connection per route to 20
        cm.setDefaultMaxPerRoute(ClientConfigure.DEFAULT_MAX_CONNECTIONS_PER_ROUTE);

        httpClient = HttpClients.custom().setConnectionManager(cm).build();

        requestConfig = RequestConfig.custom().setSocketTimeout(this.timeout)
                .setConnectTimeout(this.timeout)
                .setConnectionRequestTimeout(this.timeout)
                .setRedirectsEnabled(false).setCircularRedirectsAllowed(true)
                .build();

        scheduler = Executors.newScheduledThreadPool(1);
        scheduler.scheduleAtFixedRate(new IdleConnectionMonitor(cm),
                ClientConfigure.initialDelay, ClientConfigure.heartbeatPeriod,
                TimeUnit.SECONDS);
    }

    public CloseableHttpClient getHttpClient() {
        return this.httpClient;
    }

    public RequestConfig getRequestConfig() {
        return requestConfig;
    }

    private final class IdleConnectionMonitor implements Runnable {
        PoolingHttpClientConnectionManager connectionManager;

        public IdleConnectionMonitor(
                PoolingHttpClientConnectionManager connectionManager) {
            this.connectionManager = connectionManager;
        }

        @Override
        public void run() {
            /*if (logger.isInfoEnabled())
            {
                logger.info("release start connect count:="
                        + connectionManager.getTotalStats().getAvailable());
            }*/

            // Close expired connections
            boolean print = false;
            if (connectionManager.getTotalStats().getLeased() > 5) {
                print = true;
            }
            if (print) {
                logger.info("connectionManager.status before clean:" + connectionManager.getTotalStats().toString());
            }
            connectionManager.closeExpiredConnections();
            // Optionally, close connections
            // that have been idle longer than readTimeout*2 MILLISECONDS
            connectionManager.closeIdleConnections(
                    ClientConfigure.IdleConnectionTimeout, TimeUnit.SECONDS);
            if (print) {
                logger.info("connectionManager.status after clean:" + connectionManager.getTotalStats().toString());
            }
         /*   if (logger.isInfoEnabled())
            {
                logger.info("release end connect count:="
                        + connectionManager.getTotalStats().getAvailable());
            }*/

        }
    }

    public void destroy() {
        if (this.httpClient != null) {
            try {
                this.httpClient.close();
            } catch (IOException e) {
                logger.error(e);
            }
        }
        this.scheduler.shutdown();
    }
}
