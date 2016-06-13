package org.domeos.client.kubernetesclient.restclient;

/**
 * Created by anningluo on 15-11-24.
 */

import org.apache.http.HttpHost;
import org.apache.http.HttpRequest;
import org.apache.http.client.HttpRequestRetryHandler;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.conn.ConnectTimeoutException;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.apache.http.protocol.HttpContext;

import javax.net.ssl.SSLException;
import java.io.IOException;
import java.io.InterruptedIOException;
import java.net.UnknownHostException;
import java.util.Properties;
import java.util.concurrent.TimeUnit;


public class KubeRESTClient {
    private static CloseableHttpClient httpClient = initHttpClient();
    private static PoolingHttpClientConnectionManager connectionManager;
    private static HttpRequestRetryHandler retryHandler;
    private static IdleConnectionMonitorThread monitorThread;
    // private static ConnectionKeepAliveStrategy keepAliveStrategy;

    private String  apiServerHost;
    private int     apiServerPort;

    private static boolean configure(Properties conf) {
        return true;
    }
    private static CloseableHttpClient initHttpClient() {
        // connection manager
        connectionManager = new PoolingHttpClientConnectionManager();
        connectionManager.setMaxTotal(1000);
        connectionManager.setDefaultMaxPerRoute(50);

        // connection monitor thread
        monitorThread = new IdleConnectionMonitorThread();
        monitorThread.start();

        /*
        // connection keep alive
        keepAliveStrategy = new ConnectionKeepAliveStrategy() {
            @Override
            public long getKeepAliveDuration(HttpResponse httpResponse, HttpContext httpContext) {
                return 0;
            }
        }
        */

        // retry handler
        retryHandler = new RestClientRetryHandler(3);

        return HttpClients.custom()
                .setConnectionManager(connectionManager)
                .setRetryHandler(retryHandler)
                .build();
    }

    private static class IdleConnectionMonitorThread extends Thread {
        private volatile boolean shutdown;
        private long monitorPeriod = 1000;  // in milliseconds
        private long maxIdle = monitorPeriod * 30;  // in milliseconds
        @Override
        public void run() {
            try {
                while (!shutdown) {
                    synchronized (this) {
                        wait(monitorPeriod);
                        connectionManager.closeExpiredConnections();
                        connectionManager.closeIdleConnections(maxIdle, TimeUnit.MILLISECONDS);
                        //  e.printStackTrace();
                        connectionManager.closeExpiredConnections();
                    }
                }
            } catch (InterruptedException e) {
                return;
            }
        }
        public void shutdown() {
            shutdown = true;
            synchronized (this) {
                notifyAll();
            }
        }
    }
    static class RestClientRetryHandler implements HttpRequestRetryHandler {
        int retryMaxTimes;
        RestClientRetryHandler(int retryMaxTimes) {
            this.retryMaxTimes = retryMaxTimes;
        }

        @Override
        public boolean retryRequest(
                IOException exception,
                int executionCount,
                HttpContext context) {
            if (executionCount > retryMaxTimes) {
                return false;
            }
            if (exception instanceof InterruptedIOException) {
                // Timeout
                return false;
            }
            if (exception instanceof UnknownHostException) {
                // Unknown host
                return false;
            }
            if (exception instanceof ConnectTimeoutException) {
                // Connection refused
                return false;
            }
            if (exception instanceof SSLException) {
                // SSL handshake exception
                return false;
            }
            // consider all other exception is idempotent
            return true;
        }
    }

    public KubeRESTClient(String apiServer) {
        int sep = apiServer.indexOf(':');
        apiServerHost = apiServer.substring(0, sep);
        apiServerPort = Integer.parseInt(apiServer.substring(sep + 1));
    }

    public KubeRequest get() {
        return KubeRequest.get(this, null).host(apiServerHost).port(apiServerPort);
    }
    public KubeRequest post() {
        return KubeRequest.post(this, null).host(apiServerHost).port(apiServerPort);
    }
    public KubeRequest put() {
        return KubeRequest.put(this, null).host(apiServerHost).port(apiServerPort);
    }
    public KubeRequest patch() {
        return KubeRequest.patch(this, null).host(apiServerHost).port(apiServerPort);
    }
    public KubeRequest delete() {
        return KubeRequest.delete(this, null).host(apiServerHost).port(apiServerPort);
    }
    public KubeRequest options() {
        return KubeRequest.options(this, null).host(apiServerHost).port(apiServerPort);
    }

    public CloseableHttpResponse Do(HttpHost host, HttpRequest request, HttpContext context) throws IOException {
        return httpClient.execute(host, request, context);
    }
    public CloseableHttpResponse Do(HttpHost host, HttpRequest request) throws IOException {
            return httpClient.execute(host, request);
    }
    public <T> T Do(HttpHost httpHost, HttpRequest request, ResponseHandler<T> handler) throws IOException {
        return httpClient.execute(httpHost, request, handler);
    }
}
